import { EdgeLoginMessage } from 'edge-core-js'
import * as React from 'react'
import { View } from 'react-native'
import { AirshipBridge } from 'react-native-airship'
import { cacheStyles } from 'react-native-patina'
import Ionicons from 'react-native-vector-icons/Ionicons'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { ChevronRightIcon } from '../icons/ThemedIcons'
import { SectionView } from '../layout/SectionView'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText, Paragraph } from '../themed/EdgeText'
import { ModalTitle } from '../themed/ModalParts'
import { EdgeCard } from '../ui4/EdgeCard'
import { EdgeModal } from './EdgeModal'

interface Props {
  bridge: AirshipBridge<string | undefined>
  messages: EdgeLoginMessage[]
}

export const SecurityAlertsModal = (props: Props) => {
  const { bridge, messages } = props
  const theme = useTheme()
  const styles = getStyles(theme)

  const otpResetNames = messages
    .filter(message => message.otpResetPending && message.username != null)
    .map(message => message.username)
  const voucherMessageNames = messages
    .filter(
      message => message.pendingVouchers.length > 0 && message.username != null
    )
    .map(message => message.username)

  const handleCancel = useHandler(() => bridge.resolve(undefined))

  const renderRow = (username: string, index: number) => {
    return (
      <EdgeCard
        key={`${index}-${username}`}
        onPress={() => bridge.resolve(username)}
      >
        <View style={styles.cardContainer}>
          <EdgeText>{username}</EdgeText>
          <ChevronRightIcon
            size={theme.rem(1.25)}
            color={theme.iconTappable}
            style={styles.chevron}
          />
        </View>
      </EdgeCard>
    )
  }

  const renderLoginRequests = () => {
    if (voucherMessageNames.length === 0) return null

    return (
      <>
        <Paragraph>{lstrings.login_attempt_detected}</Paragraph>
        {voucherMessageNames.map((name, index) => renderRow(name ?? '', index))}
      </>
    )
  }

  // TODO: Pending removal after server endpoint removal
  const renderOtpResetRequests = () => {
    if (otpResetNames.length === 0) return null

    return (
      <>
        <Paragraph>{lstrings.twofa_attempt_detected}</Paragraph>
        {otpResetNames.map((name, index) => renderRow(name ?? '', index))}
      </>
    )
  }

  return (
    <EdgeModal
      bridge={bridge}
      scroll
      title={
        <ModalTitle
          icon={
            <Ionicons
              name="warning"
              size={theme.rem(1.75)}
              color={theme.warningText}
            />
          }
        >
          {lstrings.review_login_request}
        </ModalTitle>
      }
      onCancel={handleCancel}
    >
      <SectionView marginRem={[0.5, 0, 0.5]}>
        {renderLoginRequests()}
        {renderOtpResetRequests()}
      </SectionView>
    </EdgeModal>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  cardContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: theme.rem(0.5)
  },
  chevron: {
    alignSelf: 'center',
    flexShrink: 0,
    marginHorizontal: theme.rem(1)
  }
}))
