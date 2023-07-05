import * as React from 'react'
import { Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { cacheStyles } from 'react-native-patina'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'

import { fixSides, mapSides, sidesToPadding } from '../../util/sides'
import { GradientFadeOut } from '../modals/GradientFadeout'
import { Theme, useTheme } from '../services/ThemeContext'

interface ModalTitleProps {
  children: React.ReactNode
  center?: boolean
  paddingRem?: number[] | number
  icon?: React.ReactNode
}
interface ModalFooterProps {
  onPress: () => void
  fadeOut?: boolean
}

export function ModalTitle(props: ModalTitleProps) {
  const { center, children, icon = null, paddingRem } = props
  const theme = useTheme()
  const styles = getStyles(theme)
  const padding = sidesToPadding(mapSides(fixSides(paddingRem, 0), theme.rem))

  return (
    <View style={styles.titleContainer}>
      {icon ? <View style={styles.titleIconContainer}>{icon}</View> : null}
      <Text
        style={[styles.titleText, center ? styles.titleCenter : null, padding]}
      >
        {children}
      </Text>
    </View>
  )
}

export function ModalMessage(props: {
  children: React.ReactNode
  paddingRem?: number[] | number
  isWarning?: boolean
}) {
  const { children, isWarning, paddingRem } = props
  const theme = useTheme()
  const styles = getStyles(theme)
  const padding = sidesToPadding(mapSides(fixSides(paddingRem, 0), theme.rem))

  return (
    <Text
      style={[styles.messageText, padding, isWarning && styles.warningText]}
    >
      {children}
    </Text>
  )
}
/**
 * Renders a close button and an optional fade-out gradient.
 *
 * If you use the fade-out gradient, your scroll element's
 * `contentContainerStyle` needs `theme.rem(ModalFooter.bottomRem)`
 * worth of bottom padding, so the close button does not cover your content.
 */
export function ModalFooter(props: ModalFooterProps) {
  const theme = useTheme()
  const styles = getStyles(theme)
  const { fadeOut } = props

  const footerFadeContainer =
    fadeOut === true ? styles.footerFadeContainer : undefined
  const footerFade = fadeOut === true ? styles.footerFade : undefined

  return (
    <View style={footerFadeContainer}>
      <View style={footerFade}>
        <TouchableOpacity
          onPress={props.onPress}
          style={styles.closeIcon}
          accessibilityHint="Close Modal"
        >
          <AntDesignIcon
            name="close"
            size={theme.rem(1.25)}
            color={theme.iconTappable}
          />
        </TouchableOpacity>
      </View>
      {fadeOut !== true ? null : <GradientFadeOut />}
    </View>
  )
}
ModalFooter.bottomRem = 2.5

export function ModalScrollArea(props: {
  children: React.ReactNode
  onCancel: () => void
}) {
  const { children, onCancel } = props
  const theme = useTheme()
  const styles = getStyles(theme)
  const scrollPadding = React.useMemo<ViewStyle>(() => {
    return {
      paddingBottom: theme.rem(ModalFooter.bottomRem)
    }
  }, [theme])

  return (
    <View>
      <KeyboardAwareScrollView
        contentContainerStyle={scrollPadding}
        style={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </KeyboardAwareScrollView>
      <ModalFooter onPress={onCancel} fadeOut />
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  closeIcon: {
    alignItems: 'center',
    paddingBottom: theme.rem(ModalFooter.bottomRem)
  },
  scrollViewContainer: {
    margin: theme.rem(0.5),
    paddingBottom: theme.rem(2.5)
  },
  titleContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    margin: theme.rem(0.5)
  },
  titleIconContainer: {
    marginRight: theme.rem(0.5)
  },
  titleText: {
    color: theme.primaryText,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1.2),
    marginVertical: theme.rem(0.5)
  },
  titleCenter: {
    textAlign: 'center'
  },
  warningText: {
    color: theme.warningText
  },
  messageText: {
    color: theme.primaryText,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1),
    marginVertical: theme.rem(0.5),
    textAlign: 'left'
  },
  footerFadeContainer: {
    marginBottom: theme.rem(-1)
  },
  footerFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1
  }
}))
