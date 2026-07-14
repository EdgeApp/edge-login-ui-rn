import * as React from 'react'
import { View } from 'react-native'
import { AirshipBridge } from 'react-native-airship'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { QrCodeIcon, WarningIcon } from '../icons/ThemedIcons'
import { EdgeRow } from '../rows/EdgeRow'
import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'
import { EdgeCard } from '../ui4/EdgeCard'
import { EdgeModal } from './EdgeModal'

export type LoginHelpResult = 'qr' | 'recovery'

interface Props {
  bridge: AirshipBridge<LoginHelpResult | undefined>
}

/**
 * The "Trouble Signing in?" modal. Folds the QR-code login and the password
 * recovery token entry into a single help sheet, resolving with the option the
 * user selected (or `undefined` if they dismissed it). The options reuse the
 * shared EdgeCard + EdgeRow kit so they match the card rows used elsewhere in
 * the app.
 */
export const LoginHelpModal: React.FC<Props> = (props: Props) => {
  const { bridge } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const handleCancel = useHandler(() => bridge.resolve(undefined))
  const handleQr = useHandler(() => bridge.resolve('qr'))
  const handleRecovery = useHandler(() => bridge.resolve('recovery'))

  return (
    <EdgeModal
      bridge={bridge}
      title={lstrings.login_help_title}
      onCancel={handleCancel}
    >
      <EdgeCard sections>
        <EdgeRow
          testID="loginHelpQr"
          icon={
            <View style={styles.icon}>
              <QrCodeIcon color={theme.iconTappable} size={theme.rem(1.5)} />
            </View>
          }
          body={lstrings.login_help_qr}
          rightButtonType="touchable"
          onPress={handleQr}
        />
        <EdgeRow
          testID="loginHelpRecovery"
          icon={
            <View style={styles.icon}>
              <WarningIcon color={theme.iconTappable} size={theme.rem(1.5)} />
            </View>
          }
          body={lstrings.login_help_recovery}
          rightButtonType="touchable"
          onPress={handleRecovery}
        />
      </EdgeCard>
    </EdgeModal>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  icon: {
    marginRight: theme.rem(0.75)
  }
}))
