import * as React from 'react'
import { Switch, View } from 'react-native'
import { AirshipBridge } from 'react-native-airship'
import { cacheStyles } from 'react-native-patina'

import { lstrings } from '../../common/locales/strings'
import { ButtonsView } from '../buttons/ButtonsView'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'
import { ModalMessage } from '../themed/ModalParts'
import { EdgeModal } from './EdgeModal'

interface Props {
  bridge: AirshipBridge<Required<PermissionsModalChoices> | undefined>
  choices: PermissionsModalChoices
  message: string
}

type SwitchKey = 'optInPriceChanges' | 'optInMarketing'

export interface PermissionsModalChoices {
  enable?: boolean
  optInPriceChanges: boolean
  optInMarketing: boolean
}

export function RequestPermissionsModal(props: Props) {
  const { bridge, choices, message } = props
  const theme = useTheme()
  const styles = getStyles(theme)
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

  const renderSwitchRow = (params: {
    key: SwitchKey
    label: string
    disabled?: boolean
  }) => {
    const { key, label, disabled } = params
    const value = selection[key]
    const handleRowPress = () => handlePress(key)
    return (
      <EdgeTouchableOpacity
        style={styles.row}
        activeOpacity={1}
        onPress={handleRowPress}
      >
        <EdgeText style={styles.rowLabel} numberOfLines={2}>
          {label}
        </EdgeText>
        <View pointerEvents="none" style={styles.switchContainer}>
          <Switch
            disabled={disabled}
            ios_backgroundColor={theme.deactivatedText}
            trackColor={{
              false: theme.deactivatedText,
              true: theme.iconTappable
            }}
            value={value}
            onValueChange={handleRowPress}
          />
        </View>
      </EdgeTouchableOpacity>
    )
  }

  return (
    <EdgeModal
      bridge={bridge}
      title={lstrings.security_is_our_priority_modal_title}
      warning
      onCancel={handleCancel}
    >
      <ModalMessage>{message}</ModalMessage>
      {/* Required urgent alerts row (disabled switch) */}
      <View style={styles.row}>
        <EdgeText style={styles.rowLabel} numberOfLines={2}>
          {lstrings.notifications_urgent_required}
        </EdgeText>
        <View pointerEvents="none" style={styles.switchContainer}>
          <Switch
            disabled
            ios_backgroundColor={theme.deactivatedText}
            trackColor={{
              false: theme.deactivatedText,
              true: theme.iconTappable
            }}
            value
          />
        </View>
      </View>

      {renderSwitchRow({
        key: 'optInPriceChanges',
        label: lstrings.notifications_opt_in_price_changes
      })}
      {renderSwitchRow({
        key: 'optInMarketing',
        label: lstrings.notifications_opt_in_marketing
      })}
      <ButtonsView
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
    </EdgeModal>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.rem(0.5),
    marginTop: theme.rem(0.5)
  },
  rowLabel: {
    flexGrow: 1,
    flexShrink: 1
  },
  switchContainer: {
    marginHorizontal: theme.rem(0.5)
  }
}))
