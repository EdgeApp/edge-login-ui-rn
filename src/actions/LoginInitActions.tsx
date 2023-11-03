import { asMaybe } from 'cleaners'
import { makeReactNativeDisklet } from 'disklet'
import { EdgeLoginMessage } from 'edge-core-js'
import * as React from 'react'
import { NativeModules, Platform } from 'react-native'
import {
  checkNotifications,
  openSettings,
  requestNotifications,
  RESULTS
} from 'react-native-permissions'
import { sprintf } from 'sprintf-js'

import { lstrings } from '../common/locales/strings'
import {
  PermissionsModalChoices,
  RequestPermissionsModal
} from '../components/modals/RequestPermissionsModal'
import { SecurityAlertsModal } from '../components/modals/SecurityAlertsModal'
import { Airship, showError } from '../components/services/AirshipInstance'
import { arrangeUsers, upgradeUser } from '../hooks/useLocalUsers'
import { scene as sceneReducer } from '../reducers/SceneReducer'
import { Branding } from '../types/Branding'
import {
  Action,
  asNotificationPermissionsInfo,
  Dispatch,
  GetState,
  Imports,
  NotificationPermissionsInfo,
  RootState
} from '../types/ReduxTypes'
import { launchPasswordRecovery } from './LoginAction'
import { loadTouchState } from './TouchActions'

const { AbcCoreJsUi } = NativeModules

const disklet = makeReactNativeDisklet()
const notificationPermissionsInfoFile = 'notificationsPermisions.json'

/**
 * Fires off all the things we need to do to get the login scene up & running.
 */
export const initializeLogin = () => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const touchPromise = dispatch(loadTouchState())
  dispatch(checkSecurityMessages()).catch(error => console.log(error))

  await touchPromise

  const state = getState()

  // Handle routing using given initialRoute:
  dispatch(routeInitialization(state, imports))

  // Show password recovery if recoveryKey is given:
  const { recoveryKey } = imports
  if (
    (imports.initialRoute == null || imports.initialRoute === 'login') &&
    recoveryKey
  ) {
    dispatch(launchPasswordRecovery(recoveryKey))
  }
}

export const maybeRouteComplete = (fallbackAction: Action) => (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  if (imports.initialRoute == null) {
    dispatch(fallbackAction)
    return
  }

  const state = getState()
  const sceneState = state.scene
  const initialRouteSceneName = sceneReducer(
    sceneState,
    routeInitialization(state, imports)
  ).name

  if (
    imports.onComplete != null &&
    (initialRouteSceneName === sceneState.name ||
      (imports.initialRoute === 'login' && sceneState.name === 'passwordLogin'))
  ) {
    imports.onComplete()
    return
  }

  dispatch(fallbackAction)
}

/**
 * Loading is done, so send the user to the initial route.
 */
function routeInitialization(state: RootState, imports: Imports): Action {
  const {
    context,
    initialUserInfo = arrangeUsers(context.localUsers)[0]
  } = imports
  const { touch } = state

  // Try to find the user requested by the LoginScene props:
  const startupUser =
    initialUserInfo != null ? upgradeUser(initialUserInfo, touch) : undefined

  const defaultInitialRoute = (): Action => {
    const { recoveryKey } = imports
    if (recoveryKey) {
      return {
        type: 'NAVIGATE',
        data: { name: 'landing', params: {} }
      }
    } else if (startupUser == null) {
      return {
        type: 'NAVIGATE',
        data: { name: 'landing', params: {} }
      }
    } else if (
      startupUser.pinLoginEnabled ||
      (startupUser.touchLoginEnabled && touch.type !== false)
    ) {
      return {
        type: 'NAVIGATE',
        data: {
          name: 'pinLogin',
          params: { loginId: startupUser.loginId }
        }
      }
    } else {
      return {
        type: 'NAVIGATE',
        data: {
          name: 'passwordLogin',
          params: { username: startupUser.username ?? '' }
        }
      }
    }
  }

  switch (imports.initialRoute) {
    case 'login':
      return defaultInitialRoute()
    case 'login-password':
      return {
        type: 'NAVIGATE',
        data: {
          name: 'passwordLogin',
          params: { username: startupUser?.username ?? '' }
        }
      }
    case 'login-password-light':
      return {
        type: 'NAVIGATE',
        data: {
          name: 'passwordLogin',
          params: {
            username: startupUser?.username ?? '',
            createAccountType: 'light'
          }
        }
      }
    case 'new-account':
      return {
        type: 'NAVIGATE',
        data: { name: 'newAccountUsername', params: {} }
      }
    case 'new-light-account': // Set pin, modified TOS
      return {
        type: 'NAVIGATE',
        data: { name: 'newAccountPin', params: {} }
      }
    default:
      return defaultInitialRoute()
  }
}

const checkSecurityMessages = () => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { context } = imports
  const messages = await context.fetchLoginMessages()

  const relevantMessages: EdgeLoginMessage[] = []
  for (const message of messages) {
    if (message.username == null) continue

    // Skip users who haven't fully logged in:
    const info = context.localUsers.find(
      info => info.username === message.username
    )
    if (info == null || !info.keyLoginEnabled) continue

    const { otpResetPending, pendingVouchers = [] } = message
    if (otpResetPending || pendingVouchers.length > 0) {
      relevantMessages.push(message)
    }
  }

  if (relevantMessages.length > 0) {
    const username = await Airship.show<string | undefined>(bridge => (
      <SecurityAlertsModal bridge={bridge} messages={relevantMessages} />
    ))
    if (username != null) {
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'passwordLogin', params: { username } }
      })
    }
  }
}

