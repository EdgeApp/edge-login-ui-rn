import * as React from 'react'
import { TextInput, TouchableWithoutFeedback, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { validatePin } from '../../actions/CreateAccountActions'
import { useDispatch, useSelector } from '../../types/ReduxTypes'
import { fixSides, mapSides, sidesToMargin } from '../../util/sides'
import { Theme, useTheme } from '../services/ThemeContext'
import { PinDots } from './PinDots'

export const MAX_PIN_LENGTH = 4

interface Props {
  maxPinLength?: number
  marginRem?: number[] | number
}

export const DigitInput = (props: Props) => {
  const { maxPinLength = MAX_PIN_LENGTH, marginRem } = props

  const theme = useTheme()
  const styles = getStyles(theme)
  const spacings = sidesToMargin(mapSides(fixSides(marginRem, 0.5), theme.rem))

  const inputRef = React.useRef<TextInput | null>(null)

  const dispatch = useDispatch()
  const pin = useSelector(state => state.create.pin)

  const handleRefocus = () => {
    if (inputRef.current != null) inputRef.current.focus()
  }

  const handleUpdate = (pin: string) => {
    // Change pin only when input are numbers
    if (/^\d+$/.test(pin) || pin.length === 0) {
      dispatch(validatePin(pin))
    }
  }

  return (
    <TouchableWithoutFeedback onPress={handleRefocus}>
      <View style={[styles.container, spacings]}>
        <View style={styles.interactiveContainer}>
          <PinDots pinLength={pin.length} maxLength={maxPinLength} />
        </View>
        <TextInput
          ref={inputRef}
          style={styles.input}
          onChangeText={handleUpdate}
          maxLength={maxPinLength}
          keyboardType="number-pad"
          value={pin}
          autoFocus
        />
      </View>
    </TouchableWithoutFeedback>
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
