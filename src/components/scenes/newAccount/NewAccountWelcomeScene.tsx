import * as React from 'react'
import { Image, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { sprintf } from 'sprintf-js'

import { LOGO_BIG } from '../../../assets'
import { lstrings } from '../../../common/locales/strings'
import * as Constants from '../../../constants/index'
import { useImports } from '../../../hooks/useImports'
import { useLocalUsers } from '../../../hooks/useLocalUsers'
import { Branding } from '../../../types/Branding'
import { useDispatch } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { Theme, useTheme } from '../../services/ThemeContext'
import { DividerLine } from '../../themed/DividerLine'
import { EdgeText } from '../../themed/EdgeText'
import { MainButton } from '../../themed/MainButton'
import { ThemedScene } from '../../themed/ThemedScene'

interface Props extends SceneProps<'newAccountWelcome'> {
  branding: Branding
}

export const NewAccountWelcomeScene = (props: Props) => {
  const { branding } = props
  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = getStyles(theme)

  const { onLogEvent = () => {} } = useImports()
  const localUsers = useLocalUsers()
  const hasSavedUsers = localUsers.length > 0

  const appName = branding.appName || lstrings.app_name_default
  const buttonType = theme.preferPrimaryButton ? 'primary' : 'secondary'
  const logoSrc = branding.primaryLogo || LOGO_BIG

  const handleDone = (): void => {
    onLogEvent(`Signup_Welcome_Next`)
    dispatch({
      type: 'NAVIGATE',
      data: hasSavedUsers
        ? { name: 'newAccountUsername', params: {} }
        : { name: 'newAccountPin', params: {} }
    })
  }

  const handleExit = (): void => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'landing', params: {} }
    })
  }

  return (
    <ThemedScene onBack={handleExit} title={lstrings.get_started}>
      <View style={styles.content}>
        <Image source={logoSrc} style={styles.logo} resizeMode="contain" />
        <EdgeText style={styles.welcome}>
          {sprintf(lstrings.welcome, appName)}
        </EdgeText>
        <View style={styles.advantage}>
          <MaterialCommunityIcons
            style={styles.advantageImage}
            name="lock"
            size={theme.rem(2)}
          />
          <View style={styles.advantageTextContainer}>
            <EdgeText style={styles.advantageTitle}>
              {sprintf(lstrings.welcome_advantage_one_title, appName)}
            </EdgeText>
            <EdgeText style={styles.advantageDescription} numberOfLines={2}>
              {lstrings.welcome_advantage_one_description_line1}
            </EdgeText>
            <EdgeText style={styles.advantageDescription} numberOfLines={2}>
              {lstrings.welcome_advantage_one_description_line2}
            </EdgeText>
          </View>
        </View>
        <DividerLine marginRem={[1.5, 0.5]} />
        <View style={styles.advantage}>
          <MaterialCommunityIcons
            style={styles.advantageImage}
            name="shield-key"
            size={theme.rem(2)}
          />
          <View style={styles.advantageTextContainer}>
            <EdgeText style={styles.advantageTitle}>
              {lstrings.welcome_advantage_two_title}
            </EdgeText>
            <EdgeText style={styles.advantageDescription} numberOfLines={5}>
              {sprintf(lstrings.welcome_advantage_two_description, appName)}
            </EdgeText>
          </View>
        </View>
        <View style={styles.actions}>
          <MainButton
            label={lstrings.get_started}
            type={buttonType}
            onPress={handleDone}
          />
        </View>
      </View>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flex: 1,
    alignItems: 'center'
  },
  logo: {
    height: theme.rem(2.25),
    marginTop: theme.rem(0.75),
    marginBottom: theme.rem(1)
  },
  welcome: {
    fontFamily: theme.fontFaceBold,
    color: theme.secondaryText,
    fontSize: theme.rem(1),
    marginBottom: theme.rem(2.375)
  },
  advantage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.rem(0.5)
  },
  advantageImage: {
    color: theme.iconTappable,
    height: theme.rem(2),
    width: theme.rem(2),
    marginRight: theme.rem(0.5)
  },
  advantageTextContainer: {
    flex: 1
  },
  advantageTitle: {
    fontFamily: theme.fontFaceBold,
    color: Constants.GRAY_4,
    fontSize: theme.rem(1),
    marginBottom: theme.rem(0.5)
  },
  advantageDescription: {
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.75)
  },
  actions: {
    marginTop: theme.rem(4.5)
  }
}))
