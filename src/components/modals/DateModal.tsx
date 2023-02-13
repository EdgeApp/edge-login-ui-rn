import DateTimePicker from '@react-native-community/datetimepicker'
import * as React from 'react'
import { useState } from 'react'
import {
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme
} from 'react-native'
import { AirshipBridge, AirshipModal } from 'react-native-airship'

import s from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler.js'
import { useTheme } from '../services/ThemeContext'

interface OwnProps {
  bridge: AirshipBridge<Date>
  initialValue: Date
}

type Props = OwnProps
/**
 * Shows the native iOS date picker inside a modal.
 */

const DateModaliOS = (props: Props) => {
  /**
   * Wrap the data picker component in an Airship modal.
   * This modal doesn't use the normal theme colors,
   * since the native component inside uses its own phone-based colors.
   */
  const themeMode = useColorScheme()
  const theme = useTheme()

  const { bridge, initialValue } = props

  const [date, setDate] = useState(initialValue)
  const textStyle: TextStyle = {
    color:
      themeMode === 'dark' ? theme.dateModalTextDark : theme.dateModalTextLight,
    fontSize: theme.rem(1),
    textAlign: 'right',
    paddingHorizontal: theme.rem(1),
    paddingVertical: theme.rem(0.5)
  }
  const handleChange = useHandler((event: unknown, date?: Date) => {
    if (date != null) setDate(date)
  })
  const handleDone = useHandler(() => {
    bridge.resolve(date)
  })

  return (
    <AirshipModal
      bridge={bridge}
      onCancel={handleDone}
      borderRadius={0}
      backgroundColor={
        themeMode === 'dark'
          ? theme.dateModalBackgroundDark
          : theme.dateModalBackgroundLight
      }
    >
      <TouchableOpacity onPress={handleDone}>
        <Text style={textStyle}>{s.strings.done}</Text>
      </TouchableOpacity>
      <DateTimePicker
        display="spinner"
        mode="date"
        onChange={handleChange}
        value={date}
        timeZoneOffsetInMinutes={0}
      />
    </AirshipModal>
  )
}

/**
 * Displays the native Android date picker modal,
 * using the Airship system to manage its lifetime.
 */
export function DateModalAndroid(props: Props) {
  const { bridge, initialValue } = props

  const handleChange = useHandler((event: unknown, date: Date | undefined) => {
    if (date != null) bridge.resolve(date)
    else bridge.reject(new Error('Date was undefined'))
    bridge.remove()
  })

  return (
    <DateTimePicker
      mode="date"
      onChange={handleChange}
      value={initialValue}
      timeZoneOffsetInMinutes={0}
    />
  )
}
export const DateModal = Platform.OS === 'ios' ? DateModaliOS : DateModalAndroid
