import * as React from 'react'

import { lstrings } from '../../common/locales/strings'
import { Airship, showError } from '../services/AirshipInstance'
import { ButtonsModal } from './ButtonsModal'

export function showResetModal(requestOtpReset: () => Promise<void>): void {
  Airship.show(bridge => (
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
  )).catch(showError)
}
