import * as React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { UnscaledText } from '../common/UnscaledText'
import { Theme, useTheme } from '../services/ThemeContext'

interface Props {
  error: string | null
  pin: string
  spinner: boolean
}

export function FourDigitDisplay(props: Props): JSX.Element {
  const { error, pin, spinner } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <View style={styles.container}>
      <View style={styles.interactiveContainer}>
        {spinner ? (
          <ActivityIndicator color={theme.primaryText} size="large" />
        ) : (
          <View style={styles.dotContainer}>
            <View
              style={pin.length > 0 ? styles.circleSelected : styles.circle}
            />
            <View
              style={pin.length > 1 ? styles.circleSelected : styles.circle}
            />
            <View
              style={pin.length > 2 ? styles.circleSelected : styles.circle}
            />
            <View
              style={pin.length > 3 ? styles.circleSelected : styles.circle}
            />
          </View>
        )}
      </View>
      <View style={styles.errorContainer}>
        <UnscaledText style={styles.errorText} numberOfLines={2}>
          {error}
        </UnscaledText>
      </View>
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  // used for logging *back in* with PIN
  container: {
    paddingTop: theme.rem(0.75),
    width: '100%',
    height: theme.rem(5.5)
  },
  errorContainer: {
    height: theme.rem(2.5),
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  errorText: {
    color: theme.dangerText,
    textAlign: 'center',
    fontSize: theme.rem(0.75)
  },
  interactiveContainer: {
    height: theme.rem(2.5),
    width: '100%',
    alignItems: 'center'
  },
  dotContainer: {
    height: '100%',
    width: theme.rem(12),
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  circle: {
    borderWidth: 2,
    borderColor: theme.primaryText,
    borderRadius: theme.rem(1),
    height: theme.rem(2),
    width: theme.rem(2)
  },
  circleSelected: {
    backgroundColor: theme.iconTappable,
    borderWidth: 2,
    borderColor: theme.primaryText,
    borderRadius: theme.rem(1),
    height: theme.rem(2),
    width: theme.rem(2)
  }
}))
