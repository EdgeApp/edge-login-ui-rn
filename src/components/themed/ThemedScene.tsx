import * as React from 'react'
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { cacheStyles } from 'react-native-patina'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import s from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { Branding } from '../../types/Branding'
import { fixSides, mapSides, sidesToPadding } from '../../util/sides'
import { Theme, useTheme } from '../services/ThemeContext'
import { DividerLine } from './DividerLine'

interface Props {
  children?: React.ReactNode

  // Header:
  branding?: Branding
  noUnderline?: boolean
  onBack?: () => void
  onSkip?: () => void
  title?: string

  // Padding:
  paddingRem?: number | number[]
}

export function ThemedScene(props: Props) {
  const {
    branding = {},
    children,
    onBack,
    onSkip,
    paddingRem,
    title,
    noUnderline = false
  } = props
  const { parentButton } = branding
  const theme = useTheme()
  const styles = getStyles(theme)

  const hasHeader =
    onBack != null || onSkip != null || title != null || parentButton != null

  const handleParentButtonPress = useHandler(() => {
    if (parentButton != null) parentButton.callback()
  })

  const containerStyle = {
    flex: 1,
    ...sidesToPadding(mapSides(fixSides(paddingRem, 0.5), theme.rem))
  }
  return (
    <>
      <LinearGradient
        style={StyleSheet.absoluteFill}
        start={theme.backgroundGradientStart}
        end={theme.backgroundGradientEnd}
        colors={theme.backgroundGradientColors}
      />
      <SafeAreaView style={{ flex: 1 }}>
        {!hasHeader ? null : (
          <View style={styles.headerButtons}>
            {onBack == null ? null : (
              <TouchableOpacity style={styles.leftButton} onPress={onBack}>
                <FontAwesome5
                  name="chevron-left"
                  size={theme.rem(1)}
                  color={theme.primaryText}
                />
              </TouchableOpacity>
            )}
            {onSkip == null ? null : (
              <TouchableOpacity style={styles.rightButton} onPress={onSkip}>
                <Text style={styles.buttonText}>{s.strings.skip}</Text>
              </TouchableOpacity>
            )}
            {parentButton == null || parentButton.text == null ? null : (
              <TouchableOpacity
                style={styles.rightButton}
                onPress={handleParentButtonPress}
              >
                <Text style={parentButton.style || styles.buttonText}>
                  {parentButton.text}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {title == null ? null : <Text style={styles.titleText}>{title}</Text>}
        {!hasHeader || noUnderline ? null : (
          <DividerLine marginRem={[1, 1, 0]} />
        )}

        <View style={containerStyle}>{children}</View>
      </SafeAreaView>
    </>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  headerButtons: {
    flexDirection: 'row',
    height: theme.rem(3)
  },
  leftButton: {
    justifyContent: 'center',
    paddingHorizontal: theme.rem(1),
    position: 'absolute',
    bottom: 0,
    left: 0,
    top: 0
  },
  rightButton: {
    justifyContent: 'center',
    paddingHorizontal: theme.rem(1),
    position: 'absolute',
    bottom: 0,
    right: 0,
    top: 0
  },
  buttonText: {
    color: theme.primaryText,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1)
  },
  titleText: {
    color: theme.primaryText,
    fontSize: theme.rem(1.25),
    fontFamily: theme.fontFaceBold,
    marginHorizontal: theme.rem(1)
  }
}))
