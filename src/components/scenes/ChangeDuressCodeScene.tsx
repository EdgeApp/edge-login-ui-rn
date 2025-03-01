import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'
import { Keyboard, ScrollView } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { useImports } from '../../hooks/useImports'
import { useScrollToEnd } from '../../hooks/useScrollToEnd'
import { SceneProps } from '../../types/routerTypes'
import { EdgeAnim } from '../common/EdgeAnim'
import { SceneButtons } from '../common/SceneButtons'
import { ButtonsModal } from '../modals/ButtonsModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { DigitInput, MAX_PIN_LENGTH } from '../themed/DigitInput'
import { EdgeText } from '../themed/EdgeText'
import { ThemedScene } from '../themed/ThemedScene'
import { SimpleTextInput } from 'edge-login-ui-rn/src/components/themed/SimpleTextInput'
import { DividerLine } from 'edge-login-ui-rn/src/components/themed/DividerLine'
import { setDuressSettings } from 'edge-login-ui-rn/src/duress'

export interface ChangeDuressCodeParams {
  account: EdgeAccount
  context: EdgeContext
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
  const { account, context } = route.params
  const { onComplete = () => {} } = useImports()
  const theme = useTheme()
  const styles = getStyles(theme)
  const [duressPin, setDuressPin] = React.useState('')
  const [duressUsername, setDuressUsername] = React.useState('')

  const handleSubmit = useHandler(async () => {
    if (!isValidPin || !isValidDuressAccount)
      return

    Keyboard.dismiss()
    try {
      setDuressSettings({
        duressUsername,
        duressPin,
      })
      await Airship.show(bridge => (
        <ButtonsModal
          bridge={bridge}
          title="Duress Code Set"
          message={"Duress code and username sucessfully set"}
          buttons={{ ok: { label: lstrings.ok } }}
        />
      ))
      onComplete()
    } catch (e) {
      showError(e)
    }
  })

  const isValidPin = duressPin.length === MAX_PIN_LENGTH
  const isValidDuressAccount = duressUsername.length >= 3

  const handleDuressTextClear = useHandler(() => {
    setDuressUsername('')
  })
  const handleDuressTextChange = useHandler((text: string) => {
    setDuressUsername(text)
  })
  const handleDuressTextSubmit = useHandler(() => {

  })
  const handleChangePin = useHandler((newPin: string) => {
    // Change pin only when input are numbers
    if ((/^\d+$/.test(newPin) || newPin.length === 0) && newPin.length <= 4) {
      setDuressPin(newPin)
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
        <SimpleTextInput
          autoCorrect={false}
          autoCapitalize='none'
          autoFocus={false}
          returnKeyType="next"
          placeholder={'Select duress username'}
          onChangeText={handleDuressTextChange}
          onClear={handleDuressTextClear}
          onSubmitEditing={handleDuressTextSubmit}
          value={duressUsername}
        />
        <DividerLine marginRem={[1.5, 0.5]} />
        <EdgeText>
          Enter your duress account PIN
        </EdgeText>
        <DigitInput
          pin={duressPin}
          testID="pinInput"
          onChangePin={handleChangePin}
        />
      </ScrollView>
      <SceneButtons
        absolute
        primary={{
          label: lstrings.done,
          onPress: handleSubmit,
          disabled: !isValidPin || !isValidDuressAccount
        }}
        animDistanceStart={50}
      />
    </ThemedScene>
  )
}
