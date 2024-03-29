import { cacheStyles, makeThemeContext } from 'react-native-patina'

import { edgeDark } from '../../constants/themes/edgeDark'
import { Theme } from '../../types/Theme'

export type { Theme }
export { cacheStyles }

/**
 * Utility for declaring `withTheme` components.
 */
export interface ThemeProps {
  theme: Theme
}

// Provide the theme context methods:
export const {
  ThemeProvider,
  useTheme,
  withTheme,
  changeTheme,
  getTheme,
  watchTheme
} = makeThemeContext(edgeDark)

/**
 * Changes just the font.
 */
export function changeFont(
  regularFontFamily: string,
  headingFontFamily: string
) {
  changeTheme({
    ...getTheme(),
    fontFamily: regularFontFamily,
    fontFaceBold: headingFontFamily,
    fontFaceDefault: regularFontFamily
  })
}
