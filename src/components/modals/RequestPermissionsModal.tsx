import * as React from 'react'
import { AirshipBridge } from 'react-native-airship'

import { lstrings } from '../../common/locales/strings'
import { Checkbox } from '../themed/Checkbox'
import { MainButton } from '../themed/MainButton'
import { ThemedModal } from '../themed/ThemedModal'
import { MessageText, TitleText } from '../themed/ThemedText'

interface Props {
  bridge: AirshipBridge<Required<PermissionsModalChoices> | undefined>
  choices: PermissionsModalChoices
  message: string
}

export interface PermissionsModalChoices {
  enable?: boolean
  optInPriceChanges: boolean
  optInMarketing: boolean
}

export function RequestPermissionsModal(props: Props) {
  const { bridge, choices, message } = props
  const [selection, setSelection] = React.useState<
    Required<PermissionsModalChoices>
  >({
    enable: false,
    ...choices
  })

  const handleCancel = () => bridge.resolve(undefined)

  const handlePress = (
    choice: keyof PermissionsModalChoices,
    value?: boolean
  ) => {
    const newSelection = {
      ...selection,
      [choice]: value ?? !selection[choice]
    }
    setSelection(newSelection)

    // A confirmation button was pressed:
    if (choice === 'enable') {
      bridge.resolve(newSelection)
    }
  }

  return (
    <ThemedModal bridge={bridge} paddingRem={1} warning onCancel={handleCancel}>
      <TitleText>{lstrings.security_is_our_priority_modal_title}</TitleText>
      <MessageText>{message}</MessageText>
      <Checkbox
        onChange={() => handlePress('optInPriceChanges')}
        value={selection.optInPriceChanges}
        textStyle={{}}
      >
        {lstrings.notifications_opt_in_price_changes}
      </Checkbox>
      <Checkbox
        onChange={() => handlePress('optInMarketing')}
        value={selection.optInMarketing}
        textStyle={{}}
      >
        {lstrings.notifications_opt_in_marketing}
      </Checkbox>
      <MainButton
        label={lstrings.enable}
        marginRem={0.5}
        type="primary"
        onPress={() => handlePress('enable', true)}
      />
      <MainButton
        label={lstrings.cancel}
        marginRem={0.5}
        type="escape"
        onPress={() => handlePress('enable', false)}
      />
    </ThemedModal>
  )
}
