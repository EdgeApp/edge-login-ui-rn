import type { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Keyboard } from 'react-native'
import { sprintf } from 'sprintf-js'

import { lstrings } from '../common/locales/strings'
import { ButtonsModal } from '../components/modals/ButtonsModal'
import { Airship } from '../components/services/AirshipInstance'

const OTP_REMINDER_MILLISECONDS = 7 * 24 * 60 * 60 * 1000
const OTP_REMINDER_STORE_NAME = 'app.edge.login'
const OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED = 'lastOtpCheck'
const OTP_REMINDER_KEY_NAME_DONT_ASK = 'OtpDontAsk'

/**
 * Check and show the 2fa reminder on login, if necessary.
 */
export async function showOtpReminder(account: EdgeAccount): Promise<void> {
  const { otpKey, dataStore, username, created } = account
  if (username == null) return
  if (otpKey != null) return

  const [dontAsk, lastOtpCheckString]: [
    string | null,
    string | null
  ] = (await Promise.all([
    dataStore
      .getItem(OTP_REMINDER_STORE_NAME, OTP_REMINDER_KEY_NAME_DONT_ASK)
      .catch(() => null),
    dataStore
      .getItem(OTP_REMINDER_STORE_NAME, OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED)
      .catch(() => null)
  ])) as any

  if (dontAsk) return
  const lastOtpCheck =
    lastOtpCheckString != null ? parseInt(lastOtpCheckString) : null

  // Show the modal if we have never shown it before,
  // and the account is old enough:
  if (
    lastOtpCheck == null &&
    (created == null ||
      Date.now() > created.valueOf() + OTP_REMINDER_MILLISECONDS)
  ) {
    Keyboard.dismiss()
    const result = await Airship.show<'yes' | 'no' | undefined>(bridge => (
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
    if (result === 'yes') {
      await enableOtp(account)
    } else {
      await account.dataStore.setItem(
        OTP_REMINDER_STORE_NAME,
        OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
        Date.now().toString()
      )
    }
  }

  // Show a modal with the "Don't ask again" button if we have waited
  // long enough since the last time we showed a 2fa reminder modal:
  if (
    lastOtpCheck != null &&
    Date.now() > lastOtpCheck + OTP_REMINDER_MILLISECONDS
  ) {
    Keyboard.dismiss()
    const result = await Airship.show<
      'enable' | 'cancel' | 'dontAsk' | undefined
    >(bridge => (
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
    if (result === 'enable') {
      await enableOtp(account)
    } else if (result === 'dontAsk') {
      await account.dataStore.setItem(
        OTP_REMINDER_STORE_NAME,
        OTP_REMINDER_KEY_NAME_DONT_ASK,
        'true'
      )
    } else {
      await account.dataStore.setItem(
        OTP_REMINDER_STORE_NAME,
        OTP_REMINDER_KEY_NAME_LAST_OTP_CHECKED,
        Date.now().toString()
      )
    }
  }
}

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
