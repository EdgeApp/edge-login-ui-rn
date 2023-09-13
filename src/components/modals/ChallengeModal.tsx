import type { ChallengeError } from 'edge-core-js'
import * as React from 'react'
import { AirshipBridge } from 'react-native-airship'
import { cacheStyles } from 'react-native-patina'
import { WebView, WebViewNavigation } from 'react-native-webview'

import s from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { Theme, useTheme } from '../services/ThemeContext'
import { ModalFooter, ModalTitle } from '../themed/ModalParts'
import { ThemedModal } from '../themed/ThemedModal'

interface Props {
  bridge: AirshipBridge<'pass' | 'fail' | undefined>
  challengeError: ChallengeError
}

export const ChallengeModal = (props: Props) => {
  const { bridge, challengeError } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const handleCancel = useHandler(() => bridge.resolve(undefined))
  const handleNavigationStateChange = useHandler((event: WebViewNavigation) => {
    if (/\/success$/.test(event.url)) {
      bridge.resolve('pass')
    }
    if (/\/failure$/.test(event.url)) {
      bridge.resolve('fail')
    }
  })

  return (
    <ThemedModal bridge={bridge} onCancel={handleCancel}>
      <ModalTitle>{s.strings.complete_captcha_title}</ModalTitle>
      <WebView
        source={{ uri: challengeError.challengeUri }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
      />
      <ModalFooter onPress={handleCancel} />
    </ThemedModal>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  webview: { backgroundColor: theme.modal }
}))
