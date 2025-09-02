/**
 * IMPORTANT: Changes in this file MUST be synced between edge-react-gui and
 * edge-login-ui-rn!
 */

import DateTimePicker from '@react-native-community/datetimepicker'
import * as React from 'react'
import { Appearance, Platform, TextStyle } from 'react-native'
import { AirshipBridge, AirshipModal } from 'react-native-airship'

import { lstrings } from '../../common/locales/strings'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { UnscaledText } from '../common/UnscaledText'
import { ThemeProps, withTheme } from '../services/ThemeContext'

export interface Props {
  bridge: AirshipBridge<Date>
  initialValue: Date
}

interface State {
  darkMode: boolean
  date: Date
}

/**
 * Shows the native iOS date picker inside a modal.
 */
export class DateModalIos extends React.Component<Props & ThemeProps, State> {
  subscription: { remove: () => void } | undefined

  constructor(props: Props & ThemeProps) {
    super(props)
    this.state = {
      darkMode: Appearance.getColorScheme() === 'dark',
      date: props.initialValue
    }
  }

  componentDidMount() {
    this.subscription = Appearance.addChangeListener(({ colorScheme }) => {
      this.setState({ darkMode: colorScheme === 'dark' })
    })
  }

  componentWillUnmount() {
    if (this.subscription != null) this.subscription.remove()
  }

  /**
   * Wrap the data picker component in an Airship modal.
   * This modal doesn't use the normal theme colors,
   * since the native component inside uses its own phone-based colors.
   */
  render() {
    const { bridge, theme } = this.props
    const { darkMode, date } = this.state

    const textStyle: TextStyle = {
      color: darkMode ? theme.dateModalTextDark : theme.dateModalTextLight,
      fontSize: theme.rem(1),
      textAlign: 'right',
      paddingHorizontal: theme.rem(1),
      paddingVertical: theme.rem(0.5)
    }

    return (
      <AirshipModal
        bridge={bridge}
        onCancel={this.handleDone}
        borderRadius={0}
        backgroundColor={
          darkMode
            ? theme.dateModalBackgroundDark
            : theme.dateModalBackgroundLight
        }
      >
        <EdgeTouchableOpacity onPress={this.handleDone}>
          <UnscaledText style={textStyle}>{lstrings.done}</UnscaledText>
        </EdgeTouchableOpacity>
        <DateTimePicker
          display="spinner"
          mode="date"
          onChange={this.handleChange}
          value={date}
        />
      </AirshipModal>
    )
  }

  handleChange = (_event: unknown, date?: Date) => {
    if (date == null) return
    this.setState({ date })
  }

  handleDone = () => {
    this.props.bridge.resolve(this.state.date)
  }
}

/**
 * Displays the native Android date picker modal,
 * using the Airship system to manage its lifetime.
 */
export function DateModalAndroid(props: Props) {
  const { bridge, initialValue } = props

  return (
    <DateTimePicker
      mode="date"
      onChange={(_event, date?: Date) => {
        bridge.resolve(date != null ? date : initialValue)
        bridge.remove()
      }}
      value={initialValue}
    />
  )
}

export const DateModal =
  Platform.OS === 'android' ? DateModalAndroid : withTheme(DateModalIos)

/**
 * Returns the date portion of a date object, formatted YYYY-MM-DD.
 * It makes sure to return the date local to the current timezone.
 *
 * It's only use-case is to convert a date object from the date picker modal
 * to a formatted string.
 *
 * @param date A JS Date Object
 * @returns the formatted date string (YYYY-MM-DD).
 */
export function toRecoveryDateString(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
