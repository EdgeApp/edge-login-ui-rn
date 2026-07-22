/**
 * IMPORTANT: Changes in this file MUST be synced with edge-react-gui!
 */

import React from 'react'
import { Platform, StyleSheet } from 'react-native'
import { BlurView } from 'rn-id-blurview'

import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'

const isAndroid = Platform.OS === 'android'

// Android below 12 (API 31) blurs via RenderScript, which cannot snapshot
// content rendered by the new architecture - BlurView paints a light gray
// wash instead of blurred content. Worse, plain sibling Views also fail to
// paint inside the modal on those devices, so the modal must provide its own
// solid background color and this component renders nothing.
export const isBlurDisabled = isAndroid && Number(Platform.Version) < 31

export const BlurBackground = () => {
  const theme = useTheme()
  const styles = getStyles(theme)

  if (isBlurDisabled) return null
  return (
    <BlurView
      blurType={theme.isDark ? 'dark' : 'light'}
      style={styles.blurView}
      overlayColor="rgba(0, 0, 0, 0)"
    />
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  blurView: {
    ...StyleSheet.absoluteFillObject,
    // We need this backgroundColor because Android applies an overlay to the
    // entire screen for the BlurView by default. We change this default
    // behavior with the transparent overlayColor, so we add this background
    // color to compensate and to match iOS colors/shades.
    backgroundColor: isAndroid
      ? theme.isDark
        ? '#161616aa'
        : '#ffffff55'
      : undefined
  }
}))
