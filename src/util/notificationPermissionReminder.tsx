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

const logicMap: Array<Array<Array<string | undefined>>> = [
  [[], []],
  [[], []]
]

/*
Logic for showing notification/app refresh request message:

0 = false, 1 = true

         ┌ Notification Enabled
         |  ┌ Notification Blocked
         |  |  ┌ App Refresh Enabled
         |  |  |  */
logicMap[0][0][0] = lstrings.notifications_and_refresh_permissions_branded_s
logicMap[0][0][1] = lstrings.notifications_permissions_branded_s
logicMap[0][1][0] = lstrings.refresh_permission_branded_s
logicMap[0][1][1] = undefined
logicMap[1][0][0] = lstrings.refresh_permission_branded_s
logicMap[1][0][1] = undefined
logicMap[1][1][0] = lstrings.refresh_permission_branded_s
logicMap[1][1][1] = undefined

/**
 * Asks the users for notification permissions, if needed. Returns true if the
 * permissions modal was shown, false if not.
 */
export const showNotificationPermissionReminder = async (
  opts: NotificationPermissionReminderOptions
): Promise<boolean> => {
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

  const statusAppRefresh = await AbcCoreJsUi.backgroundAppRefreshStatus().catch(
    (error: unknown) => console.log(error)
  )
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
    return false
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
  if (choices == null) return true
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
    // Only log enable, not deny/block due to our privacy policy.
    onLogEvent('Permission_Modal_Notification_Enable')
  }

  if (onNotificationPermit != null) onNotificationPermit(newPermissionsInfo)

  return true
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
