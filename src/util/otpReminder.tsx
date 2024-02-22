import type { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Keyboard } from 'react-native'
import { sprintf } from 'sprintf-js'

import { lstrings } from '../common/locales/strings'
import { ButtonsModal } from '../components/modals/ButtonsModal'
import { Airship } from '../components/services/AirshipInstance'

const OTP_REMINDER_MILLISECONDS = 7 * 24 * 60 * 60 * 1000
const OTP_REMINDER_STORE_NAME = 'app.edge.login'
const OTP_REMINDER_KEY_NAME_CREATED_AT = 'createdAt'
const OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED = 'lastOtpCheck'
const OTP_REMINDER_KEY_NAME_DONT_ASK = 'OtpDontAsk'

/**
 * Set up a the 2fa reminder date for a new account.
 */
export const initializeOtpReminder = async (account: EdgeAccount) => {
  await account.dataStore.setItem(
    OTP_REMINDER_STORE_NAME,
    OTP_REMINDER_KEY_NAME_CREATED_AT,
    Date.now().toString()
  )
}

/**
 * Check and show the 2fa reminder on login.
 */
export async function showOtpReminder(account: EdgeAccount) {
  const { otpKey, dataStore, username } = account
  if (username == null) return

  const pluginList = await dataStore.listStoreIds()
  const storeName = pluginList.includes(OTP_REMINDER_STORE_NAME)
    ? OTP_REMINDER_STORE_NAME
    : null
  const itemList = storeName
    ? await dataStore.listItemIds(OTP_REMINDER_STORE_NAME)
    : null
  const createdAtString =
    itemList && itemList.includes(OTP_REMINDER_KEY_NAME_CREATED_AT)
      ? await dataStore.getItem(
          OTP_REMINDER_STORE_NAME,
          OTP_REMINDER_KEY_NAME_CREATED_AT
        )
      : null
  const createdAt = createdAtString ? parseInt(createdAtString) : null
  const reminderCreatedAtDate = createdAt
    ? createdAt + OTP_REMINDER_MILLISECONDS
    : null
  const lastOtpCheckString =
    itemList && itemList.includes(OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED)
      ? await dataStore.getItem(
          OTP_REMINDER_STORE_NAME,
          OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED
        )
      : null
  const lastOtpCheck = lastOtpCheckString ? parseInt(lastOtpCheckString) : null
  const reminderLastOtpCheckDate = lastOtpCheck
    ? lastOtpCheck + OTP_REMINDER_MILLISECONDS
    : null
  const dontAsk =
    itemList && itemList.includes(OTP_REMINDER_KEY_NAME_DONT_ASK)
      ? await dataStore.getItem(
          OTP_REMINDER_STORE_NAME,
          OTP_REMINDER_KEY_NAME_DONT_ASK
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
        OTP_REMINDER_STORE_NAME,
        OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
        Date.now().toString()
      )
      return true
    }
    await account.dataStore.setItem(
      OTP_REMINDER_STORE_NAME,
      OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
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
        OTP_REMINDER_STORE_NAME,
        OTP_REMINDER_KEY_NAME_DONT_ASK,
        'true'
      )
      return false
    }
    await account.dataStore.setItem(
      OTP_REMINDER_STORE_NAME,
      OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
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
        OTP_REMINDER_STORE_NAME,
        OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
        Date.now().toString()
      )
      return true
    }
    await account.dataStore.setItem(
      OTP_REMINDER_STORE_NAME,
      OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
      Date.now().toString()
    )
    return false
  }

  return true
}
