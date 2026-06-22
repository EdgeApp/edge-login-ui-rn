import * as React from 'react'
import { View } from 'react-native'
import { AirshipBridge } from 'react-native-airship'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { ChevronRightIcon } from '../icons/ThemedIcons'
import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'
import { EdgeModal } from './EdgeModal'

export type LoginHelpResult = 'qr' | 'recovery'

interface Props {
  bridge: AirshipBridge<LoginHelpResult | undefined>
}

/**
 * The "Trouble Signing in?" modal. Folds the QR-code login and the password
 * recovery token entry into a single help sheet, resolving with the option the
 * user selected (or `undefined` if they dismissed it).
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
      <EdgeTouchableOpacity
        accessible
        testID="loginHelpQr"
        style={styles.row}
        onPress={handleQr}
      >
        <AntDesignIcon
          name="qrcode"
          style={styles.rowIcon}
          color={theme.iconTappable}
          size={theme.rem(1.5)}
        />
        <EdgeText style={styles.rowText} numberOfLines={2}>
          {lstrings.login_help_qr}
        </EdgeText>
        <ChevronRightIcon size={theme.rem(1.25)} color={theme.iconTappable} />
      </EdgeTouchableOpacity>
      <View style={styles.divider} />
      <EdgeTouchableOpacity
        accessible
        testID="loginHelpRecovery"
        style={styles.row}
        onPress={handleRecovery}
      >
        <AntDesignIcon
          name="warning"
          style={styles.rowIcon}
          color={theme.iconTappable}
          size={theme.rem(1.5)}
        />
        <EdgeText style={styles.rowText} numberOfLines={2}>
          {lstrings.login_help_recovery}
        </EdgeText>
        <ChevronRightIcon size={theme.rem(1.25)} color={theme.iconTappable} />
      </EdgeTouchableOpacity>
    </EdgeModal>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.rem(0.75)
  },
  rowIcon: {
    marginRight: theme.rem(0.75)
  },
  rowText: {
    flex: 1,
    marginRight: theme.rem(0.5)
  },
  divider: {
    height: theme.thinLineWidth,
    backgroundColor: theme.secondaryText,
    opacity: 0.3
  }
}))
