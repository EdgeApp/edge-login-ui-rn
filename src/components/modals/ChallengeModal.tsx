import type { ChallengeError } from 'edge-core-js'
import * as React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { AirshipBridge, AirshipModal } from 'react-native-airship'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import { WebView, WebViewNavigation } from 'react-native-webview'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'

interface Props {
  bridge: AirshipBridge<boolean | undefined>
  challengeError: ChallengeError
}

export const ChallengeModal = (props: Props) => {
  const { bridge, challengeError } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const [loading, setLoading] = React.useState(true)

  const handleCancel = useHandler(() => bridge.resolve(undefined))
  const handleLoad = useHandler(() => setLoading(false))
  const handleLoading = useHandler((event: WebViewNavigation): boolean => {
    if (/\/success$/.test(event.url)) {
      bridge.resolve(true)
      return false
    }
    if (/\/failure$/.test(event.url)) {
      bridge.resolve(false)
      return false
    }
    return true
  })

  const bgColor = serverColor(theme.modal) ?? '1a1a1a'
  const fgColor = serverColor(theme.primaryText) ?? 'fff'

  return (
    <AirshipModal
      backgroundColor={theme.modal}
      bridge={bridge}
      // Create a gap on top of the modal, so the user can tap to dismiss:
      margin={[theme.rem(5), 0, 0]}
      padding={theme.rem(0.5)}
      onCancel={handleCancel}
    >
      <View style={styles.titleContainer}>
        <EdgeText style={styles.titleText} numberOfLines={2}>
          {lstrings.complete_captcha_title}
        </EdgeText>
        <EdgeTouchableOpacity
          style={styles.closeIconContainer}
          onPress={handleCancel}
        >
          <AntDesignIcon
            name="close"
            color={theme.primaryText}
            size={theme.rem(1.25)}
          />
        </EdgeTouchableOpacity>
      </View>
      <WebView
        javaScriptEnabled
        source={{
          uri: challengeError.challengeUri + `?bg=${bgColor}&fg=${fgColor}`
        }}
        style={styles.webview}
        onLoad={handleLoad}
        onShouldStartLoadWithRequest={handleLoading}
      />
      {!loading ? null : (
        <View pointerEvents="box-none" style={styles.overlay}>
          <ActivityIndicator color={theme.primaryText} size="large" />
        </View>
      )}
    </AirshipModal>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  closeIconContainer: {
    margin: theme.rem(-0.5),
    padding: theme.rem(0.5)
  },

  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: theme.rem(0.5)
  },

  titleText: {
    color: theme.primaryText,
    flexShrink: 1,
    fontFamily: theme.fontFaceMedium,
    fontSize: theme.rem(1.2)
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },

  // eslint-disable-next-line react-native/no-color-literals
  webview: {
    alignSelf: 'stretch',
    // Allow the modal background to appear inside the WebView while loading.
    // This is a magic value from the WebView documentation,
    // so don't use the theme - normal colors don't do anything.
    backgroundColor: '#00000000',
    margin: theme.rem(0.5)
  }
}))

/**
 * Transforms a color into the server's query-string format.
 */
function serverColor(color: string): string | undefined {
  const match = color.match(/^#([0-9A-Fa-f]{6})$/)
  if (match != null) return match[1].toLowerCase()
}
