import * as React from 'react'
import { BackHandler, Keyboard, Platform, TextInput, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { fixSides, mapSides, sidesToMargin } from '../../util/sides'
import { Theme, useTheme } from '../services/ThemeContext'
import { PinDots } from './PinDots'

export const MAX_PIN_LENGTH = 4

interface Props {
  pin: string
  maxPinLength?: number
  marginRem?: number[] | number
  onChangePin: (newPin: string) => void
}

export const DigitInput = (props: Props) => {
  const { pin, maxPinLength = MAX_PIN_LENGTH, marginRem, onChangePin } = props

  const theme = useTheme()
  const styles = getStyles(theme)
  const spacings = sidesToMargin(mapSides(fixSides(marginRem, 0.5), theme.rem))

  const inputRef = React.useRef<TextInput | null>(null)
  const [isBackButtonPressed, setIsBackButtonPressed] = React.useState(false)

  const handleRefocus = () => {
    if (inputRef.current != null && !isBackButtonPressed) {
      if (Platform.OS === 'android') inputRef.current.blur()
      inputRef.current.focus()
    }
  }

  const handleBlur = () => {
    if (pin.length < maxPinLength && !isBackButtonPressed) {
      handleRefocus()
    }
  }

  React.useEffect(() => {
    const keyboardDidHide = () => {
      if (inputRef.current != null && !isBackButtonPressed) {
        handleBlur()
      }
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setIsBackButtonPressed(true)
        return false // Allow default back action to proceed
      }
    )

    const hideSubscription = Keyboard.addListener(
      'keyboardDidHide',
      keyboardDidHide
    )

    return () => {
      hideSubscription.remove()
      backHandler.remove()
    }
  }, [pin.length, maxPinLength, isBackButtonPressed])

  return (
    <View style={[styles.container, spacings]}>
      <View style={styles.interactiveContainer}>
        <PinDots pinLength={pin.length} maxLength={maxPinLength} />
      </View>
      <TextInput
        ref={inputRef}
        style={styles.input}
        onFocus={() => setIsBackButtonPressed(false)}
        onChangeText={onChangePin}
        maxLength={maxPinLength}
        keyboardType="number-pad"
        returnKeyType="none"
        value={pin}
        autoFocus
      />
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    alignSelf: 'center'
  },
  interactiveContainer: {
    width: theme.rem(13)
  },
  input: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    opacity: 0
  }
}))
