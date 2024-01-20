import * as React from 'react'
import { AirshipBridge } from 'react-native-airship'

import { lstrings } from '../../common/locales/strings'
import { Checkbox } from '../themed/Checkbox'
import { ModalMessage } from '../themed/ModalParts'
import { ButtonsViewUi4 } from '../ui4/ButtonsViewUi4'
import { ModalUi4 } from '../ui4/ModalUi4'

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
    <ModalUi4
      bridge={bridge}
      title={lstrings.security_is_our_priority_modal_title}
      warning
      onCancel={handleCancel}
    >
      <ModalMessage>{message}</ModalMessage>
      <Checkbox
        marginRem={[1, 0, 0.5, 0.5]}
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
      <ButtonsViewUi4
        primary={{
          label: lstrings.enable,
          onPress: () => handlePress('enable', true)
        }}
        tertiary={{
          label: lstrings.cancel,
          onPress: () => handlePress('enable', false)
        }}
        parentType="modal"
      />
    </ModalUi4>
  )
}
