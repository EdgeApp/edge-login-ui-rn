import * as React from 'react'
import { View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { useTheme } from '../services/ThemeContext'

/*
 * Used for adding a gradient fadeout to the bottom of a list modal
 */
export function GradientFadeOut() {
  const theme = useTheme()
  const color = theme.modal
  const marks: number[] = [0, 0.2, 0.75, 1]
  const colors: string[] = marks.map(
    mark => color + `0${Math.floor(255 * mark).toString(16)}`.slice(-2)
  )
  return (
    <View>
      <LinearGradient
        style={{
          position: 'absolute',
          height: theme.rem(1.5),
          width: '100%',
          bottom: 0
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={colors}
        locations={marks.map(mark => mark)}
        pointerEvents="none"
      />
    </View>
  )
}
