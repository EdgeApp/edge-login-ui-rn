import * as React from 'react'
import { Image, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { SceneProps } from '../../types/routerTypes'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'
import { ThemedScene } from '../themed/ThemedScene'

const loader = require('../../assets/safeLoader.gif')

interface Props extends SceneProps<'newAccountWait'> {
  title: string
  message: string
}

export const WaitScene = (props: Props) => {
  const { message, title } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <ThemedScene>
      <View style={styles.content}>
        <EdgeText style={styles.title}>{title}</EdgeText>
        <EdgeText style={styles.message}>{message}</EdgeText>
        <Image source={loader} style={styles.loaderImage} />
      </View>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontFamily: theme.fontFaceBold,
    fontSize: theme.rem(1.25),
    marginBottom: theme.rem(1.25)
  },
  message: {
    fontFamily: theme.fontFaceBold,
    fontSize: theme.rem(1),
    marginBottom: theme.rem(2),
    textAlign: 'center'
  },
  loaderImage: {
    width: theme.rem(5),
    height: theme.rem(5)
  }
}))
