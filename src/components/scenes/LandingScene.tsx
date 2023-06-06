import * as React from 'react'
import { Text, View } from 'react-native'

import s from '../../common/locales/strings'
import * as Constants from '../../constants/index'
import { useHandler } from '../../hooks/useHandler'
import { Branding } from '../../types/Branding'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { logEvent } from '../../util/analytics'
import { scale } from '../../util/scaling'
import { LogoImageHeader } from '../abSpecific/LogoImageHeader'
import { MainButton } from '../themed/MainButton'
import { ThemedScene } from '../themed/ThemedScene'

interface Props extends SceneProps<'landing'> {
  branding: Branding
  landingSceneText?: string
}

export const LandingScene = (props: Props) => {
  const dispatch = useDispatch()

  const handleCreate = useHandler(() => {
    logEvent('Signup_Create_Account')
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'newAccountWelcome', params: {} }
    })
  })
  const handlePassword = useHandler(() => {
    logEvent('Signup_Signin')
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'passwordLogin', params: {} }
    })
  })

  return (
    <ThemedScene branding={props.branding} noUnderline>
      <View style={styles.container}>
        <View style={styles.inner}>
          <View style={styles.featureBox}>
            <LogoImageHeader branding={props.branding} />
            <View style={styles.featureBoxContent}>
              <View style={styles.featureBoxDescription}>
                <Text style={styles.tagText}>
                  {props.landingSceneText || s.strings.landing_tagline}
                </Text>
              </View>
            </View>
            <View style={styles.createButtonBox}>
              <MainButton
                testID="createAccountButton"
                label={s.strings.landing_create_account_button}
                type="secondary"
                onPress={handleCreate}
              />
            </View>
            <View style={styles.loginButtonBox}>
              <MainButton
                testID="alreadyHaveAccountButton"
                onPress={handlePassword}
                label={s.strings.landing_already_have_account}
                type="textOnly"
              />
            </View>
          </View>
        </View>
      </View>
    </ThemedScene>
  )
}

const styles = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  inner: {
    position: 'relative',
    flex: 1,
    width: '100%',
    height: '100%'
  },
  featureBox: {
    position: 'relative',
    top: scale(71),
    width: '100%',
    height: scale(286)
  },
  featureBoxContent: {
    // height: scale(186), 306- 125 - remaining space.
    width: '100%',
    flexDirection: 'column',
    height: scale(166),
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  featureBoxDescription: {
    // height: scale(186), 306- 125 - remaining space.
    width: '100%',
    justifyContent: 'flex-end'
  },
  createButtonBox: {
    alignSelf: 'center',
    width: '70%'
  },
  loginButtonBox: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: scale(28)
  },
  tagText: {
    width: '80%',
    marginLeft: '10%',
    marginRight: '10%',
    color: Constants.WHITE,
    fontFamily: Constants.FONTS.fontFamilyRegular,
    textAlign: 'center',
    fontSize: scale(14),
    lineHeight: scale(18)
  }
} as const
