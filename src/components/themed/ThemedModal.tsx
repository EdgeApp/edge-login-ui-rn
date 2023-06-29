import * as React from 'react'
import { StyleSheet } from 'react-native'
import { AirshipBridge, AirshipModal } from 'react-native-airship'

import { fixSides } from '../../util/sides'
import { useTheme } from '../services/ThemeContext'
import { ModalFooter } from './ModalParts'

interface Props<T> {
  bridge: AirshipBridge<T>
  children?: React.ReactNode

  // Control over the content area:
  paddingRem?: number[] | number

  // Adds a yellow warning border:
  warning?: boolean

  onCancel: () => void
}

export function ThemedModal<T>(props: Props<T>) {
  const {
    bridge,
    children = null,
    warning = false,
    paddingRem,
    onCancel
  } = props
  const theme = useTheme()

  // Since we can't add native dependencies without a major version bump,
  // we rely on the GUI to sneak this one to us:
  // @ts-expect-error
  const { ReactNativeBlurView } = global
  const underlay =
    typeof ReactNativeBlurView === 'function' ? (
      <ReactNativeBlurView
        blurType={theme.modalBlurType}
        style={StyleSheet.absoluteFill}
      />
    ) : (
      'rgba(0, 0, 0, 0.75)'
    )

  // TODO: The warning styles are incorrectly hard-coded:
  const borderColor = warning ? theme.warningText : theme.modalBorderColor
  const borderWidth = warning ? 4 : theme.modalBorderWidth

  return (
    <AirshipModal
      bridge={bridge}
      onCancel={onCancel}
      backgroundColor={theme.modal}
      borderRadius={theme.rem(theme.modalBorderRadiusRem)}
      borderColor={borderColor}
      borderWidth={borderWidth}
      padding={fixSides(paddingRem, 1).map(theme.rem)}
      underlay={underlay}
    >
      {children}
      <ModalFooter onPress={onCancel} />
    </AirshipModal>
  )
}
