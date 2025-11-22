import * as React from 'react'
import { SafeAreaView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { Branding } from '../../types/Branding'
import { fixSides, mapSides, sidesToPadding } from '../../util/sides'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { UnscaledText } from '../common/UnscaledText'
import { ChevronLeftIcon } from '../icons/ThemedIcons'
import { Theme, useTheme } from '../services/ThemeContext'
import { DividerLine } from './DividerLine'

interface Props {
  children?: React.ReactNode

  // Header:
  backButtonText?: string
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
    backButtonText,
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
    <SafeAreaView style={{ flex: 1 }}>
      {!hasHeader ? null : (
        <View style={styles.headerButtons}>
          {onBack == null ? null : (
            <EdgeTouchableOpacity
              accessible={false}
              style={styles.leftButton}
              onPress={onBack}
              testID="headerLeftButton"
            >
              <ChevronLeftIcon
                color={theme.primaryText}
                size={theme.rem(1)}
                style={styles.buttonIcon}
              />
              {backButtonText == null ? null : (
                <UnscaledText accessible style={styles.buttonText}>
                  {backButtonText}
                </UnscaledText>
              )}
            </EdgeTouchableOpacity>
          )}
          {onSkip == null ? null : (
            <EdgeTouchableOpacity
              accessible
              testID="headerRightButton"
              style={styles.rightButton}
              onPress={onSkip}
            >
              <UnscaledText style={styles.buttonText}>
                {lstrings.skip}
              </UnscaledText>
            </EdgeTouchableOpacity>
          )}
          {parentButton == null || parentButton.text == null ? null : (
            <EdgeTouchableOpacity
              accessible
              style={styles.rightButton}
              onPress={handleParentButtonPress}
            >
              <UnscaledText style={parentButton.style || styles.buttonText}>
                {parentButton.text}
              </UnscaledText>
            </EdgeTouchableOpacity>
          )}
        </View>
      )}
      {title == null ? null : (
        <View>
          <UnscaledText style={styles.titleText}>{title}</UnscaledText>
        </View>
      )}
      {!hasHeader || noUnderline ? null : <DividerLine marginRem={[1, 1, 0]} />}
      <View style={containerStyle}>{children}</View>
    </SafeAreaView>
  )
}

const getStyles = cacheStyles((theme: Theme) => {
  // Roughly the same as the height as the GUI.
  // The GUI uses react-navigation's getDefaultHeaderHeight to get the
  // platform-specific height.
  const buttonHeight = theme.rem(2.5)

  return {
    headerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    leftButton: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: theme.rem(1),
      minWidth: theme.rem(3),
      minHeight: buttonHeight
    },
    rightButton: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingHorizontal: theme.rem(1),
      minWidth: theme.rem(3),
      minHeight: buttonHeight
    },
    buttonIcon: {
      color: theme.primaryText,
      paddingRight: theme.rem(0.5),
      height: theme.rem(1)
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
  }
})
