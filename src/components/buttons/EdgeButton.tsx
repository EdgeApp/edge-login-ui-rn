/**
 * IMPORTANT: Changes in this file MUST be synced between edge-react-gui and
 * edge-login-ui-rn!
 */

import * as React from 'react'
import type { TextStyle, ViewStyle } from 'react-native'
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { cacheStyles } from 'react-native-patina'

import { usePendingPress } from '../../hooks/usePendingPress'
import { fixSides, mapSides, sidesToMargin } from '../../util/sides'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import type { Theme } from '../services/ThemeContext'
import { useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'

export type EdgeButtonType =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'destructive' // Not syncing with GUI unless we need it. This is a weird one-off.

interface Props {
  children?: React.ReactNode

  // Called when the user presses the button.
  // If the callback returns a promise, the button will disable itself
  // and show a spinner until the promise resolves.
  onPress?: () => void | Promise<void>

  // True to dim the button & prevent interactions:
  disabled?: boolean

  // If this is set, the component will insert a text node after its children:
  label?: string

  // Parent container layout
  layout?: 'row' | 'column' | 'solo' | 'fullWidth'

  // True to show a spinner after the contents:
  spinner?: boolean

  // Which visual style to use. Defaults to primary (solid):
  type?: EdgeButtonType

  // Still uses 'type', but makes it shorter (2 rem vs 3 rem)
  mini?: boolean

  /** @deprecated - Shouldn't use this post-UI4 transition */
  marginRem?: number[] | number

  testID?: string
}

/**
 * A stylized button with 0 outside margins by default.
 * - Typically to be used as a child of ButtonsViewUi4.
 * - NOT meant to be used on its own outside of ButtonsViewUi4 unless layout='solo'
 */
export function EdgeButton(props: Props): React.ReactElement | null {
  const {
    layout = 'solo',
    children,
    disabled = false,
    label,
    onPress,
    type = 'primary',
    spinner = false,
    mini = false,
    marginRem,
    testID
  } = props

  // `onPress` promise logic:
  const [pending, handlePress] = usePendingPress(onPress)

  // Styles:
  const theme = useTheme()
  const styles = getStyles(theme)

  // Sizing rules per variant:
  const isTertiary = type === 'tertiary'
  const visualHeightRem = isTertiary ? 1.5 : mini ? 2.0 : 3.0
  const paddingXRem = isTertiary ? 0.75 : mini ? 1.25 : 1.5
  const paddingYRem = isTertiary ? 0.0 : 0

  const containerMargin = sidesToMargin(
    mapSides(fixSides(marginRem, 0), theme.rem)
  )

  const opacity = disabled ? 0.3 : spinner || pending ? 0.7 : 1

  // Layout behavior for parent containers:
  const layoutContainerStyle = React.useMemo<ViewStyle>(() => {
    if (layout === 'row') {
      return { width: '50%' }
    }
    if (layout === 'column' || layout === 'fullWidth') {
      return {
        alignSelf: 'stretch',
        alignItems: 'stretch',
        flexBasis: 'auto',
        flexGrow: 0,
        flexShrink: 0,
        padding: layout === 'fullWidth' ? theme.rem(1) : undefined
      }
    }
    // solo
    return { alignItems: 'center', justifyContent: 'center' }
  }, [layout, theme])

  // Content row adjusted according to spinner prop value
  const contentRowStyle = React.useMemo<ViewStyle>(
    () => ({
      ...styles.contentRow,
      opacity: spinner ? 0 : 1
    }),
    [spinner, styles.contentRow]
  )

  // Tappable area overshoot
  const hitSlop =
    layout === 'solo'
      ? {
          top: theme.rem(0.5),
          bottom: theme.rem(0.5),
          // Expand horizontally so taps register across the full width
          left: 10000,
          right: 10000
        }
      : theme.rem(0.5)

  const content = (
    <>
      {type === 'tertiary' ? null : (
        <LinearGradient
          colors={
            type === 'primary'
              ? theme.primaryButton
              : type === 'secondary'
              ? theme.secondaryButton
              : theme.dangerButton
          }
          start={
            type === 'primary'
              ? theme.primaryButtonColorStart
              : type === 'secondary'
              ? theme.secondaryButtonColorStart
              : theme.dangerButtonColorStart
          }
          end={
            type === 'primary'
              ? theme.primaryButtonColorEnd
              : type === 'secondary'
              ? theme.secondaryButtonColorEnd
              : theme.dangerButtonColorEnd
          }
          style={styles.pillBackground}
        />
      )}

      <View style={contentRowStyle}>
        {children == null ? null : (
          <View style={styles.leading}>{children}</View>
        )}
        {label == null ? null : (
          <EdgeText
            style={[
              styles.labelBase,
              type === 'primary'
                ? styles.labelPrimary
                : type === 'secondary'
                ? styles.labelSecondary
                : type === 'destructive'
                ? styles.labelDestructive
                : styles.labelTertiary,
              children == null ? null : styles.labelWithIcon
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.65}
          >
            {label}
          </EdgeText>
        )}
      </View>

      {!spinner && !pending ? null : (
        <View style={styles.spinnerOverlay} pointerEvents="none">
          <ActivityIndicator
            color={
              type === 'primary'
                ? theme.primaryButtonText
                : type === 'secondary'
                ? theme.secondaryButtonText
                : type === 'destructive'
                ? theme.dangerButtonText
                : theme.escapeButtonText
            }
          />
        </View>
      )}
    </>
  )

  return (
    <View style={[layoutContainerStyle, containerMargin]}>
      <EdgeTouchableOpacity
        disabled={disabled || pending}
        onPress={handlePress}
        hitSlop={hitSlop}
        testID={testID}
        activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
        style={[
          styles.pillBase,
          type !== 'tertiary' ? styles.pillSolid : styles.pillTertiary,
          layout === 'column' || (layout === 'row' && !isTertiary)
            ? styles.pillStretch
            : null,
          {
            height: theme.rem(visualHeightRem),
            paddingHorizontal: theme.rem(paddingXRem),
            paddingVertical: theme.rem(paddingYRem),
            opacity
          }
        ]}
      >
        {content}
      </EdgeTouchableOpacity>
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => {
  const pillBase: ViewStyle = {
    borderRadius: theme.rem(theme.buttonBorderRadiusRem),
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center'
  }

  const pillBackground: ViewStyle = {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.rem(theme.buttonBorderRadiusRem)
  }

  const labelBase: TextStyle = {
    includeFontPadding: false
    // Defaults will be overridden per type below
  }

  return {
    pillBase,
    pillSolid: {
      position: 'relative'
    },
    pillStretch: {
      alignSelf: 'stretch'
    },
    pillTertiary: {
      backgroundColor: 'transparent',
      position: 'relative'
    },
    pillBackground,
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    leading: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    labelBase,
    labelWithIcon: {
      marginLeft: theme.rem(0.5)
    },
    labelPrimary: {
      color: theme.primaryButtonText,
      fontFamily: theme.primaryButtonFont,
      fontSize: theme.rem(theme.primaryButtonFontSizeRem)
    },
    labelSecondary: {
      color: theme.secondaryButtonText,
      fontFamily: theme.secondaryButtonFont,
      fontSize: theme.rem(theme.secondaryButtonFontSizeRem)
    },
    labelDestructive: {
      color: theme.dangerButtonText,
      fontFamily: theme.dangerButtonFont,
      fontSize: theme.rem(theme.dangerButtonFontSizeRem)
    },
    labelTertiary: {
      color: theme.escapeButtonText,
      fontFamily: theme.escapeButtonFont,
      fontSize: theme.rem(theme.escapeButtonFontSizeRem)
    },
    spinnerOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center'
    }
  }
})
