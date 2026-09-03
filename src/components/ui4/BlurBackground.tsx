/**
 * IMPORTANT: Changes in this file MUST be synced with edge-react-gui!
 */

import { BlurTargetView, BlurView as ExpoBlurView } from 'expo-blur'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import { BlurView } from 'rn-id-blurview'

import { Theme, useTheme } from '../services/ThemeContext'

const isAndroid = Platform.OS === 'android'

// Android below 12 (API 31) has no working blur under the new architecture:
// RenderScript cannot snapshot Fabric-rendered content, so the modal must
// provide its own solid background color and this component renders nothing.
export const isBlurDisabled = isAndroid && Number(Platform.Version) < 31

/**
 * The content blur surfaces sample from. On Android 12+ the blur
 * implementation (Dimezis BlurView 3, via expo-blur) can only blur content
 * wrapped in an explicit target view - the old whole-window snapshot renders
 * nothing under the new architecture. On iOS this wrapper is a plain View.
 */
const BlurTargetContext = React.createContext<React.RefObject<View | null> | null>(
  null
)

/** Owns the blur-target ref. Mounted by LoginUiProvider above both the
 * target and the Airship layer whose modals sample it. */
export function BlurTargetProvider(props: {
  children: React.ReactNode
}): React.ReactElement {
  const ref = React.useRef<View>(null)
  return (
    <BlurTargetContext.Provider value={ref}>
      {props.children}
    </BlurTargetContext.Provider>
  )
}

/** Marks its children as the content blur surfaces sample. Wraps the app
 * content, NOT the modal layer - a modal must not sample itself. */
export function BlurTarget(props: {
  children: React.ReactNode
}): React.ReactElement {
  const ref = React.useContext(BlurTargetContext)
  return (
    <BlurTargetView
      ref={ref ?? undefined}
      collapsable={false}
      style={styles.blurTarget}
    >
      {props.children}
    </BlurTargetView>
  )
}

/** The Android 12+ blur: expo-blur's Dimezis 3 backend, which works under
 * the new architecture but needs the BlurTarget above. Falls back to a plain
 * tint when no target is mounted. */
export const AndroidBlur = (props: {
  rounded?: boolean
}): React.ReactElement => {
  const { rounded = false } = props
  const theme = useTheme()
  const stylesLocal = getStyles(theme)
  const blurTarget = React.useContext(BlurTargetContext)
  return (
    <ExpoBlurView
      blurMethod="dimezisBlurViewSdk31Plus"
      blurTarget={blurTarget ?? undefined}
      tint={theme.isDark ? 'dark' : 'light'}
      intensity={100}
      style={[
        StyleSheet.absoluteFill,
        stylesLocal.clip,
        rounded ? stylesLocal.roundCorner : null
      ]}
    />
  )
}

export const BlurBackground = (): React.ReactElement | null => {
  const theme = useTheme()
  const stylesLocal = getStyles(theme)

  if (isBlurDisabled) return null
  if (isAndroid) return <AndroidBlur rounded />
  return (
    <BlurView
      blurType={theme.isDark ? 'dark' : 'light'}
      style={stylesLocal.blurView}
      overlayColor="rgba(0, 0, 0, 0)"
    />
  )
}

const styles = StyleSheet.create({
  blurTarget: { flex: 1 }
})

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
  },
  clip: {
    overflow: 'hidden'
  },
  roundCorner: {
    borderRadius: theme.cardBorderRadius
  }
}))
