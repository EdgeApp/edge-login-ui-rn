import * as React from 'react'
import { Platform, Switch, View } from 'react-native'
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
  // Hides the enable button when only the Settings app can fix the problem:
  settingsOnly?: boolean
}

type SwitchKey = 'optInPriceChanges' | 'optInMarketing'

export interface PermissionsModalChoices {
  goToSettings?: boolean
  optInPriceChanges: boolean
  optInMarketing: boolean
}

export function RequestPermissionsModal(props: Props) {
  const { bridge, choices, message, settingsOnly = false } = props
  const theme = useTheme()
  const styles = getStyles(theme)
  const [selection, setSelection] = React.useState<
    Required<PermissionsModalChoices>
  >({
    goToSettings: false,
    ...choices
  })

  const handleCancel = () => bridge.resolve(undefined)
  const handleEnable = () => bridge.resolve(selection)
  const handleGoToSettings = () =>
    bridge.resolve({ ...selection, goToSettings: true })

  const handleToggle = (key: SwitchKey) =>
    setSelection({ ...selection, [key]: !selection[key] })

  const goToSettingsButton = {
    label: lstrings.go_to_settings,
    onPress: handleGoToSettings
  }

  const renderSwitchRow = (params: {
    key: SwitchKey
    label: string
    disabled?: boolean
  }) => {
    const { key, label, disabled } = params
    const value = selection[key]
    const handleRowPress = () => handleToggle(key)
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
              true:
                Platform.OS === 'ios'
                  ? // iOS applies a dimmed appearance to the track color when
                    // disabled
                    theme.iconTappable
                  : // Android keeps the same track color when disabled - use an
                    // artificially dimmed version of the color
                    theme.switchTrackDisabledOn
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
        primary={
          settingsOnly
            ? goToSettingsButton
            : {
                label: lstrings.enable_notifications,
                onPress: handleEnable
              }
        }
        secondary={settingsOnly ? undefined : goToSettingsButton}
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
