import * as React from 'react'
import { Keyboard, ScrollView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { completeLogin, submitLogin } from '../../actions/LoginCompleteActions'
import { maybeRouteComplete } from '../../actions/LoginInitActions'
import { lstrings } from '../../common/locales/strings'
import { useCreateAccountHandler } from '../../hooks/useCreateAccount'
import { useHandler } from '../../hooks/useHandler.js'
import { useImports } from '../../hooks/useImports'
import { useScrollToEnd } from '../../hooks/useScrollToEnd'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { ButtonsModal } from '../modals/ButtonsModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { DigitInput, MAX_PIN_LENGTH } from '../themed/DigitInput'
import { EdgeText } from '../themed/EdgeText'
import { Fade } from '../themed/Fade'
import { MainButton } from '../themed/MainButton'
import { ThemedScene } from '../themed/ThemedScene'

interface Props {
  body?: string
  initPin?: string
  title?: string
  onBack?: () => void
  onSkip?: (() => void) | undefined
  onSubmit: (pin: string) => void
  mainButtonLabel?: string
}

const ChangePinSceneComponent = ({
  body = lstrings.pin_desc,
  initPin,
  title,
  onBack,
  onSkip,
  onSubmit,
  mainButtonLabel = lstrings.done
}: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  const [pin, setPin] = React.useState(initPin ?? '')

  const isValidPin = pin.length === MAX_PIN_LENGTH

  const handlePress = useHandler(() => (isValidPin ? onSubmit(pin) : undefined))
  const handleChangePin = useHandler((newPin: string) => {
    // Change pin only when input are numbers
    if ((/^\d+$/.test(newPin) || newPin.length === 0) && newPin.length <= 4) {
      setPin(newPin)
    }
  })

  const scrollViewRef = useScrollToEnd(isValidPin)

  return (
    <ThemedScene onBack={onBack} onSkip={onSkip} title={title}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <EdgeText style={styles.description} numberOfLines={0}>
          {body}
        </EdgeText>
        <DigitInput pin={pin} onChangePin={handleChangePin} />
        <View style={styles.actions}>
          <Fade visible={isValidPin}>
            <MainButton
              label={mainButtonLabel}
              type="secondary"
              onPress={handlePress}
            />
          </Fade>
        </View>
      </ScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flex: 1,
    marginHorizontal: theme.rem(0.5),
    marginTop: theme.rem(1)
  },
  description: {
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875),
    marginBottom: theme.rem(2)
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.rem(2),
    minHeight: theme.rem(3 + 15) // 15 is a hack to avoid the keyboard
  }
}))

// The scene for existing users to change their PIN
export const ChangePinScene = (props: SceneProps<'changePin'>) => {
  const { route } = props
  const { account } = route.params
  const { onComplete = () => {} } = useImports()

  const handleSubmit = useHandler(async (pin: string) => {
    Keyboard.dismiss()
    try {
      await account.changePin({ pin })
      await Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={lstrings.pin_changed}
          message={lstrings.pin_successfully_changed}
          buttons={{ ok: { label: lstrings.ok } }}
        />
      ))
      onComplete()
    } catch (e) {
      showError(e)
    }
  })
  return <ChangePinSceneComponent onSubmit={handleSubmit} />
}

// The scene for new users to recover their PIN
export const ResecurePinScene = (props: SceneProps<'resecurePin'>) => {
  const { route } = props
  const { account } = route.params
  const { onComplete = () => {}, onLogin } = useImports()
  const dispatch = useDispatch()

  const handleComplete = () => {
    if (onLogin != null) dispatch(submitLogin(account))
    else onComplete()
  }

  const handleSubmit = useHandler(async (pin: string) => {
    Keyboard.dismiss()
    try {
      await account.changePin({ pin })
      await Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title={lstrings.pin_changed}
          message={lstrings.pin_successfully_changed}
          buttons={{ ok: { label: lstrings.ok } }}
        />
      ))
      handleComplete()
    } catch (e) {
      showError(e)
    }
  })
  return (
    <ChangePinSceneComponent
      onSkip={handleComplete}
      title={lstrings.change_pin}
      onSubmit={handleSubmit}
    />
  )
}

// The scene for new users to set their PIN
export const NewAccountPinScene = (props: SceneProps<'newAccountPin'>) => {
  const { route } = props
  const dispatch = useDispatch()
  const { experimentConfig, onLogEvent = (event, values?) => {} } = useImports()

  const lightAccount = experimentConfig.createAccountType === 'light'

  const handleBack = useHandler(() => {
    dispatch(
      lightAccount
        ? maybeRouteComplete({
            type: 'NAVIGATE',
            data: {
              name: 'passwordLogin',
              params: { username: '' }
            }
          })
        : maybeRouteComplete({
            type: 'NAVIGATE',
            data: {
              name: 'newAccountPassword',
              params: route.params
            }
          })
    )
  })

  const handleCreateAccount = useCreateAccountHandler()

  const handleSubmit = useHandler(async (newPin: string) => {
    onLogEvent('Signup_PIN_Valid')

    if (lightAccount) {
      let error
      try {
        dispatch({
          type: 'NAVIGATE',
          data: {
            name: 'newAccountWait',
            params: {
              title: lstrings.great_job,
              message: lstrings.hang_tight + '\n' + lstrings.secure_account
            }
          }
        })
        const { username, password, pin } = route.params
        const account = await handleCreateAccount({ username, password, pin })
        dispatch(completeLogin(account))
      } catch (e: unknown) {
        error = String(e)
        showError(error)
        dispatch({
          type: 'NAVIGATE',
          data: {
            name: 'newAccountPin',
            params: route.params
          }
        })
      }
      onLogEvent('Signup_Create_Light_Account', { error })
    } else {
      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'newAccountTos',
          params: { ...route.params, pin: newPin }
        }
      })
    }
  })

  return (
    <ChangePinSceneComponent
      body={lightAccount ? lstrings.pin_desc_alt : undefined}
      title={lstrings.choose_title_pin}
      onBack={handleBack}
      onSubmit={handleSubmit}
      mainButtonLabel={lstrings.next_label}
    />
  )
}
