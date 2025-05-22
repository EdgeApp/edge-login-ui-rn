import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Keyboard, ScrollView } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { completeLogin, submitLogin } from '../../actions/LoginCompleteActions'
import { maybeRouteComplete } from '../../actions/LoginInitActions'
import { lstrings } from '../../common/locales/strings'
import { useCreateAccountHandler } from '../../hooks/useCreateAccount'
import { useHandler } from '../../hooks/useHandler'
import { useImports } from '../../hooks/useImports'
import { useScrollToEnd } from '../../hooks/useScrollToEnd'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { EdgeAnim } from '../common/EdgeAnim'
import { SceneButtons } from '../common/SceneButtons'
import { showError, showToast } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { DigitInput, MAX_PIN_LENGTH } from '../themed/DigitInput'
import { EdgeText } from '../themed/EdgeText'
import { ThemedScene } from '../themed/ThemedScene'

export interface ChangePinParams {
  account: EdgeAccount
}

export interface NewAccountPinParams {
  password?: string
  pin?: string
  username?: string
}

export interface ResecurePinParams {
  account: EdgeAccount
}

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
      if (newPin.length === 4) {
        Keyboard.dismiss()
      }
    }
  })

  const scrollViewRef = useScrollToEnd(isValidPin)

  return (
    <ThemedScene onBack={onBack} onSkip={onSkip} title={title}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <EdgeAnim enter={{ type: 'fadeInUp' }}>
          <EdgeText style={styles.description} numberOfLines={0}>
            {body}
          </EdgeText>
        </EdgeAnim>
        <EdgeAnim enter={{ type: 'fadeInDown' }}>
          <DigitInput
            pin={pin}
            testID="pinInput"
            onChangePin={handleChangePin}
          />
        </EdgeAnim>
      </ScrollView>
      <SceneButtons
        absolute
        primary={{
          label: mainButtonLabel,
          onPress: handlePress,
          disabled: !isValidPin
        }}
        animDistanceStart={50}
      />
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  content: {
    flexGrow: 1,
    marginHorizontal: theme.rem(0.5)
  },
  description: {
    fontSize: theme.rem(0.875),
    marginBottom: theme.rem(2)
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
      const isCorrect = await account.checkPin(pin, { forDuressAccount: true })
      if (isCorrect) {
        showToast(lstrings.duress_mode_pin_match_rule_message)
        return
      }
      await account.changePin({ pin })
      showToast(lstrings.pin_changed)
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
      const isCorrect = await account.checkPin(pin, { forDuressAccount: true })
      if (isCorrect) {
        showToast(lstrings.duress_mode_pin_match_rule_message)
        return
      }
      await account.changePin({ pin })
      showToast(lstrings.pin_changed)
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
  const { username, password } = route.params
  const dispatch = useDispatch()
  const { onLogEvent = () => {} } = useImports()

  const lightAccount = username == null

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
      let errorText
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
        const account = await handleCreateAccount({
          password,
          pin: newPin,
          username
        })
        if (account != null) dispatch(completeLogin(account))
      } catch (error: unknown) {
        showError(error)
        errorText = String(error)
        dispatch({
          type: 'NAVIGATE',
          data: {
            name: 'newAccountPin',
            params: route.params
          }
        })
      }
      onLogEvent('Signup_Create_Light_Account', { error: errorText })
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
