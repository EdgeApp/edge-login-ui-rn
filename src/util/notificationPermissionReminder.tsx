import { asBoolean, asJSON, asMaybe, asObject } from 'cleaners'
import { makeReactNativeDisklet } from 'disklet'
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
import {
  NotificationPermissionReminderOptions,
  NotificationPermissionsInfo
} from '../components/publicApi/publicTypes'
import { Airship } from '../components/services/AirshipInstance'

const { AbcCoreJsUi } = NativeModules
const disklet = makeReactNativeDisklet()
const notificationPermissionsInfoFile = 'notificationsPermisions.json'
const isIos = Platform.OS === 'ios'

//
// Logic for showing notification/app refresh request
//
// 0 = false, 1 = true
// nr = notifications and app refresh request message
// n = notifications request message
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

/**
 * Asks the users for notification permissions, if needed.
 */
export const showNotificationPermissionReminder = async (
  opts: NotificationPermissionReminderOptions
): Promise<void> => {
  const {
    appName = lstrings.app_name_default,
    onLogEvent = () => {},
    onNotificationPermit
  } = opts
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
          appName
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

  if (permissionMessage == null) {
    if (onNotificationPermit != null && notificationPermissionsInfo != null) {
      onNotificationPermit(notificationPermissionsInfo)
    }
    return
  }

  const choiceMap: PermissionsModalChoices = {
    optInPriceChanges: !(
      notificationPermissionsInfo?.notificationOptIns.ignorePriceChanges ??
      false
    ),
    optInMarketing: !(
      notificationPermissionsInfo?.notificationOptIns.ignoreMarketing ?? false
    )
  }
  const choices = await Airship.show<
    Required<PermissionsModalChoices> | undefined
  >(bridge => (
    <RequestPermissionsModal
      bridge={bridge}
      message={permissionMessage}
      choices={choiceMap}
    />
  ))

  console.log(`checkAndRequestNotifications result ${JSON.stringify(choices)}`)

  // Don't do anything if the user didn't make a choice (dismissed modal)
  if (choices == null) return
  const newPermissionsInfo: NotificationPermissionsInfo = {
    isNotificationBlocked: !choices?.enable,
    notificationOptIns: {
      ignoreMarketing: !choices.optInMarketing,
      ignorePriceChanges: !choices.optInPriceChanges
    }
  }

  await disklet.setText(
    notificationPermissionsInfoFile,
    JSON.stringify(newPermissionsInfo)
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
    onLogEvent('Permission_Modal_Notification_Enable')
  } else {
    onLogEvent('Permission_Modal_Notification_Dismiss')
  }

  if (onNotificationPermit != null) onNotificationPermit(newPermissionsInfo)
}

const asNotificationPermissionsInfo = asJSON(
  asObject<NotificationPermissionsInfo>({
    isNotificationBlocked: asBoolean,
    notificationOptIns: asObject({
      ignoreMarketing: asBoolean,
      ignorePriceChanges: asBoolean
    })
  })
)
