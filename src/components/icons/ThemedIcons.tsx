import AntDesignIcon from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import IonIcon from '@expo/vector-icons/Ionicons'
import { isLoaded } from 'expo-font'
import React from 'react'
import Animated, {
  SharedValue,
  useAnimatedStyle
} from 'react-native-reanimated'

import { useTheme } from '../services/ThemeContext'

//
// Types
//

export interface AnimatedIconProps {
  accessible?: boolean
  color?: SharedValue<string>
  size?: SharedValue<number>
}
export type AnimatedIconComponent = React.FunctionComponent<AnimatedIconProps>

type IconStyle = React.ComponentProps<typeof AntDesignIcon>['style']

export interface IconProps {
  accessible?: boolean
  color?: string
  size?: number
  style?: IconStyle
}
export type IconComponent = React.FunctionComponent<IconProps>

type FontIconSet = React.ComponentType<any> & {
  getFontFamily: () => string
  getRawGlyphMap: () => Record<string, string | number>
  loadFont: () => Promise<void>
}

//
// Inner components
//

interface IconChoice {
  IconComponent: FontIconSet
  name: string
}

/**
 * The @expo/vector-icons families register their fonts with expo-font the
 * first time one of their own components renders. We draw glyphs into a raw
 * text node, so we have to request the font ourselves.
 */
function useIconFont(IconComponent: FontIconSet): boolean {
  const [fontIsLoaded, setFontIsLoaded] = React.useState(() =>
    isLoaded(IconComponent.getFontFamily())
  )

  React.useEffect(() => {
    if (fontIsLoaded) return
    let alive = true
    IconComponent.loadFont().then(
      () => {
        if (alive) setFontIsLoaded(true)
      },
      () => {}
    )
    return () => {
      alive = false
    }
  }, [IconComponent, fontIsLoaded])

  return fontIsLoaded
}

function AnimatedFontIcon(props: AnimatedIconProps & IconChoice): JSX.Element {
  const { accessible, color, IconComponent, name, size } = props
  const theme = useTheme()
  const defaultColor = theme.icon
  const defaultSize = theme.rem(1)

  const fontIsLoaded = useIconFont(IconComponent)
  const fontFamily = IconComponent.getFontFamily()
  const glyphMap = IconComponent.getRawGlyphMap()
  const code = glyphMap[name]
  const glyph =
    typeof code === 'number' ? String.fromCodePoint(code) : String(code ?? '')

  const style = useAnimatedStyle(() => ({
    color: color?.value ?? defaultColor,
    fontFamily,
    fontSize: size?.value ?? defaultSize,
    fontStyle: 'normal',
    fontWeight: 'normal'
  }))

  // We use a raw `Animated.Text` here to avoid conflicts between
  // the icon library & the reanimated library:
  return (
    <Animated.Text
      allowFontScaling={false}
      accessible={accessible}
      style={style}
    >
      {fontIsLoaded ? glyph : ''}
    </Animated.Text>
  )
}

function ThemedFontIcon(props: IconProps & IconChoice): React.ReactElement {
  const theme = useTheme()
  const {
    accessible,
    color = theme.icon,
    IconComponent,
    name,
    size = theme.rem(1),
    style
  } = props

  const baseStyle = {
    color,
    fontSize: size
  }
  const combinedStyle = style == null ? baseStyle : [baseStyle, style]

  return (
    <IconComponent
      accessible={accessible}
      name={name}
      adjustsFontSizeToFit
      style={combinedStyle}
    />
  )
}

//
// HOC's
//

function makeAnimatedFontIcon(
  IconComponent: FontIconSet,
  name: string
): AnimatedIconComponent {
  return props => AnimatedFontIcon({ ...props, IconComponent, name })
}

function makeFontIcon(IconComponent: FontIconSet, name: string): IconComponent {
  return props => ThemedFontIcon({ ...props, IconComponent, name })
}

//
// Font Icons
//

export function EyeIconAnimated(
  props: AnimatedIconProps & { off: boolean }
): JSX.Element {
  const { off, ...rest } = props

  // Swapping between two icons causes rendering glitches,
  // so we recycle the same component with different props:
  return AnimatedFontIcon({
    ...rest,
    IconComponent: IonIcon,
    name: off ? 'eye-off-outline' : 'eye-outline'
  })
}

export const ChevronLeftAnimated = makeAnimatedFontIcon(Feather, 'chevron-left')

export const ChevronUpIcon = makeFontIcon(Feather, 'chevron-up')
export const ChevronDownIcon = makeFontIcon(Feather, 'chevron-down')
export const ChevronLeftIcon = makeFontIcon(Feather, 'chevron-left')
export const ChevronRightIcon = makeFontIcon(Feather, 'chevron-right')

export const CloseIcon = makeFontIcon(AntDesignIcon, 'close')
export const CloseIconAnimated = makeAnimatedFontIcon(AntDesignIcon, 'close')

export const SearchIcon = makeFontIcon(AntDesignIcon, 'search1')
export const SearchIconAnimated = makeAnimatedFontIcon(AntDesignIcon, 'search1')
