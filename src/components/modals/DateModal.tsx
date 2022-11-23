import DateTimePicker from '@react-native-community/datetimepicker'
import * as React from 'react'
import { useMemo, useState } from 'react'
import {
  Platform,
  Text,
  TextStyle,
  TouchableOpacity,
  useColorScheme
} from 'react-native'
import { AirshipBridge, AirshipModal } from 'react-native-airship'

import s from '../../common/locales/strings'
import { useTheme } from '../services/ThemeContext'

interface OwnProps {
  bridge: AirshipBridge<Date>
  initialValue?: Date
  minimumDate?: Date
  maximumDate?: Date
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
  const today = new Date()

  const {
    bridge,
    initialValue = today,
    minimumDate = today,
    maximumDate = new Date(1900, 0, 1)
  } = props

  const isDarkMode = useMemo(() => themeMode === 'dark', [themeMode])
  const [date, setDate] = useState(initialValue)
  const textStyle: TextStyle = {
    color: isDarkMode ? theme.dateModalTextDark : theme.dateModalTextLight,
    fontSize: theme.rem(1),
    textAlign: 'right',
    paddingHorizontal: theme.rem(1),
    paddingVertical: theme.rem(0.5)
  }
  const handleChange = (date: Date | undefined) => {
    console.log(`New Date: ${date?.toJSON()}`)
    if (date != null) setDate(date)
  }
  const handleDone = () => {
    bridge.resolve(date)
  }

  return (
    <AirshipModal
      bridge={bridge}
      onCancel={handleDone}
      borderRadius={0}
      backgroundColor={
        isDarkMode
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
        onChange={(e, date) => handleChange(date)}
        value={date}
        maximumDate={maximumDate} // Yesterday
        minimumDate={minimumDate} // 100 years ago
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
  const today = new Date()
  const {
    bridge,
    initialValue,
    minimumDate = new Date(today.getTime() - 86400000),
    maximumDate = new Date(today.getFullYear() - 100, 0, 1)
  } = props

  return (
    <DateTimePicker
      mode="date"
      onChange={(e, date: Date | undefined) => {
        if (date != null) bridge.resolve(date)
        else bridge.reject(new Error('Date was undefined'))
        bridge.remove()
      }}
      value={initialValue ?? new Date(today.getFullYear(), 0, 1)}
      maximumDate={minimumDate}
      minimumDate={maximumDate}
    />
  )
}
export const DateModal = Platform.OS === 'ios' ? DateModaliOS : DateModalAndroid
