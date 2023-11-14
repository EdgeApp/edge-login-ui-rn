import * as React from 'react'

import { lstrings } from '../../common/locales/strings'
import { Airship } from '../services/AirshipInstance'
import { ButtonsModal } from './ButtonsModal'

export async function showResetModal(
  requestOtpReset: () => Promise<void>
): Promise<void> {
  await Airship.show(bridge => (
    <ButtonsModal
      title={lstrings.disable_otp_header}
      message={lstrings.disable_otp_modal_body}
      buttons={{
        ok: {
          label: lstrings.disable_otp_button,
          onPress: async () => await requestOtpReset().then(() => true)
        }
      }}
      closeArrow
      bridge={bridge}
    />
  ))
}
