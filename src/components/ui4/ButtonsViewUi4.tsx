/**
 * IMPORTANT: Changes in this file MUST be synced with edge-react-gui!
 */

import * as React from 'react'
import { View, ViewStyle } from 'react-native'

import { styled } from '../hoc/styled'
import { Space } from '../layout/Space'
import { ButtonTypeUi4, ButtonUi4 } from './ButtonUi4'

const INTER_BUTTON_SPACING_REM = 1

export interface ButtonInfo {
  label: string
  onPress: () => void | Promise<void>
  disabled?: boolean
  spinner?: boolean
  testID?: string
}

interface Props {
  // Specifies whether the component should be positioned absolutely.
  // Default value is false.
  absolute?: boolean

  // If specified, fades visibility according to the value of fade.
  // The component is always visible if fade is unset.
  fade?: boolean

  // ButtonInfos
  primary?: ButtonInfo
  secondary?: ButtonInfo
  secondary2?: ButtonInfo // A secondary-styled button in the primary position (right/top side)
  tertiary?: ButtonInfo

  // Arrangement of the button(s). Defaults to 'column' or 'solo' depending on
  // number of ButtonInfos given
  layout?:
    | 'row' // Buttons are stacked side by side horizontally, taking up 50% of the available space each.
    | 'column' // Buttons stacked on top of each other vertically, taking up as much space as the widest button.
    | 'solo' // A single centered button whose size is determined by label length (default for single-button props)

  // Extra bottom margins for scenes to allow scrolling up further into an
  // easier tap area of the screen
  parentType?: 'scene' | 'modal'
}

/**
 * A consistently styled view for displaying button layouts.
 */
export const ButtonsViewUi4 = React.memo(
  ({
    absolute = false,
    fade,
    primary,
    secondary,
    secondary2,
    tertiary,
    layout = 'column',
    parentType
  }: Props) => {
    const numButtons = [primary, secondary, secondary2, tertiary].filter(
      key => key != null
    ).length
    if (numButtons === 1) layout = 'solo'

    const spacing = <Space around={INTER_BUTTON_SPACING_REM / 2} />

    const renderButton = (type: ButtonTypeUi4, buttonProps?: ButtonInfo) => {
      if (buttonProps == null) return null
      const { label, onPress, disabled, spinner, testID } = buttonProps

      return (
        <ButtonUi4
          layout={layout}
          label={label}
          onPress={onPress}
          type={type}
          disabled={disabled}
          spinner={spinner}
          testID={testID}
        />
      )
    }
    return (
      <StyledButtonContainer
        absolute={absolute}
        layout={layout}
        parentType={parentType}
      >
        {renderButton('primary', primary)}
        {primary != null && secondary != null ? spacing : null}
        {renderButton('secondary', secondary2)}
        {secondary != null && secondary2 != null ? spacing : null}
        {renderButton('secondary', secondary)}
        {tertiary != null ? spacing : null}
        {renderButton('tertiary', tertiary)}
      </StyledButtonContainer>
    )
  }
)

const StyledButtonContainer = styled(View)<{
  absolute: boolean
  layout: 'row' | 'column' | 'solo'
  parentType?: 'scene' | 'modal'
}>(theme => props => {
  const { absolute, layout, parentType } = props

  const marginSize = theme.rem(0.5)

  const baseStyle: ViewStyle = {
    margin: marginSize
  }

  const absoluteStyle: ViewStyle = absolute
    ? {
        position: 'absolute',
        bottom: 0,
        left: marginSize,
        right: marginSize
      }
    : {}

  const soloStyle: ViewStyle =
    layout === 'solo'
      ? {
          justifyContent: 'center',
          marginHorizontal: theme.rem(0.5),
          alignItems: 'center',
          flex: 1
        }
      : {}

  const rowStyle: ViewStyle =
    layout === 'row'
      ? {
          flex: 1,
          flexDirection: 'row-reverse',
          justifyContent: 'center'
        }
      : {}

  const columnStyle: ViewStyle =
    layout === 'column'
      ? {
          alignSelf: 'center', // Shrink view around buttons
          alignItems: 'stretch', // Stretch our children out
          flexDirection: 'column',
          justifyContent: 'space-between'
        }
      : {}

  const sceneMarginStyle: ViewStyle =
    parentType === 'scene'
      ? {
          marginBottom: theme.rem(3),
          marginTop: theme.rem(1)
        }
      : {}

  const modalMarginStyle: ViewStyle =
    parentType === 'modal'
      ? {
          marginBottom: theme.rem(1),
          marginTop: theme.rem(2)
        }
      : {}

  return {
    ...baseStyle,
    ...absoluteStyle,
    ...soloStyle,
    ...rowStyle,
    ...columnStyle,
    ...sceneMarginStyle,
    ...modalMarginStyle
  }
})
