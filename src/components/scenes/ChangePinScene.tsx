import * as React from 'react'
import { Keyboard, ScrollView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { submitLogin } from '../../actions/LoginCompleteActions'
import { maybeRouteComplete } from '../../actions/LoginInitActions'
import s from '../../common/locales/strings'
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
  body = s.strings.pin_desc,
  initPin,
  title,
  onBack,
  onSkip,
  onSubmit,
  mainButtonLabel = s.strings.done
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
      <ScrollView ref={scrollViewRef} style={styles.content}>
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
    marginTop: theme.rem(1.5)
  },
  description: {
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875),
    marginBottom: theme.rem(3.25)
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.rem(5),
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
          title={s.strings.pin_changed}
          message={s.strings.pin_successfully_changed}
          buttons={{ ok: { label: s.strings.ok } }}
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
          title={s.strings.pin_changed}
          message={s.strings.pin_successfully_changed}
          buttons={{ ok: { label: s.strings.ok } }}
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
      title={s.strings.change_pin}
      onSubmit={handleSubmit}
    />
  )
}

// The scene for new users to set their PIN
export const NewAccountPinScene = (props: SceneProps<'newAccountPin'>) => {
  const { route } = props
  const dispatch = useDispatch()
  const { onLogEvent = (event, values?) => {} } = useImports()

  const lightAccount = route.params.username == null

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
  const handleSubmit = useHandler((newPin: string) => {
    onLogEvent('Signup_PIN_Valid')
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'newAccountTos', params: { ...route.params, pin: newPin } }
    })
  })

  return (
    <ChangePinSceneComponent
      body={lightAccount ? s.strings.pin_desc_alt : undefined}
      title={s.strings.choose_title_pin}
      onBack={handleBack}
      onSubmit={handleSubmit}
      mainButtonLabel={s.strings.next_label}
    />
  )
}
