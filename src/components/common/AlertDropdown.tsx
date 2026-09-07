import * as React from 'react'
import { Platform, View } from 'react-native'
import { AirshipBridge, AirshipDropdown } from 'react-native-airship'
import { cacheStyles } from 'react-native-patina'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import EntypoIcon from 'react-native-vector-icons/Entypo'

import { lstrings } from '../../common/locales/strings'
import { Theme, ThemeProps, withTheme } from '../services/ThemeContext'
import { UnscaledText } from './UnscaledText'

interface Props {
  bridge: AirshipBridge<void>
  message: string

  // True for orange warning, false for red alert:
  warning?: boolean
}

function AlertDropdownComponent(props: Props & ThemeProps) {
  const { bridge, message, theme, warning } = props
  const styles = getStyles(theme)

  // The Airship layer's own safe-area measurement only works on iOS, and
  // edge-to-edge Android draws the window under the status bar, so push the
  // content below it ourselves. iOS already gets this from the layer, so
  // adding it here would double the gap:
  const insets = useSafeAreaInsets()
  const androidTopInset = Platform.OS === 'android' ? insets.top : 0

  return (
    <AirshipDropdown
      bridge={bridge}
      backgroundColor={warning ? theme.dropdownWarning : theme.dropdownError}
      padding={[androidTopInset, 0, 0, 0]}
    >
      <View style={styles.container}>
        <EntypoIcon name="warning" size={theme.rem(1.25)} style={styles.icon} />
        <UnscaledText style={styles.text}>
          <UnscaledText style={styles.boldText}>
            {(warning
              ? lstrings.alert_dropdown_warning
              : lstrings.alert_dropdown_alert) + ' '}
          </UnscaledText>
          {message}
        </UnscaledText>
        <AntDesignIcon
          name="closecircle"
          size={theme.rem(1)}
          style={styles.icon}
        />
      </View>
    </AirshipDropdown>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    padding: theme.rem(0.5),

    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  icon: {
    color: theme.dropdownText,
    textAlign: 'center',
    minWidth: theme.rem(1.5)
  },

  text: {
    fontSize: theme.rem(0.75),
    color: theme.dropdownText,
    marginHorizontal: theme.rem(0.5),
    flexShrink: 1
  },
  boldText: {
    fontWeight: theme.fontWeightBold
  }
}))

export const AlertDropdown = withTheme(AlertDropdownComponent)
