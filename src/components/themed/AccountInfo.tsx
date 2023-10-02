import * as React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import Animated, {
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import { lstrings } from '../../common/locales/strings'
import { fixSides, mapSides, sidesToMargin } from '../../util/sides'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from './EdgeText'

interface Props {
  username?: string
  password?: string
  pin?: string
  marginRem?: number[] | number
  onOpen?: () => void
}

interface InfoRow {
  label: string
  value: string | undefined
}

export const AccountInfo = (props: Props) => {
  const { username, password, pin, marginRem, onOpen = () => {} } = props

  const theme = useTheme()
  const styles = getStyles(theme)
  const spacings = sidesToMargin(mapSides(fixSides(marginRem, 0.5), theme.rem))
  const [isExpanded, setIsExpanded] = React.useState(false)

  const animatedRef = useAnimatedRef<View>()
  const expanded = useSharedValue(false)
  const rotation = useSharedValue(0)
  const height = useSharedValue(0)
  const progress = useDerivedValue(() =>
    expanded.value ? withSpring(1) : withTiming(0)
  )

  const borderRadius = theme.rem(0.25)
  const headerStyle = useAnimatedStyle(() => ({
    borderBottomLeftRadius: progress.value === 0 ? borderRadius : 0,
    borderBottomRightRadius: progress.value === 0 ? borderRadius : 0,
    borderBottomWidth: progress.value === 0 ? theme.thinLineWidth : 0
  }))
  const infoStyle = useAnimatedStyle(() => ({
    height: height.value * progress.value + 1,
    opacity: progress.value === 0 ? 0 : 1
  }))
  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotateZ: `${rotation.value}deg` }]
    }
  })

  const infoRows: InfoRow[] = [
    ...(username != null
      ? [{ label: lstrings.username, value: username }]
      : []),
    ...(password != null
      ? [{ label: lstrings.password, value: password }]
      : []),
    { label: lstrings.pin, value: pin }
  ]
  const renderInfoRow = (label: string, value: string | undefined) => (
    <View style={styles.row}>
      <EdgeText
        style={[styles.text, styles.label]}
        numberOfLines={1}
        disableFontScaling
      >
        {label}:
      </EdgeText>
      <EdgeText
        style={[styles.text, styles.detail]}
        numberOfLines={0}
        disableFontScaling
      >
        {value}
      </EdgeText>
    </View>
  )

  return (
    <View style={spacings}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (height.value === 0) {
            onOpen()

            runOnUI(() => {
              'worklet'
              height.value = measure(animatedRef)?.height ?? 0
            })()
          }

          rotation.value = withTiming(expanded.value ? 0 : 180)
          expanded.value = !expanded.value
          setIsExpanded(!isExpanded)
        }}
      >
        <Animated.View style={[styles.header, headerStyle]}>
          <EdgeText style={styles.headerText}>
            {isExpanded
              ? lstrings.hide_account_info
              : lstrings.show_account_info}
          </EdgeText>
          <Animated.View style={[styles.headerIcon, iconStyle]}>
            <MaterialIcon
              name="keyboard-arrow-down"
              size={theme.rem(1.5)}
              color={theme.iconTappable}
            />
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.info, infoStyle]}>
        {infoRows.map(({ label, value }: InfoRow, index: number) =>
          renderInfoRow(label, value)
        )}
      </Animated.View>
      <View style={[styles.info, styles.infoHiddenCopy]} ref={animatedRef}>
        {infoRows.map(({ label, value }: InfoRow, index: number) =>
          renderInfoRow(label, value)
        )}
      </View>
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  header: {
    borderColor: theme.primaryText,
    borderTopLeftRadius: theme.rem(0.25),
    borderTopRightRadius: theme.rem(0.25),
    borderTopWidth: theme.thinLineWidth,
    borderLeftWidth: theme.thinLineWidth,
    borderRightWidth: theme.thinLineWidth,
    paddingHorizontal: theme.rem(1),
    paddingVertical: theme.rem(0.5),
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    flex: 1,
    fontFamily: theme.fontFaceBold,
    fontSize: theme.rem(1)
  },
  headerIcon: {
    alignSelf: 'flex-end'
  },
  info: {
    overflow: 'hidden',
    borderColor: theme.primaryText,
    borderBottomLeftRadius: theme.rem(0.25),
    borderBottomRightRadius: theme.rem(0.25),
    borderBottomWidth: theme.thinLineWidth,
    borderLeftWidth: theme.thinLineWidth,
    borderRightWidth: theme.thinLineWidth,
    paddingHorizontal: theme.rem(1),
    paddingBottom: theme.rem(1),
    marginBottom: theme.rem(0.5)
  },
  row: {
    flexDirection: 'row'
  },
  text: {
    fontSize: theme.rem(0.75)
  },
  label: {
    flex: 3
  },
  detail: {
    flex: 5,
    marginLeft: theme.rem(0.5)
  },
  infoHiddenCopy: {
    position: 'absolute',
    opacity: 0,
    zIndex: -1
  }
}))
