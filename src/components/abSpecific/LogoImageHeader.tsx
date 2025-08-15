import * as React from 'react'
import { Image, ImageBackground, PixelRatio } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import * as Assets from '../../assets/'
import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { Branding } from '../../types/Branding'
import { EdgeTouchableWithoutFeedback } from '../common/EdgeTouchableWithoutFeedback'
import { Theme, useTheme } from '../services/ThemeContext'

interface Props {
  branding: Branding
}

export function LogoImageHeader(props: Props): JSX.Element {
  const { branding } = props
  const { primaryLogo = Assets.LOGO_BIG, primaryLogoCallback } = branding
  const theme = useTheme()
  const styles = getStyles(theme)

  // Compute a pixel-aligned width while preserving the desired visual height.
  const imageStyle = React.useMemo(() => {
    const desiredHeightDp = theme.rem(2.75)
    const source = Image.resolveAssetSource(primaryLogo)
    const aspectRatio = source.width / source.height
    const scale = PixelRatio.get()
    const widthDp = Math.round(desiredHeightDp * aspectRatio * scale) / scale
    return { width: widthDp, aspectRatio }
  }, [primaryLogo, theme])

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
    <EdgeTouchableWithoutFeedback onPress={handlePress}>
      <ImageBackground
        accessibilityHint={lstrings.app_logo_hint}
        source={primaryLogo}
        resizeMode="contain"
        style={[styles.imageContainer, imageStyle]}
      />
    </EdgeTouchableWithoutFeedback>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: theme.rem(1.5),
    width: '100%',
    // Height is derived from width + aspectRatio to avoid fractional pixel rounding
    overflow: 'visible',
    resizeMode: 'contain'
  }
}))
