/**
 * IMPORTANT: Changes in this file MUST be duplicated in edge-react-gui!
 */
import { EdgeLoginMessage } from 'edge-core-js'
import * as React from 'react'
import { Text } from 'react-native'
import { AirshipBridge } from 'react-native-airship'
import { cacheStyles } from 'react-native-patina'
import AntDesignIcon from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { sprintf } from 'sprintf-js'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { Theme, useTheme } from '../services/ThemeContext'
import { ModalScrollArea, ModalTitle } from '../themed/ModalParts'
import { EdgeModal } from '../ui4/EdgeModal'

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
      <EdgeTouchableOpacity
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
              ? sprintf(lstrings.alert_modal_reset_s, username)
              : sprintf(lstrings.alert_modal_voucher_s, username)}
          </Text>
          {lstrings.alert_modal_action}
        </Text>
        <AntDesignIcon
          color={theme.iconTappable}
          name="right"
          size={theme.rem(1)}
          style={styles.rowIcon}
        />
      </EdgeTouchableOpacity>
    )
  }

  return (
    <EdgeModal bridge={bridge} warning onCancel={handleCancel}>
      <ModalTitle>{lstrings.security_is_our_priority_modal_title}</ModalTitle>
      <ModalScrollArea>{renderList()}</ModalScrollArea>
    </EdgeModal>
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
