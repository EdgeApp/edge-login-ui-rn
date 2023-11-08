import * as React from 'react'
import { ActivityIndicator, View } from 'react-native'

import { SceneProps } from '../../types/routerTypes'
import { useTheme } from '../services/ThemeContext'

export function LoadingScene(props: SceneProps<'loading'>): JSX.Element {
  const theme = useTheme()

  return (
    <View style={styles.container}>
      <View style={styles.spinner}>
        <ActivityIndicator color={theme.iconTappable} size="large" />
      </View>
    </View>
  )
}

const styles = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  spinner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
} as const