//
// Logic for showing notification/app refresh request
//
// 0 = false, 1 = true
// nr = notifications and app refresh request message
// r = notifications request message
// r = app refresh request only message
//
// | Notif Enabled |  Notif Block | App Refresh Enabled || Message |
// |---------------|--------------|---------------------||---------|
// |       0       |       0      |           0         >>    nr   |
// |       0       |       0      |           1         >>    n    |
// |       0       |       1      |           0         >>    r    |
// |       0       |       1      |           1         >>         |
// |       1       |       0      |           0         >>    r    |
// |       1       |       0      |           1         >>         |
// |       1       |       1      |           0         >>    r    |
// |       1       |       1      |           1         >>         |
//
const isIos = Platform.OS === 'ios'

const logicMap: Array<Array<Array<string | undefined>>> = [
  [[], []],
  [[], []]
]

logicMap[0][0][0] = lstrings.notifications_and_refresh_permissions_branded_s
logicMap[0][0][1] = lstrings.notifications_permissions_branded_s
logicMap[0][1][0] = lstrings.refresh_permission_branded_s
logicMap[0][1][1] = undefined
logicMap[1][0][0] = lstrings.refresh_permission_branded_s
logicMap[1][0][1] = undefined
logicMap[1][1][0] = lstrings.refresh_permission_branded_s
logicMap[1][1][1] = undefined

export const checkAndRequestNotifications = (branding: Branding) => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { onNotificationPermit } = imports
  const notificationPermission = await checkNotifications()
  const notificationStatus = notificationPermission.status
  const notifEnabled =
    notificationStatus !== RESULTS.BLOCKED &&
    notificationStatus !== RESULTS.DENIED
      ? 1
      : 0

  const statusAppRefresh = isIos
    ? await AbcCoreJsUi.backgroundAppRefreshStatus().catch((error: undefined) =>
        console.log(error)
      )
    : undefined
  const refreshEnabled = statusAppRefresh !== RESULTS.BLOCKED ? 1 : 0

  const notificationPermissionsInfoJson = await disklet
    .getText(notificationPermissionsInfoFile)
    .catch(error => console.log(error))
  const notificationPermissionsInfo = asMaybe(asNotificationPermissionsInfo)(
    notificationPermissionsInfoJson
  )
  const isNotificationBlocked = notificationPermissionsInfo
    ? notificationPermissionsInfo.isNotificationBlocked
    : false
  const isNotificationBlockedBit = isNotificationBlocked ? 1 : 0

  const permissionMessage =
    logicMap[notifEnabled][isNotificationBlockedBit][refreshEnabled] != null
      ? sprintf(
          logicMap[notifEnabled][isNotificationBlockedBit][refreshEnabled] ??
            '',
          branding.appName ?? lstrings.app_name_default
        )
      : undefined

  console.log(`checkAndRequestNotifications`)
  console.log(
    `notificationStatus:${notificationStatus} statusAppRefresh:${statusAppRefresh}`
  )
  console.log(
    `notifEnabled:${notifEnabled} notifBlocked:${isNotificationBlockedBit} refreshEnabled:${refreshEnabled}`
  )
  console.log(`permissionMessage:${permissionMessage}`)

  if (permissionMessage != null) {
    const choiceMap: PermissionsModalChoices = {
      optInPriceChanges: !(
        notificationPermissionsInfo?.notificationOptIns.ignorePriceChanges ??
        false
      ),
      optInMarketing: !(
        notificationPermissionsInfo?.notificationOptIns.ignoreMarketing ?? false
      )
    }
    Airship.show<Required<PermissionsModalChoices> | undefined>(bridge => (
      <RequestPermissionsModal
        bridge={bridge}
        message={permissionMessage}
        choices={choiceMap}
      />
    ))
      .then(async choices => {
        console.log(
          `checkAndRequestNotifications result ${JSON.stringify(choices)}`
        )

        // Don't do anything if the user didn't make a choice (dismissed modal)
        if (choices == null) return

        const notificationPermissionsInfo: NotificationPermissionsInfo = {
          isNotificationBlocked: !choices?.enable,
          notificationOptIns: {
            ignoreMarketing: !choices.optInMarketing,
            ignorePriceChanges: !choices.optInPriceChanges
          }
        }

        await disklet.setText(
          notificationPermissionsInfoFile,
          JSON.stringify(notificationPermissionsInfo)
        )

        if (choices.enable) {
          if (notificationStatus === RESULTS.DENIED) {
            requestNotifications(
              isIos ? ['alert', 'badge', 'sound'] : []
            ).catch(error => console.log(error))
          }
          if (
            notificationStatus === RESULTS.BLOCKED ||
            statusAppRefresh === RESULTS.BLOCKED
          ) {
            openSettings().catch(error => console.log(error))
          }
        }

        if (onNotificationPermit != null)
          onNotificationPermit(notificationPermissionsInfo)
      })
      .catch(showError)
  } else {
    if (onNotificationPermit != null && notificationPermissionsInfo != null) {
      onNotificationPermit(notificationPermissionsInfo)
    }
  }
}
