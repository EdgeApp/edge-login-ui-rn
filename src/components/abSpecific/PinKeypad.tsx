import * as React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import { lstrings } from '../../common/locales/strings'
import { Theme, useTheme } from '../services/ThemeContext'
import { PinButton } from '../themed/PinButton'

type Key = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'back'

interface Props {
  disabled?: boolean
  onPress: (key: Key) => void
}

export function PinKeypad(props: Props): JSX.Element {
  const { disabled, onPress } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  return (
    <View style={styles.keypadContainer}>
      <View style={styles.keypadInner}>
        <View style={styles.keypadRow}>
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_one}
              onPress={() => onPress('1')}
            />
          </View>
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_two}
              onPress={() => onPress('2')}
            />
          </View>
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_three}
              onPress={() => onPress('3')}
            />
          </View>
        </View>
        <View style={styles.keypadRow}>
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_four}
              onPress={() => onPress('4')}
            />
          </View>
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_five}
              onPress={() => onPress('5')}
            />
          </View>
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_six}
              onPress={() => onPress('6')}
            />
          </View>
        </View>
        <View style={styles.keypadRow}>
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_seven}
              onPress={() => onPress('7')}
            />
          </View>
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_eight}
              onPress={() => onPress('8')}
            />
          </View>
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_nine}
              onPress={() => onPress('9')}
            />
          </View>
        </View>
        <View style={styles.keypadRow}>
          <View style={styles.keypadColumnBlank} />
          <View style={styles.keypadBox}>
            <PinButton
              label={lstrings.keypad_zero}
              onPress={() => onPress('0')}
            />
          </View>
          <TouchableWithoutFeedback
            onPress={() => onPress('back')}
            disabled={disabled}
          >
            <View style={styles.keypadColumnBack}>
              <MaterialIcon name="backspace" style={styles.keypadKeysBack} />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </View>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  keypadContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  keypadInner: {
    flex: 1,
    maxWidth: theme.rem(22),
    height: theme.rem(13),
    maxHeight: theme.rem(19)
  },
  keypadRow: {
    flex: 1,
    flexDirection: 'row'
  },
  keypadBox: {
    flex: 1,
    margin: theme.rem(0.125),
    // borderColor: 'red',
    // borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  keypadColumnBack: {
    flex: 1,
    margin: theme.rem(0.125),
    justifyContent: 'center',
    alignItems: 'center'
  },
  keypadColumnBlank: {
    flex: 1,
    margin: theme.rem(0.125)
  },
  keypadKeysBack: {
    textAlign: 'center',
    fontSize: theme.rem(2),
    color: theme.secondaryButtonOutline
  }
}))
