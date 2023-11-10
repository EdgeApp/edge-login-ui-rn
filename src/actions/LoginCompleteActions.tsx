import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Keyboard } from 'react-native'
import { sprintf } from 'sprintf-js'

import { lstrings } from '../common/locales/strings'
import { ButtonsModal } from '../components/modals/ButtonsModal'
import { Airship } from '../components/services/AirshipInstance'
import * as Constants from '../constants/index'
import {
  enableTouchId,
  isTouchDisabled,
  isTouchEnabled,
  supportsTouchId
} from '../keychain'
import { Dispatch, GetState, Imports } from '../types/ReduxTypes'
import { hasSecurityAlerts } from '../util/hasSecurityAlerts'
import { checkAndRequestNotifications } from './LoginInitActions'

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
    await twofaReminder(account)
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
  const { onLogin } = imports

  account.watch('loggedIn', loggedIn => {
    if (!loggedIn) dispatch({ type: 'RESET_APP' })
  })

  const touchDisabled = await isTouchDisabled(account)
  if (!touchDisabled) {
    await enableTouchId(account).catch(e => {
      console.log(e) // Fail quietly
    })
  }

  const isTouchSupported = await supportsTouchId()
  const touchEnabled = await isTouchEnabled(account)
  const touchIdInformation = {
    isTouchSupported,
    isTouchEnabled: touchEnabled
  }

  if (onLogin != null) onLogin(account, touchIdInformation)

  if (imports.customPermissionsFunction != null) {
    imports.customPermissionsFunction()
  } else {
    await dispatch(
      checkAndRequestNotifications(imports.branding ?? {})
    ).catch(error => console.log(error))
  }

  // Hide all modals and scenes:
  Airship.clear()
  dispatch({ type: 'NAVIGATE', data: { name: 'loading', params: '' } })
}

async function twofaReminder(account: EdgeAccount) {
  const { otpKey, dataStore, username } = account
  if (username == null) return

  const pluginList = await dataStore.listStoreIds()
  const storeName = pluginList.includes(Constants.OTP_REMINDER_STORE_NAME)
    ? Constants.OTP_REMINDER_STORE_NAME
    : null
  const itemList = storeName
    ? await dataStore.listItemIds(Constants.OTP_REMINDER_STORE_NAME)
    : null
  const createdAtString =
    itemList && itemList.includes(Constants.OTP_REMINDER_KEY_NAME_CREATED_AT)
      ? await dataStore.getItem(
          Constants.OTP_REMINDER_STORE_NAME,
          Constants.OTP_REMINDER_KEY_NAME_CREATED_AT
        )
      : null
  const createdAt = createdAtString ? parseInt(createdAtString) : null
  const reminderCreatedAtDate = createdAt
    ? createdAt + Constants.OTP_REMINDER_MILLISECONDS
    : null
  const lastOtpCheckString =
    itemList &&
    itemList.includes(Constants.OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED)
      ? await dataStore.getItem(
          Constants.OTP_REMINDER_STORE_NAME,
          Constants.OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED
        )
      : null
  const lastOtpCheck = lastOtpCheckString ? parseInt(lastOtpCheckString) : null
  const reminderLastOtpCheckDate = lastOtpCheck
    ? lastOtpCheck + Constants.OTP_REMINDER_MILLISECONDS
    : null
  const dontAsk =
    itemList && itemList.includes(Constants.OTP_REMINDER_KEY_NAME_DONT_ASK)
      ? await dataStore.getItem(
          Constants.OTP_REMINDER_STORE_NAME,
          Constants.OTP_REMINDER_KEY_NAME_DONT_ASK
        )
      : null

  const enableOtp = async (account: EdgeAccount) => {
    await account.enableOtp()
    return await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={lstrings.otp_authentication_header}
        message={sprintf(lstrings.otp_authentication_message, account.otpKey)}
        buttons={{ ok: { label: lstrings.ok } }}
      />
    ))
  }

  const createOtpCheckModal = async () => {
    Keyboard.dismiss()
    const result = await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={lstrings.otp_reset_modal_header}
        message={lstrings.otp_reset_modal_message}
        buttons={{
          yes: { label: lstrings.enable },
          no: { label: lstrings.skip_button, type: 'secondary' }
        }}
      />
    ))
    return result === 'yes'
  }

  const createOtpCheckModalDontAsk = async () => {
    Keyboard.dismiss()
    return await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={lstrings.otp_reset_modal_header}
        message={lstrings.otp_reset_modal_message}
        buttons={{
          enable: { label: lstrings.enable, type: 'primary' },
          cancel: { label: lstrings.skip_button, type: 'secondary' },
          dontAsk: {
            label: lstrings.otp_reset_modal_dont_ask,
            type: 'secondary'
          }
        }}
      />
    ))
  }

  if (otpKey) {
    return true
  }

  if (dontAsk) {
    return true
  }

  if (!storeName) {
    const resolve = await createOtpCheckModal()
    if (resolve) {
      await enableOtp(account)
      await account.dataStore.setItem(
        Constants.OTP_REMINDER_STORE_NAME,
        Constants.OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
        Date.now().toString()
      )
      return true
    }
    await account.dataStore.setItem(
      Constants.OTP_REMINDER_STORE_NAME,
      Constants.OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
      Date.now().toString()
    )
    return false
  }

  if (
    lastOtpCheckString &&
    lastOtpCheck &&
    reminderLastOtpCheckDate &&
    Date.now() > reminderLastOtpCheckDate
  ) {
    const resolve = await createOtpCheckModalDontAsk()
    if (resolve === 'enable') {
      await enableOtp(account)
      return true
    }
    if (resolve === 'dontAsk') {
      await account.dataStore.setItem(
        Constants.OTP_REMINDER_STORE_NAME,
        Constants.OTP_REMINDER_KEY_NAME_DONT_ASK,
        'true'
      )
      return false
    }
    await account.dataStore.setItem(
      Constants.OTP_REMINDER_STORE_NAME,
      Constants.OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
      Date.now().toString()
    )
    return false
  }

  if (lastOtpCheckString) {
    return true
  }

  if (
    createdAtString &&
    createdAt &&
    reminderCreatedAtDate &&
    Date.now() > reminderCreatedAtDate
  ) {
    const resolve = await createOtpCheckModal()
    if (resolve) {
      await enableOtp(account)
      await account.dataStore.setItem(
        Constants.OTP_REMINDER_STORE_NAME,
        Constants.OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
        Date.now().toString()
      )
      return true
    }
    await account.dataStore.setItem(
      Constants.OTP_REMINDER_STORE_NAME,
      Constants.OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
      Date.now().toString()
    )
    return false
  }

  return true
}
