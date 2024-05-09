import * as React from 'react'
import { Text } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import { fixSides, mapSides, sidesToPadding } from '../../util/sides'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { Theme, useTheme } from '../services/ThemeContext'

interface Props {
  onPress?: () => void

  // If this is set, the component will insert a text node before the other children:
  label?: string

  // The gap around the button. Takes 0-4 numbers (top, right, bottom, left),
  // using the same logic as the web `margin` property. Defaults to 0.
  marginRem?: number[] | number

  // The icon to show, if an arrow is not desired:
  renderIcon?: (theme: Theme) => React.ReactNode
}

export function LinkRow(props: Props) {
  const {
    label,
    marginRem,
    onPress,
    renderIcon = (theme: Theme) => (
      <FontAwesome5
        name="chevron-right"
        color={theme.iconTappable}
        size={theme.rem(1)}
      />
    )
  } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const spacingStyles = {
    // Switch padding to margin for a bigger touch target:
    ...sidesToPadding(mapSides(fixSides(marginRem, 0.5), theme.rem))
  }
  return (
    <EdgeTouchableOpacity
      accessible={false}
      style={[styles.container, spacingStyles]}
      onPress={onPress}
    >
      {label == null ? null : (
        <Text accessible style={styles.text}>
          {label}
        </Text>
      )}
      <Text style={styles.icon}>{renderIcon(theme)}</Text>
    </EdgeTouchableOpacity>
  )
}

const getStyles = cacheStyles((theme: Theme) => {
  return {
    container: {
      alignItems: 'center',
      flexDirection: 'row'
    },
    icon: {
      color: theme.iconTappable,
      fontSize: theme.rem(1),
      marginLeft: theme.rem(1)
    },
    text: {
      color: theme.primaryText,
      flex: 1,
      fontFamily: theme.fontFamily,
      fontSize: theme.rem(1)
    }
  }
})
