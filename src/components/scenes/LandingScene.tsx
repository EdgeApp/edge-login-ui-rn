import * as React from 'react'
import { View } from 'react-native'

import { lstrings } from '../../common/locales/strings'
import * as Constants from '../../constants/index'
import { useHandler } from '../../hooks/useHandler'
import { useImports } from '../../hooks/useImports'
import { Branding } from '../../types/Branding'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { scale } from '../../util/scaling'
import { LogoImageHeader } from '../abSpecific/LogoImageHeader'
import { ButtonsView } from '../buttons/ButtonsView'
import { UnscaledText } from '../common/UnscaledText'
import { ThemedScene } from '../themed/ThemedScene'

interface Props extends SceneProps<'landing'> {
  branding: Branding
}

export const LandingScene = (props: Props) => {
  const { branding } = props
  const dispatch = useDispatch()
  const { initialUserInfo, onLogEvent = () => {} } = useImports()

  const handleCreate = useHandler(() => {
    onLogEvent('Signup_Create_Account')
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'newAccountWelcome', params: {} }
    })
  })
  const handlePassword = useHandler(() => {
    onLogEvent('Signup_Signin')
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'passwordLogin',
        params: { username: initialUserInfo?.username ?? '' }
      }
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
                <UnscaledText style={styles.tagText}>
                  {branding.landingSceneText ?? lstrings.landing_tagline}
                </UnscaledText>
              </View>
            </View>
          </View>
        </View>

        <ButtonsView
          primary={{
            label: lstrings.get_started,
            testID: 'createAccountButton',
            onPress: handleCreate
          }}
          tertiary={{
            label: lstrings.landing_already_have_account,
            testID: 'alreadyHaveAccountButton',
            onPress: handlePassword
          }}
          parentType="scene"
        />
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
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1
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
