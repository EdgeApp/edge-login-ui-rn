import * as React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { cacheStyles } from 'react-native-patina'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'

import { fixSides, mapSides, sidesToPadding } from '../../util/sides'
import { Theme, useTheme } from '../services/ThemeContext'

const SCROLL_BOTTOM_GRADIENT_REM = 2.5

interface ModalTitleProps {
  children: React.ReactNode
  center?: boolean
  paddingRem?: number[] | number
  icon?: React.ReactNode
}
interface ModalFooterProps {
  onPress: () => void
}
interface ModalScrollAreaProps {
  children: React.ReactNode
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
 * Renders a close button.
 */
export function ModalFooter(props: ModalFooterProps) {
  const theme = useTheme()
  const styles = getStyles(theme)
  return (
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
  )
}

/**
 * Renders a scrollable area, with a bottom gradient.
 */
export function ModalScrollArea(props: ModalScrollAreaProps) {
  const { children } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <View>
      <ScrollView
        contentContainerStyle={styles.scrollPadding}
        pagingEnabled
        style={styles.scrollViewContainer}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      <GradientFadeOut />
    </View>
  )
}

const MARKS: number[] = [0, 0.2, 0.75, 1]
const START = { x: 0, y: 0 }
const END = { x: 0, y: 1 }

/*
 * Used for adding a gradient fadeout to the bottom of a list modal
 */
export const GradientFadeOut = () => {
  const theme = useTheme()
  const styles = getStyles(theme)
  const color = theme.modal
  const colors: string[] = React.useMemo(() => {
    return MARKS.map(
      mark => color + `0${Math.floor(255 * mark).toString(16)}`.slice(-2)
    )
  }, [color])
  return (
    <LinearGradient
      style={styles.gradientContainer}
      start={START}
      end={END}
      colors={colors}
      locations={MARKS}
      pointerEvents="none"
    />
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  gradientContainer: {
    zIndex: 1,
    position: 'absolute',
    height: theme.rem(3),
    width: '100%',
    bottom: theme.rem(SCROLL_BOTTOM_GRADIENT_REM),
    borderColor: 'white',
    borderWidth: 0.5
  },
  closeIcon: {
    alignItems: 'center',
    paddingBottom: theme.rem(0.5)
  },
  scrollViewContainer: {
    margin: theme.rem(0.5)
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
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1
  },
  scrollPadding: {
    paddingBottom: theme.rem(SCROLL_BOTTOM_GRADIENT_REM)
  }
}))
