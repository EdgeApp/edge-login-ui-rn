import * as React from 'react'
import { View } from 'react-native'

import { cacheStyles, Theme, useTheme } from '../services/ThemeContext'
import { EdgeCard } from '../ui4/EdgeCard'
import { EdgeText } from './EdgeText'

interface Props {
  title: string
  icon?: React.ReactNode
  minimumFontScale?: number
  subTitle?: string
  testID?: string
  onPress: () => Promise<void> | void
}

/**
 * A whole-card tappable row that leads with the title in primary text and puts
 * a smaller blue explanation underneath, the way the GUI's Help modal presents
 * its options.
 *
 * Trimmed port of edge-react-gui's `SelectableRow`. login-ui only needs the
 * tappable variant, so the GUI component's disabled (dimmed, non-interactive)
 * state is intentionally omitted; the `testID` prop is the one addition, since
 * this SDK's flows target rows by handle. Keep the shared props a strict subset
 * of the GUI component so a later full sync stays compatible.
 *
 * The subtitle reads `theme.selectableRowSubtitle` rather than the GUI's
 * `theme.secondaryText`: login-ui's `secondaryText` is a muted blue-grey that
 * nine other call sites depend on, so the accent blue lives in its own key.
 */
export const SelectableRow: React.FC<Props> = (props: Props) => {
  const {
    icon,
    minimumFontScale = 0.65,
    subTitle,
    testID,
    title,
    onPress
  } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <EdgeCard testID={testID} onPress={onPress}>
      <View style={styles.rowContainer}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.textContainer}>
          <EdgeText numberOfLines={1}>{title}</EdgeText>
          {subTitle == null ? null : (
            <EdgeText
              style={styles.subTitle}
              numberOfLines={2}
              minimumFontScale={minimumFontScale}
            >
              {subTitle}
            </EdgeText>
          )}
        </View>
      </View>
    </EdgeCard>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  rowContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  iconContainer: {
    margin: theme.rem(0.5)
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    margin: theme.rem(0.5)
  },
  subTitle: {
    color: theme.selectableRowSubtitle,
    fontSize: theme.rem(0.75),
    marginTop: theme.rem(0.25)
  }
}))
