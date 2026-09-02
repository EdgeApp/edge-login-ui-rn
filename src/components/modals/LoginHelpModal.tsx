import * as React from 'react'
import { AirshipBridge } from 'react-native-airship'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { QrCodeIcon, WarningIcon } from '../icons/ThemedIcons'
import { useTheme } from '../services/ThemeContext'
import { SelectableRow } from '../themed/SelectableRow'
import { EdgeModal } from './EdgeModal'

export type LoginHelpResult = 'qr' | 'recovery'

interface Props {
  bridge: AirshipBridge<LoginHelpResult | undefined>
}

/**
 * The "Trouble Signing in?" modal. Folds the QR-code login and the password
 * recovery token entry into a single help sheet, resolving with the option the
 * user selected (or `undefined` if they dismissed it). Each option is its own
 * tappable card, matching how the GUI's Help modal presents its choices.
 */
export const LoginHelpModal: React.FC<Props> = (props: Props) => {
  const { bridge } = props
  const theme = useTheme()

  const handleCancel = useHandler(() => bridge.resolve(undefined))
  const handleQr = useHandler(() => bridge.resolve('qr'))
  const handleRecovery = useHandler(() => bridge.resolve('recovery'))

  return (
    <EdgeModal
      bridge={bridge}
      title={lstrings.login_help_title}
      onCancel={handleCancel}
    >
      <SelectableRow
        testID="loginHelpQr"
        icon={<QrCodeIcon color={theme.iconTappable} size={theme.rem(1.5)} />}
        title={lstrings.login_help_qr_title}
        subTitle={lstrings.login_help_qr}
        onPress={handleQr}
      />
      <SelectableRow
        testID="loginHelpRecovery"
        icon={<WarningIcon color={theme.iconTappable} size={theme.rem(1.5)} />}
        title={lstrings.login_help_recovery_title}
        subTitle={lstrings.login_help_recovery}
        onPress={handleRecovery}
      />
    </EdgeModal>
  )
}
