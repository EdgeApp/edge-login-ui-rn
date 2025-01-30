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
import { ButtonsModal } from '../modals/ButtonsModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { DigitInput, MAX_PIN_LENGTH } from '../themed/DigitInput'
import { EdgeText } from '../themed/EdgeText'
import { ThemedScene } from '../themed/ThemedScene'

export interface ChangeDuressCodeParams {
  account: EdgeAccount
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
export const ChangeDuressCodeScene = (
  props: SceneProps<'changeDuressCode'>
) => {
  const { route } = props
  const { account } = route.params
  const { onComplete = () => {} } = useImports()
  const theme = useTheme()
  const styles = getStyles(theme)


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

  const [pin, setPin] = React.useState('')

  const isValidPin = pin.length === MAX_PIN_LENGTH

  const handlePress = useHandler(() => (isValidPin ? handleSubmit(pin) : undefined))
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
  const body = lstrings.duress_code_desc

  return (
    <ThemedScene>
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
          label: lstrings.done,
          onPress: handlePress,
          disabled: !isValidPin
        }}
        animDistanceStart={50}
      />
    </ThemedScene>
  )
}
