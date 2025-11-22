import * as React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { cacheStyles } from 'react-native-patina'

import { fixSides, mapSides, sidesToMargin } from '../../util/sides'
import { Theme, useTheme } from '../services/ThemeContext'

interface Props {
  /** Extend to the right outside of the container. For scene-level usage. */
  extendRight?: boolean
  /** @deprecated Only to be used during the UI4 transition */
  marginRem?: number[] | number

  /** Unused by current Edge themes, but supported for third-party integrations. */
  colors?: string[]
}

const DEFAULT_MARGIN_REM = 0.5
const start = { x: 0, y: 0.5 }
const end = { x: 1, y: 0.5 }

/**
 * A simple horizontal divider line for separating content sections.
 * Uses the theme's thinLineWidth and lineDivider color for consistent styling.
 */
export const DividerLineUi4 = (props: Props): React.ReactElement => {
  const { extendRight = false, marginRem, colors } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const margin =
    marginRem != null
      ? sidesToMargin(mapSides(fixSides(marginRem, 0), theme.rem))
      : extendRight
      ? styles.extendRight
      : styles.default

  const dividerColors = colors ?? [theme.lineDivider, theme.lineDivider]

  return (
    <LinearGradient
      colors={dividerColors}
      start={start}
      end={end}
      style={[styles.divider, margin]}
    />
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  divider: {
    height: theme.thinLineWidth,
    borderBottomWidth: theme.thinLineWidth,
    borderBottomColor: theme.lineDivider
  },
  extendRight: {
    margin: theme.rem(DEFAULT_MARGIN_REM),
    marginRight: -theme.rem(1)
  },
  default: {
    margin: theme.rem(DEFAULT_MARGIN_REM)
  }
}))
