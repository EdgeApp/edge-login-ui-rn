import { asMaybe } from 'cleaners'
import { makeReactNativeDisklet } from 'disklet'
import { EdgeLoginMessages } from 'edge-core-js'
import * as React from 'react'
import { NativeModules, Platform } from 'react-native'
import {
  checkNotifications,
  openSettings,
  requestNotifications,
  RESULTS
} from 'react-native-permissions'
import { sprintf } from 'sprintf-js'

import s from '../common/locales/strings'
import {
  PermissionsModalChoices,
  RequestPermissionsModal
} from '../components/modals/RequestPermissionsModal'
import { SecurityAlertsModal } from '../components/modals/SecurityAlertsModal'
import { InitialRouteName } from '../components/publicApi/types'
import { Airship, showError } from '../components/services/AirshipInstance'
import { Branding } from '../types/Branding'
import {
  Action,
  asNotificationPermissionsInfo,
  Dispatch,
  GetState,
  Imports,
  NotificationPermissionsInfo
} from '../types/ReduxTypes'
import { Theme } from '../types/Theme'
import { launchPasswordRecovery } from './LoginAction'
import { loadTouchState } from './TouchActions'

const { AbcCoreJsUi } = NativeModules

const disklet = makeReactNativeDisklet()
const notificationPermissionsInfoFile = 'notificationsPermisions.json'

/**
 * Fires off all the things we need to do to get the login scene up & running.
 */
export const initializeLogin = (
  theme: Theme,
  branding: Branding,
  initialRoute?: InitialRouteName
) => async (dispatch: Dispatch, getState: GetState, imports: Imports) => {
  const { customPermissionsFunction } = imports
  const touchPromise = dispatch(loadTouchState())
  dispatch(checkSecurityMessages()).catch(error => console.log(error))
  customPermissionsFunction
    ? customPermissionsFunction()
    : dispatch(checkAndRequestNotifications(theme, branding)).catch(error =>
        console.log(error)
      )

  await touchPromise
  const state = getState()

  // Loading is done, so send the user to the initial route:
  const biometryType = state.touch.type
  const { startupUser } = state.previousUsers

  if (initialRoute != null) {
    return dispatch(initialRouteNameToAction(initialRoute))
  }

  const { recoveryKey } = imports
  if (recoveryKey) {
    dispatch({ type: 'START_LANDING' })
    dispatch(launchPasswordRecovery(recoveryKey))
  } else if (startupUser == null) {
    dispatch({ type: 'START_LANDING' })
  } else if (
    startupUser.pinEnabled ||
    (startupUser.touchEnabled && biometryType !== false)
  ) {
    dispatch({ type: 'START_PIN_LOGIN' })
  } else {
    dispatch({ type: 'START_PASSWORD_LOGIN' })
  }
}

function initialRouteNameToAction(routeName: InitialRouteName): Action {
  switch (routeName) {
    case 'login-password':
      return {
        type: 'START_PASSWORD_LOGIN'
      }
    case 'new-account':
      return {
        type: 'NEW_ACCOUNT_USERNAME'
      }
  }
}

const checkSecurityMessages = () => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { context } = imports
  const messages = await context.fetchLoginMessages()

  const relevantMessages: EdgeLoginMessages = {}
  for (const username of Object.keys(messages)) {
    const message = messages[username]

    // Skip users who haven't fully logged in:
    const info = context.localUsers.find(info => info.username === username)
    if (info == null || !info.keyLoginEnabled) continue

    const { otpResetPending, pendingVouchers = [] } = message
    if (otpResetPending || pendingVouchers.length > 0) {
      relevantMessages[username] = message
    }
  }

  if (Object.keys(relevantMessages).length > 0) {
    Airship.show(bridge => (
      <SecurityAlertsModal
        bridge={bridge}
        messages={relevantMessages}
        selectUser={username =>
          dispatch({ type: 'AUTH_UPDATE_USERNAME', data: username })
        }
      />
    ))
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

logicMap[0][0][0] = s.strings.notifications_and_refresh_permissions_branded
logicMap[0][0][1] = s.strings.notifications_permissions_branded
logicMap[0][1][0] = s.strings.refresh_permission_branded
logicMap[0][1][1] = undefined
logicMap[1][0][0] = s.strings.refresh_permission_branded
logicMap[1][0][1] = undefined
logicMap[1][1][0] = s.strings.refresh_permission_branded
logicMap[1][1][1] = undefined

const checkAndRequestNotifications = (
  theme: Theme,
  branding: Branding
) => async (dispatch: Dispatch, getState: GetState, imports: Imports) => {
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
          branding.appName
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
