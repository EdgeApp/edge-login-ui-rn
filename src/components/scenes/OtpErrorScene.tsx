import { asMaybeOtpError, EdgeAccount, OtpError } from 'edge-core-js'
import * as React from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { sprintf } from 'sprintf-js'

import { completeLogin } from '../../actions/LoginCompleteActions'
import { getAppConfig } from '../../common/appConfig'
import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { useImports } from '../../hooks/useImports'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { attemptLogin, LoginAttempt } from '../../util/loginAttempt'
import { makePeriodicTask } from '../../util/periodicTask'
import { toLocalTime } from '../../util/utils'
import { retryOnChallenge } from '../modals/ChallengeModal'
import { showResetModal } from '../modals/OtpResetModal'
import { QrCodeModal } from '../modals/QrCodeModal'
import { TextInputModal } from '../modals/TextInputModal'
import { Airship, showError, showToast } from '../services/AirshipInstance'
import { DividerWithText } from '../themed/DividerWithText'
import { IconHeaderRow } from '../themed/IconHeaderRow'
import { LinkRow } from '../themed/LinkRow'
import { ThemedScene } from '../themed/ThemedScene'
import { MessageText, Warning } from '../themed/ThemedText'

export interface OtpErrorParams {
  otpAttempt: LoginAttempt
  otpError: OtpError
}

interface Props extends SceneProps<'otpError'> {}

export function OtpErrorScene(props: Props) {
  const { route } = props
  const { otpAttempt, otpError } = route.params
  const { resetToken, voucherId } = otpError
  const { accountOptions, context, onPerfEvent } = useImports()
  const dispatch = useDispatch()

  const [otpResetDate, setOtpResetDate] = React.useState(otpError.resetDate)
  const inModal = React.useRef<boolean>(false)

  //
  // Background refresh loop
  //

  React.useEffect(() => {
    const checkVoucher = makePeriodicTask(async () => {
      try {
        if (inModal.current) return
        if (voucherId == null) return

        // Is our voucher pending?
        const messages = await context.fetchLoginMessages()
        for (const message of messages) {
          const { pendingVouchers } = message
          for (const voucher of pendingVouchers) {
            if (voucher.voucherId === voucherId) return
          }
        }

        showToast(lstrings.otp_scene_retrying)
        const account = await attemptLogin(
          context,
          otpAttempt,
          accountOptions,
          onPerfEvent
        )
        dispatch(completeLogin(account))
      } catch (error) {
        const otpError = asMaybeOtpError(error)
        if (otpError != null) {
          dispatch({
            type: 'NAVIGATE',
            data: { name: 'otpError', params: { otpAttempt, otpError } }
          })
          setOtpResetDate(otpError.resetDate)
          return
        }

        showError(error)
      }
    }, 5000)

    checkVoucher.start()
    return () => checkVoucher.stop()
  }, [accountOptions, context, dispatch, onPerfEvent, otpAttempt, voucherId])

  //
  // Handlers
  //

  const handleBack = useHandler(() => {
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'passwordLogin',
        params: { username: otpAttempt.username }
      }
    })
  })

  const handleBackupModal = useHandler(() => {
    inModal.current = true
    const handleSubmit = async (otpKey: string): Promise<boolean | string> =>
      await retryOnChallenge({
        cancelValue: lstrings.failed_captcha_error,
        async task(challengeId) {
          const account = await attemptLogin(
            context,
            otpAttempt,
            {
              ...accountOptions,
              challengeId,
              otpKey
            },
            onPerfEvent
          )
          dispatch(completeLogin(account))
          return true
        }
      }).catch(error => {
        // Translate known errors:
        const otpError = asMaybeOtpError(error)
        if (otpError != null) {
          dispatch({
            type: 'NAVIGATE',
            data: { name: 'otpError', params: { otpAttempt, otpError } }
          })
          setOtpResetDate(otpError.resetDate)
          return lstrings.backup_key_incorrect
        }

        if (
          error instanceof Error &&
          error.message === 'Unexpected end of data'
        ) {
          return lstrings.backup_key_incorrect
        }

        showError(error)
        return false
      })

    Airship.show(bridge => (
      <TextInputModal
        bridge={bridge}
        autoCapitalize="characters"
        inputLabel={lstrings.backup_key_label}
        message={lstrings.otp_instructions}
        returnKeyType="done"
        submitLabel={lstrings.submit}
        title={lstrings.otp_backup_code_modal_title}
        onSubmit={handleSubmit}
      />
    ))
      .catch(error => showError(error))
      .finally(() => (inModal.current = false))
  })

  const handleQrModal = useHandler(async () => {
    inModal.current = true
    const account = await Airship.show<EdgeAccount | undefined>(bridge => (
      <QrCodeModal
        bridge={bridge}
        accountOptions={accountOptions}
        context={context}
      />
    ))
    if (account != null) await dispatch(completeLogin(account))
    inModal.current = false
  })

  const handleResetModal = useHandler(async () => {
    inModal.current = true
    async function handleSubmit(): Promise<void> {
      if (resetToken == null) {
        throw new Error('No OTP reset token')
      }
      const date = await context.requestOtpReset(
        otpAttempt.username,
        resetToken
      )
      setOtpResetDate(date)
    }
    await showResetModal(handleSubmit)
    inModal.current = false
  })

  //
  // Render
  //

  const isIp = otpError.reason === 'ip'

  // Find the automatic login date:
  const date = otpError.voucherActivates ?? otpResetDate

  let supportEmailAddendum = ''
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  if (date != null && date > thirtyDaysFromNow) {
    supportEmailAddendum = `\n\n${sprintf(
      isIp
        ? lstrings.otp_scene_ip_support_email
        : lstrings.otp_scene_2fa_support_email,
      getAppConfig().supportEmail
    )}`
  }

  return (
    <ThemedScene
      onBack={handleBack}
      title={isIp ? lstrings.otp_header_ip : lstrings.otp_header}
    >
      <IconHeaderRow
        renderIcon={theme => (
          <Warning>
            <FontAwesome name="exclamation-triangle" size={theme.rem(2.5)} />
          </Warning>
        )}
      >
        <MessageText>
          <Warning>
            {isIp
              ? lstrings.otp_scene_header_ip
              : lstrings.otp_scene_header_2fa}
          </Warning>
        </MessageText>
      </IconHeaderRow>
      <DividerWithText label={lstrings.to_fix} />
      <MessageText>{lstrings.otp_scene_approve}</MessageText>
      <DividerWithText />
      <LinkRow label={lstrings.otp_scene_qr} onPress={handleQrModal} />
      {isIp ? null : (
        <>
          <DividerWithText />
          <LinkRow
            label={lstrings.otp_backup_code_modal_title}
            onPress={handleBackupModal}
          />
        </>
      )}
      {date == null ? null : (
        <>
          <DividerWithText />
          <MessageText>
            {sprintf(lstrings.otp_scene_wait, toLocalTime(date)) +
              supportEmailAddendum}
          </MessageText>
        </>
      )}
      {resetToken == null || date != null ? null : (
        <>
          <DividerWithText />
          <LinkRow
            label={lstrings.disable_otp_button_two}
            onPress={handleResetModal}
          />
        </>
      )}
    </ThemedScene>
  )
}
