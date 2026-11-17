/**
 * IMPORTANT: Changes in this file MUST be synced with edge-react-gui!
 */

import * as React from 'react'
import {
  PixelRatio,
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle
} from 'react-native'

import { fixSides, mapSides, sidesToMargin } from '../../util/sides'
import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'

export const androidAdjustTextStyle = (theme: Theme) => {
  const styles = getStyles(theme)
  return Platform.OS === 'android' ? styles.androidAdjust : null
}

// #region Spacing & Alignment =================================================

/** A properly spaced block of text with default font color and size. Children
 * that are wrapped in other `___Text` component types will override those defaults.
 *
 * A `Paragraph` *can* have `marginRem`, but *only* to avoid an extra `View` for
 * spacing out `Paragraph(s)` in relation to their parent, *NOT* to give special
 * spacing *between* `Paragraphs` */
export const Paragraph = (props: {
  children: React.ReactNode

  center?: boolean
  /** @deprecated A `Paragraph` *can* have `marginRem`, but *only* to avoid an extra `View` for spacing out `Paragraph(s)` in relation to their parent, *NOT* to give special spacing *between* `Paragraphs`. It's still preferable to have the parents deal with spacing outside of `Paragraphs`. */
  marginRem?: number[] | number
}) => {
  const { center = false, children, marginRem } = props
  const theme = useTheme()
  const styles = getStyles(theme)
  const margin = sidesToMargin(mapSides(fixSides(marginRem, 0.5), theme.rem))

  return (
    <Text
      allowFontScaling={false}
      style={[
        styles.common,
        margin,
        center && styles.alignCenter,
        androidAdjustTextStyle(theme)
      ]}
      numberOfLines={0}
      adjustsFontSizeToFit={false}
    >
      {children}
    </Text>
  )
}

// #endregion Spacing & Alignment

// #region Typography ==========================================================

interface LabelProps extends TextProps {
  children: React.ReactNode
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip'
  numberOfLines?: number
  disableFontScaling?: boolean
  minimumFontScale?: number

  /** @deprecated Use or create an appropriate `___Text` component instead */
  style?: StyleProp<TextStyle>
}

/**
 * The new architecture ignores `minimumFontScale` when it shrinks text to fit:
 * both platforms floor at an absolute `minimumFontSize` (4pt on iOS and 4dp on
 * Android when unset) and render long labels illegibly small. React Native's
 * Text never forwards that prop, so the host app must patch it into the RCTText
 * view config, as edge-react-gui's react-native patch does. This derives it
 * from the style's font size, in points on iOS and in pixels on Android (its
 * shrink loop compares against a pixel text size).
 *
 * The floor is an absolute size, and Android applies it to every nested text
 * run, so nested text smaller than `fontSize × minimumFontScale` is enlarged
 * to it, and nested text a little smaller than the outer text can shrink less
 * than `minimumFontScale` allows.
 *
 * Remove this, and the host patch, once React Native forwards
 * `minimumFontScale` on the new architecture (fixed upstream for 0.89).
 */
export function minimumFontSizeProps(
  style: StyleProp<TextStyle>,
  minimumFontScale: number,
  fallbackFontSize: number
): TextProps {
  const fontSize = StyleSheet.flatten(style)?.fontSize ?? fallbackFontSize
  const floor = fontSize * minimumFontScale
  const props: { minimumFontSize: number } = {
    minimumFontSize:
      Platform.OS === 'android'
        ? PixelRatio.getPixelSizeForLayoutSize(floor)
        : floor
  }
  return props as TextProps
}

/** How far shrink-to-fit text may shrink when the caller doesn't say. */
export const DEFAULT_MINIMUM_FONT_SCALE = 0.65

// TODO: Rename to LabelText
export const EdgeText = (props: LabelProps) => {
  const {
    children,
    style,
    disableFontScaling = false,
    adjustsFontSizeToFit = !disableFontScaling,
    minimumFontScale = DEFAULT_MINIMUM_FONT_SCALE,
    ...rest
  } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  let { numberOfLines = 1 } = props
  if (typeof children === 'string' && children.includes('\n')) {
    numberOfLines = numberOfLines + (children.match(/\n/g) ?? []).length
  }

  return (
    <Text
      allowFontScaling={false}
      style={[styles.common, style, androidAdjustTextStyle(theme)]}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
      {...rest}
      {...(adjustsFontSizeToFit
        ? minimumFontSizeProps(
            [styles.common, style],
            minimumFontScale,
            theme.rem(1)
          )
        : null)}
    >
      {children}
    </Text>
  )
}

/** Makes the contents of an `EdgeText` or `Paragraph` smaller (0.75rem).
 * Unless used within a `Paragraph` block, provides no outer spacing. */
export const SmallText = (props: { children: React.ReactNode }) => {
  const { children } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <Text
      allowFontScaling={false}
      style={[styles.sizeSmall, androidAdjustTextStyle(theme)]}
    >
      {children}
    </Text>
  )
}

/** Makes the contents of an `EdgeText` or `Paragraph` orange, for warnings.
 * Unless used within a `Paragraph` block, provides no outer spacing. */
export const WarningText = (props: { children: React.ReactNode }) => {
  const { children } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <Text
      allowFontScaling={false}
      style={[styles.colorWarning, androidAdjustTextStyle(theme)]}
    >
      {children}
    </Text>
  )
}

/** Makes the contents of an `EdgeText` or `Paragraph` large (1.5rem).
 * Unless used within a `Paragraph` block, provides no outer spacing. */
export const HeaderText = (props: { children: React.ReactNode }) => {
  const { children } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <Text
      allowFontScaling={false}
      style={[styles.sizeHeader, androidAdjustTextStyle(theme)]}
    >
      {children}
    </Text>
  )
}

// #endregion Typography

const getStyles = cacheStyles((theme: Theme) => ({
  androidAdjust: {
    top: -1
  },
  common: {
    color: theme.primaryText,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1),
    includeFontPadding: false
  },

  colorWarning: {
    color: theme.warningText
  },
  sizeSmall: {
    fontSize: theme.rem(0.75)
  },
  sizeHeader: {
    fontSize: theme.rem(1.5)
  },
  alignCenter: {
    textAlign: 'center'
  }
}))
