import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'

import { lstrings } from '../common/locales/strings'
import { ButtonsModal } from '../components/modals/ButtonsModal'
import { Airship } from '../components/services/AirshipInstance'
import {
  getSupportedBiometryType,
  isTouchEnabled,
  refreshTouchId
} from '../keychain'
import { Dispatch, GetState, Imports } from '../types/ReduxTypes'
import { hasSecurityAlerts } from '../util/hasSecurityAlerts'
import { showNotificationPermissionReminder } from '../util/notificationPermissionReminder'
import { showOtpReminder } from '../util/otpReminder'

/**
 * The user has just logged in, so figure out what do to next.
 */
export const completeLogin = (account: EdgeAccount) => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  // Problem logins:
  const { skipOtpReminder = false, skipSecurityAlerts = false } = imports
  if (!skipSecurityAlerts && hasSecurityAlerts(account)) {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'securityAlert', params: { account } }
    })
    return
  }

  // Recovery logins:
  if (account.recoveryLogin) {
    await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        message={lstrings.recovery_successful}
        buttons={{ ok: { label: lstrings.ok } }}
      />
    ))
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'resecurePassword', params: { account } }
    })
    return
  }

  // Normal logins:
  if (!skipOtpReminder) {
    await showOtpReminder(account)
  }
  dispatch(submitLogin(account))
}

/**
 * Everything is done, and we can pass the account to the outside world.
 */
export const submitLogin = (account: EdgeAccount) => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const {
    branding,
    fastLogin = false,
    onLogEvent,
    onLogin,
    onNotificationPermit
  } = imports

  account.watch('loggedIn', loggedIn => {
    if (!loggedIn) dispatch({ type: 'RESET_APP' })
  })

  if (!fastLogin) {
    await refreshTouchId(account).catch(e => {
      console.log(e) // Fail quietly
    })
  }

  if (onLogin != null) {
    const touchIdInformation = fastLogin
      ? undefined
      : {
          isTouchSupported: (await getSupportedBiometryType()) !== false,
          isTouchEnabled: await isTouchEnabled(account)
        }
    onLogin(account, touchIdInformation)
  }

  if (imports.customPermissionsFunction != null) {
    imports.customPermissionsFunction()
  } else if (!fastLogin) {
    await showNotificationPermissionReminder({
      onLogEvent,
      onNotificationPermit,
      appName: branding?.appName
    }).catch(error => console.log(error))
  }

  // Hide all modals and scenes:
  Airship.clear()
  dispatch({ type: 'NAVIGATE', data: { name: 'loading', params: '' } })
}
