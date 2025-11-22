import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import LinearGradient, {
  LinearGradientProps
} from 'react-native-linear-gradient'
import { cacheStyles } from 'react-native-patina'

import { useHandler } from '../../hooks/useHandler'
import { triggerHaptic } from '../../util/haptic'
import {
  fixSides,
  mapSides,
  sidesToMargin,
  sidesToPadding
} from '../../util/sides'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { CloseIcon } from '../icons/ThemedIcons'
import { SectionView } from '../layout/SectionView'
import { Theme, useTheme } from '../services/ThemeContext'

interface Props {
  // Top layer:
  overlay?: React.ReactNode // Rendered above/on top of children

  // children & icon share the same 2nd layer:
  children: React.ReactNode | React.ReactNode[]

  // TODO: Not implemented, but not used yet anyway.
  // icon?: React.ReactNode | string

  // Everything else underneath, in order:
  gradientBackground?: LinearGradientProps // 3rd layer
  nodeBackground?: React.ReactNode // 4th layer, anything goes

  /** @deprecated Only to be used during the UI4 transition */
  marginRem?: number[] | number
  /** @deprecated Only to be used during the UI4 transition */
  paddingRem?: number[] | number

  // Options:
  fill?: boolean // Set flex to 1 for tiling
  sections?: boolean // Automatic section dividers, only if chilren are multiple nodes
  testID?: string
  onClose?: () => Promise<void> | void // If specified, adds a close button, absolutely positioned in the top right

  // Touchable area for the following span the entire card:
  onLongPress?: () => Promise<void> | void
  onPress?: () => Promise<void> | void
}

/**
 * Rounded card
 *
 * sections: Automatically adds horizontal dividers between each child, aligned
 * in a column layout. Adds no dividers if only one child is given.
 *
 * gradientBackground/nodeBackground: For specifying a complex background
 * that can include embedded images or any other component.
 *
 * onClose: If specified, adds a close button
 */
export const EdgeCard = (props: Props) => {
  const {
    children,
    fill = false,
    gradientBackground,
    // icon,
    marginRem,
    nodeBackground,
    overlay,
    paddingRem,
    sections,
    testID,

    // Handlers:
    onClose,
    onLongPress,
    onPress
  } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const margin = sidesToMargin(mapSides(fixSides(marginRem, 0.5), theme.rem))
  const padding = sidesToPadding(mapSides(fixSides(paddingRem, 0.5), theme.rem))
  const fillStyle = fill ? styles.fill : undefined

  const isPressable = onPress != null || onLongPress != null

  const handlePress = useHandler(async () => {
    if (onPress != null) {
      triggerHaptic('impactLight')
      await onPress()
    }
  })

  const handleLongPress = useHandler(async () => {
    if (onLongPress != null) {
      triggerHaptic('impactLight')
      await onLongPress()
    }
  })

  const handleClose = useHandler(async () => {
    if (onClose != null) {
      triggerHaptic('impactLight')
      await onClose()
    }
  })
  const viewStyle = React.useMemo(
    () => [styles.cardContainer, margin, padding, fillStyle],
    [styles.cardContainer, margin, padding, fillStyle]
  )

  const nonNullChildren = React.Children.toArray(children).filter(
    child => child != null && React.isValidElement(child)
  )
  if (nonNullChildren.length === 0) return null

  const background = (
    <View style={styles.backgroundFill}>
      {nodeBackground}
      {gradientBackground == null ? null : (
        <LinearGradient
          {...gradientBackground}
          style={StyleSheet.absoluteFill}
        />
      )}
    </View>
  )

  const content = sections ? <SectionView>{children}</SectionView> : children

  const maybeCloseButton =
    onClose == null ? null : (
      <EdgeTouchableOpacity
        style={styles.cornerContainer}
        onPress={handleClose}
      >
        <CloseIcon />
      </EdgeTouchableOpacity>
    )

  const maybeOverlay =
    overlay == null ? null : (
      <View style={styles.overlayContainer}>{overlay}</View>
    )

  const allContent = (
    <>
      {background}
      <View style={styles.iconRowContainer}>{content}</View>
      {maybeCloseButton}
      {maybeOverlay}
    </>
  )

  return isPressable ? (
    <EdgeTouchableOpacity
      accessible={false}
      testID={testID}
      style={viewStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
    >
      {allContent}
    </EdgeTouchableOpacity>
  ) : (
    <View style={viewStyle}>{allContent}</View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  backgroundFill: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: theme.cardBorderRadius,
    backgroundColor: theme.cardBaseColor,
    overflow: 'hidden'
  },
  cardContainer: {
    borderRadius: theme.cardBorderRadius,
    alignSelf: 'stretch'
  },
  cornerContainer: {
    margin: theme.rem(1),
    top: 0,
    right: 0,
    position: 'absolute'
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: theme.cardOverlayDisabled,
    borderRadius: theme.cardBorderRadius,
    justifyContent: 'center',
    margin: 2,
    pointerEvents: 'none'
  },
  iconRowContainer: {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  fill: {
    flex: 1
  }
}))
