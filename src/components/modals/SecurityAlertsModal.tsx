import { EdgeLoginMessage } from 'edge-core-js'
import * as React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { AirshipBridge } from 'react-native-airship'
import { cacheStyles } from 'react-native-patina'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { sprintf } from 'sprintf-js'

import s from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { Theme, useTheme } from '../services/ThemeContext'
import { ModalScrollArea, ModalTitle } from '../themed/ModalParts'
import { ThemedModal } from '../themed/ThemedModal'

interface Props {
  bridge: AirshipBridge<string | undefined>
  messages: EdgeLoginMessage[]
}

export const SecurityAlertsModal = (props: Props) => {
  const { bridge, messages } = props
  const theme = useTheme()

  const handleCancel = useHandler(() => bridge.resolve(undefined))

  const renderList = () => {
    const out: React.ReactNode[] = []

    let isFirst = true
    for (const message of messages) {
      const { otpResetPending, username } = message
      if (otpResetPending && username != null) {
        out.push(renderRow(username, true, isFirst))
        isFirst = false
      }
    }
    for (const message of messages) {
      const { pendingVouchers = [], username } = message
      if (pendingVouchers.length > 0 && username != null) {
        out.push(renderRow(username, false, isFirst))
        isFirst = false
      }
    }

    return out
  }

  const renderRow = (username: string, isReset: boolean, isFirst: boolean) => {
    const styles = getStyles(theme)

    return (
      <TouchableOpacity
        key={(isReset ? 'reset:' : 'voucher:') + username}
        style={isFirst ? styles.row : styles.rowBorder}
        onPress={() => bridge.resolve(username)}
      >
        <FontAwesome
          color={isReset ? theme.dangerText : theme.warningText}
          name="exclamation-triangle"
          size={theme.rem(1.5)}
          style={styles.rowIcon}
        />
        <Text style={styles.rowText}>
          <Text style={styles.bold}>
            {isReset
              ? sprintf(s.strings.alert_modal_reset_s, username)
              : sprintf(s.strings.alert_modal_voucher_s, username)}
          </Text>
          {s.strings.alert_modal_action}
        </Text>
        <AntDesignIcon
          color={theme.iconTappable}
          name="right"
          size={theme.rem(1)}
          style={styles.rowIcon}
        />
      </TouchableOpacity>
    )
  }

  return (
    <ThemedModal bridge={bridge} warning onCancel={handleCancel}>
      <ModalTitle>{s.strings.security_is_our_priority_modal_title}</ModalTitle>
      <ModalScrollArea>{renderList()}</ModalScrollArea>
    </ThemedModal>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  row: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  rowBorder: {
    alignItems: 'center',
    borderTopColor: theme.lineDivider,
    borderTopWidth: theme.thinLineWidth,
    flexDirection: 'row',
    marginTop: theme.rem(0.5),
    paddingTop: theme.rem(0.5)
  },
  rowIcon: {
    margin: theme.rem(0.5)
  },
  rowText: {
    color: theme.primaryText,
    flexGrow: 1,
    flexShrink: 1,
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(1),
    margin: theme.rem(0.5)
  },
  bold: {
    fontWeight: 'bold'
  }
}))
