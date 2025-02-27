import {
  EdgeAccount,
  EdgeAccountOptions,
  EdgeContext,
  EdgePendingEdgeLogin
} from 'edge-core-js'
import * as React from 'react'
import { ActivityIndicator, View } from 'react-native'
import { AirshipBridge } from 'react-native-airship'
import { cacheStyles } from 'react-native-patina'
import { sprintf } from 'sprintf-js'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { QrCode } from '../common/QrCode'
import { showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { ModalMessage } from '../themed/ModalParts'
import { EdgeModal } from './EdgeModal'

interface Props {
  bridge: AirshipBridge<EdgeAccount | undefined>

  // We cannot call `useImport` from an Airship component:
  accountOptions: EdgeAccountOptions
  context: EdgeContext
}

export function QrCodeModal(props: Props) {
  const { accountOptions, bridge, context } = props

  const theme = useTheme()
  const styles = getStyles(theme)

  const [qrData, setQrData] = React.useState<string | undefined>()
  const [username, setUsername] = React.useState<string | undefined>()

  React.useEffect(() => {
    const cleanups: Array<() => unknown> = []
    let pendingLogin: EdgePendingEdgeLogin | undefined

    const handleError = (error: unknown): void => {
      showError(error)
      bridge.resolve(undefined)
    }

    context
      .requestEdgeLogin({
        ...accountOptions,
        // These are no longer used in recent core versions:
        // @ts-expect-error
        displayImageUrl:
          'https://github.com/Airbitz/edge-brand-guide/blob/master/Logo/Mark/Edge-Final-Logo_Mark-Green.png',
        displayName: 'Edge Wallet'
      })
      .then(pending => {
        pendingLogin = pending
        if (pending.state != null) {
          // New core versions have the callbacks on the request:
          pending.watch('state', state => {
            if (state === 'started') {
              setUsername(pending.username ?? '')
            }
            if (state === 'done' && pending.account != null) {
              bridge.resolve(pending.account)
            }
            if (state === 'error') handleError(pending.error)
          })
        } else {
          // Older core versions have the callbacks on the context:
          cleanups.push(
            context.on(
              // @ts-expect-error
              'login',
              account => bridge.resolve(account)
            )
          )
          cleanups.push(
            context.on(
              // @ts-expect-error
              'loginStart',
              ({ username }) => setUsername(username)
            )
          )
          cleanups.push(
            context.on(
              // @ts-expect-error
              'loginError',
              ({ error }) => handleError(error)
            )
          )
        }
        setQrData('edge://edge/' + pending.id)
      })

    return () => {
      // Close the request, ignoring errors (in case it is already closed):
      Promise.resolve(pendingLogin?.cancelRequest()).catch(() => {})
      for (const cleanup of cleanups) cleanup()
    }
  }, [accountOptions, bridge, context])

  const handleCancel = useHandler(() => bridge.resolve(undefined))

  return (
    <EdgeModal
      bridge={bridge}
      onCancel={handleCancel}
      title={lstrings.qr_modal_title}
      scroll
    >
      <ModalMessage>
        {username != null
          ? sprintf(lstrings.qr_modal_started, username)
          : lstrings.qr_modal_message}
      </ModalMessage>
      <View style={styles.qrContainer}>
        {qrData == null ? (
          <ActivityIndicator color={theme.primaryText} />
        ) : (
          <QrCode key="qrcode" data={qrData} size={theme.rem(14)} />
        )}
      </View>
    </EdgeModal>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: theme.rem(16),
    padding: theme.rem(0.5)
  }
}))
