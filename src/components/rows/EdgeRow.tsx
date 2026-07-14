import * as React from 'react'
import { ActivityIndicator, StyleProp, View, ViewStyle } from 'react-native'

import { useHandler } from '../../hooks/useHandler'
import { fixSides, mapSides, sidesToMargin } from '../../util/sides'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { ChevronRightIcon } from '../icons/ThemedIcons'
import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'

const textHeights = {
  small: 2,
  medium: 3,
  large: 0
}

// Trimmed port of edge-react-gui's `EdgeRow`. login-ui only needs the
// non-tappable and chevron (`touchable`) variants, so the copy/edit/delete/
// question affordances (which pull a Clipboard dependency and extra themed
// icons the login SDK does not vendor) are intentionally omitted. Keep the
// remaining API a strict subset of the GUI component so a later full sync
// stays compatible.
export type RowActionIcon = 'none' | 'touchable'

interface Props {
  body?: string
  children?: React.ReactNode
  error?: boolean
  icon?: React.ReactNode
  loading?: boolean
  maximumHeight?: 'small' | 'medium' | 'large'
  rightButtonType?: RowActionIcon
  title?: string
  testID?: string
  onLongPress?: () => Promise<void> | void
  onPress?: () => Promise<void> | void

  /** @deprecated Only to be used during the UI4 transition */
  marginRem?: number[] | number
}

export const EdgeRow: React.FC<Props> = (props: Props) => {
  const {
    body,
    children,
    error,
    icon,
    loading,
    marginRem,
    maximumHeight = 'medium',
    testID,
    title,

    // Handlers:
    onLongPress,
    onPress,
    rightButtonType = onLongPress == null && onPress == null
      ? 'none'
      : 'touchable'
  } = props

  const theme = useTheme()
  const styles = getStyles(theme)

  const numberOfLines = textHeights[maximumHeight]

  const containerStyle: StyleProp<ViewStyle> = React.useMemo(
    () => [
      styles.container,
      sidesToMargin(mapSides(fixSides(marginRem, 0.5), theme.rem))
    ],
    [marginRem, styles.container, theme]
  )

  const handlePress = useHandler(async () => {
    if (onPress != null) {
      await onPress()
    }
  })

  const handleLongPress = useHandler(async () => {
    if (onLongPress != null) {
      await onLongPress()
    }
  })

  const rightButtonVisible = rightButtonType !== 'none'
  const isTappable = onPress != null || onLongPress != null

  const content = (
    <>
      {icon}
      <View
        style={[
          styles.content,
          rightButtonVisible ? styles.tappableIconMargin : styles.fullWidth
        ]}
      >
        {title == null ? null : (
          <EdgeText
            ellipsizeMode="tail"
            style={error ? styles.textHeaderError : styles.textHeader}
          >
            {title}
          </EdgeText>
        )}
        {loading ? (
          <ActivityIndicator
            style={styles.loader}
            color={theme.primaryText}
            size="large"
          />
        ) : (
          children ??
          (body == null ? null : (
            <EdgeText
              style={styles.textBody}
              numberOfLines={numberOfLines}
              ellipsizeMode="tail"
            >
              {body}
            </EdgeText>
          ))
        )}
      </View>
      {
        // If the right action icon button is visible, only the icon dims on tap
        rightButtonVisible ? (
          <EdgeTouchableOpacity
            accessible={false}
            style={styles.tappableIconContainer}
            testID={testID}
            onPress={handlePress}
            onLongPress={handleLongPress}
            disabled={loading}
          >
            <ChevronRightIcon style={styles.tappableIcon} size={theme.rem(1)} />
          </EdgeTouchableOpacity>
        ) : null
      }
    </>
  )

  // The entire row dims on tap if not handled by the right action icon button.
  return isTappable && !rightButtonVisible ? (
    <EdgeTouchableOpacity
      accessible={false}
      disabled={loading}
      style={containerStyle}
      testID={testID}
      onLongPress={handleLongPress}
      onPress={handlePress}
    >
      {content}
    </EdgeTouchableOpacity>
  ) : (
    <View style={containerStyle}>{content}</View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    backgroundColor: theme.tileBackground,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexShrink: 1
  },
  content: {
    flexDirection: 'column',
    flexShrink: 1
  },
  fullWidth: {
    flexGrow: 1
  },
  tappableIcon: {
    color: theme.iconTappable,
    marginLeft: theme.rem(0.5),
    textAlign: 'center'
  },
  tappableIconContainer: {
    // Positioned absolutely with full width to increase the tappable area
    // overlapping the content, improving ease of tappability.
    position: 'absolute',
    right: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  tappableIconMargin: {
    // Extra invisible space to align the content when the right tappable icon
    // is visible, since the right tappable icon + TouchableOpacity is
    // positioned absolutely.
    marginRight: theme.rem(1.5)
  },
  textHeader: {
    color: theme.secondaryText,
    fontSize: theme.rem(0.75),
    paddingRight: theme.rem(1)
  },
  textHeaderError: {
    color: theme.dangerText,
    fontSize: theme.rem(0.75)
  },
  textBody: {
    color: theme.primaryText,
    fontSize: theme.rem(1)
  },
  loader: {
    marginTop: theme.rem(0.25)
  }
}))
