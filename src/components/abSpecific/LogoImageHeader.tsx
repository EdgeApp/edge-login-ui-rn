import * as React from 'react'
import { Image, TouchableWithoutFeedback, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import * as Assets from '../../assets/'
import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { Branding } from '../../types/Branding'
import { Theme, useTheme } from '../services/ThemeContext'

interface Props {
  branding: Branding
}

export function LogoImageHeader(props: Props): JSX.Element {
  const { branding } = props
  const { primaryLogo = Assets.LOGO_BIG, primaryLogoCallback } = branding
  const theme = useTheme()
  const styles = getStyles(theme)

  const taps = React.useRef(0)
  const handlePress = useHandler(() => {
    if (primaryLogoCallback != null) {
      taps.current++
      if (taps.current > 4) {
        primaryLogoCallback()
        taps.current = 0
      }
      if (taps.current === 1) {
        setTimeout(() => (taps.current = 0), 2000)
      }
    }
  })

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <Image
          accessibilityHint={lstrings.app_logo_hint}
          source={primaryLogo}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    </TouchableWithoutFeedback>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: theme.rem(1.5),
    width: '100%'
  },
  image: {
    height: theme.rem(2.75),
    overflow: 'visible',
    resizeMode: 'contain'
  }
}))
