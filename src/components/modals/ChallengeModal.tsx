/**
 * IMPORTANT: Changes in this file MUST be duplicated in edge-react-gui!
 */
import type { ChallengeError } from 'edge-core-js'
import * as React from 'react'
import { AirshipBridge } from 'react-native-airship'
import { WebView, WebViewNavigation } from 'react-native-webview'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { ModalTitle } from '../themed/ModalParts'
import { ThemedModal } from '../themed/ThemedModal'

interface Props {
  bridge: AirshipBridge<boolean | undefined>
  challengeError: ChallengeError
}

export const ChallengeModal = (props: Props) => {
  const { bridge, challengeError } = props

  const handleCancel = useHandler(() => bridge.resolve(undefined))
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

  return (
    <ThemedModal bridge={bridge} onCancel={handleCancel}>
      <ModalTitle>{lstrings.complete_captcha_title}</ModalTitle>
      <WebView
        source={{ uri: challengeError.challengeUri }}
        // Allow the modal background to appear inside the WebView.
        // This is a magic value from the WebView documentation,
        // so don't use the theme - normal colors don't do anything.
        // eslint-disable-next-line react-native/no-color-literals
        style={{ backgroundColor: '#00000000' }}
        onShouldStartLoadWithRequest={handleLoading}
      />
    </ThemedModal>
  )
}
