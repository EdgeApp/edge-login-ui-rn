import * as React from 'react'
import { View } from 'react-native'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { UnscaledText } from '../common/UnscaledText'
import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'

export type LoginFlavor = 'password' | 'pin'

interface Props {
  flavor: LoginFlavor
  /**
   * When false the PIN/biometric pill is shown greyed-out. It still calls
   * `onSelectPin` so the parent can surface a toast explaining why it is
   * unavailable.
   */
  pinEnabled: boolean
  onSelectPassword: () => void
  onSelectPin: () => void
}

/**
 * A two-segment pill toggle that switches the login scene between its password
 * and PIN/biometric flavors.
 */
export const LoginFlavorToggle: React.FC<Props> = (props: Props) => {
  const { flavor, pinEnabled, onSelectPassword, onSelectPin } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const passwordSelected = flavor === 'password'
  const pinSelected = flavor === 'pin'

  const handlePassword = useHandler(() => {
    onSelectPassword()
  })
  const handlePin = useHandler(() => {
    onSelectPin()
  })

  return (
    <View style={styles.container}>
      <EdgeTouchableOpacity
        accessible
        testID="loginTabPassword"
        style={[
          styles.pill,
          passwordSelected ? styles.pillSelected : undefined
        ]}
        onPress={handlePassword}
      >
        <UnscaledText
          style={passwordSelected ? styles.pillTextSelected : styles.pillText}
        >
          {lstrings.login_tab_password}
        </UnscaledText>
      </EdgeTouchableOpacity>
      <EdgeTouchableOpacity
        accessible
        testID="loginTabPin"
        style={[styles.pill, pinSelected ? styles.pillSelected : undefined]}
        onPress={handlePin}
      >
        <UnscaledText
          style={
            pinSelected
              ? styles.pillTextSelected
              : pinEnabled
              ? styles.pillText
              : styles.pillTextDisabled
          }
        >
          {lstrings.login_tab_pin}
        </UnscaledText>
      </EdgeTouchableOpacity>
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: theme.loginToggleBackground,
    borderRadius: theme.rem(1.5),
    padding: theme.rem(0.25),
    marginVertical: theme.rem(0.5)
  },
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.rem(1.5),
    paddingVertical: theme.rem(0.5),
    paddingHorizontal: theme.rem(1)
  },
  pillSelected: {
    backgroundColor: theme.loginToggleSelected
  },
  pillText: {
    color: theme.textInputPlaceholderColor,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875)
  },
  pillTextSelected: {
    color: theme.primaryText,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875)
  },
  pillTextDisabled: {
    color: theme.deactivatedText,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875)
  }
}))
