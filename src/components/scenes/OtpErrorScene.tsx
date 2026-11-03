import { asMaybeOtpError, EdgeAccount, OtpError } from 'edge-core-js'
import * as React from 'react'
import { Image, Linking, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { cacheStyles } from 'react-native-patina'
import { base16, base64 } from 'rfc4648'
import { sprintf } from 'sprintf-js'

import { completeLogin } from '../../actions/LoginCompleteActions'
import { AUTHORIZE_LOGIN } from '../../assets'
import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { useImports } from '../../hooks/useImports'
import { Branding } from '../../types/Branding'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { attemptLogin, LoginAttempt } from '../../util/loginAttempt'
import { makePeriodicTask } from '../../util/periodicTask'
import { toLocalTime } from '../../util/utils'
import { EdgeButton } from '../buttons/EdgeButton'
import { EdgeTouchableOpacity } from '../common/EdgeTouchableOpacity'
import { ChevronDownIcon, ChevronUpIcon } from '../icons/ThemedIcons'
import { retryOnChallenge } from '../modals/ChallengeModal'
import { showResetModal } from '../modals/OtpResetModal'
import { QrCodeModal } from '../modals/QrCodeModal'
import { Airship, showError, showToast } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText, HeaderText, Paragraph, SmallText } from '../themed/EdgeText'
import { FilledTextInput } from '../themed/FilledTextInput'
import { ThemedScene } from '../themed/ThemedScene'
import { EdgeCard } from '../ui4/EdgeCard'

export interface OtpErrorParams {
  otpAttempt: LoginAttempt
  otpError: OtpError
}

interface Props extends SceneProps<'otpError'> {
  branding: Branding
}

const SUPPORT_URL =
  'https://support.edge.app/en/articles/13892226-authorize-device'

export function OtpErrorScene(props: Props): React.ReactElement {
  const { branding, route } = props
  const { otpAttempt, otpError } = route.params
  const { resetToken, voucherId } = otpError
  const {
    accountOptions,
    context,
    onContactSupport,
    onPerfEvent
  } = useImports()
  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = getStyles(theme)

  const [otpResetDate, setOtpResetDate] = React.useState(otpError.resetDate)
  const [code, setCode] = React.useState('')
  const [codeError, setCodeError] = React.useState<string | undefined>()
  const [isVerifying, setIsVerifying] = React.useState(false)
  const [isQrExpanded, setIsQrExpanded] = React.useState(false)
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
        await dispatch(completeLogin(account))
      } catch (error: unknown) {
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

  const handleChangeCode = useHandler((text: string) => {
    setCode(text)
    setCodeError(undefined)
  })

  const handleVerify = useHandler(async () => {
    const input = code.replace(/\s/g, '')
    if (input === '' || isVerifying) return

    // Is this a 6-digit code, or a full backup key?
    const isOtpCode = /^\d{6}$/.test(input)

    inModal.current = true
    setIsVerifying(true)
    setCodeError(undefined)
    try {
      const result = await retryOnChallenge({
        cancelValue: lstrings.failed_captcha_error,
        async task(challengeId) {
          const account = await attemptLogin(
            context,
            otpAttempt,
            {
              ...accountOptions,
              challengeId,
              otpKey: isOtpCode ? undefined : input,
              otp: isOtpCode ? input : undefined
            },
            onPerfEvent
          )
          await dispatch(completeLogin(account))
          return true
        }
      })
      if (typeof result === 'string') setCodeError(result)
    } catch (error: unknown) {
      // Translate known errors:
      const otpError = asMaybeOtpError(error)
      if (otpError != null) {
        dispatch({
          type: 'NAVIGATE',
          data: { name: 'otpError', params: { otpAttempt, otpError } }
        })
        setOtpResetDate(otpError.resetDate)
        setCodeError(lstrings.backup_key_incorrect)
      } else if (
        error instanceof Error &&
        error.message === 'Unexpected end of data'
      ) {
        setCodeError(lstrings.backup_key_incorrect)
      } else {
        showError(error)
      }
    } finally {
      inModal.current = false
      setIsVerifying(false)
    }
  })

  const handleSubmitEditing = useHandler(() => {
    handleVerify().catch((error: unknown) => showError(error))
  })

  const handleToggleQr = useHandler(() => {
    setIsQrExpanded(!isQrExpanded)
  })

  const handleQrModal = useHandler(async () => {
    inModal.current = true
    const account = await Airship.show<EdgeAccount | undefined>(bridge => (
      <QrCodeModal
        bridge={bridge}
        branding={branding}
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

  const lockId =
    voucherId == null
      ? undefined
      : base16.stringify(base64.parse(voucherId)).toLowerCase().slice(0, 8)

  const handleContactSupport = useHandler(async () => {
    try {
      if (onContactSupport != null) await onContactSupport({ lockId })
      else await Linking.openURL(SUPPORT_URL)
    } catch (error: unknown) {
      showError(error)
    }
  })

  //
  // Render
  //

  const isIp = otpError.reason === 'ip'
  const appName = branding.appName ?? lstrings.app_name_default

  // Find the automatic login date:
  const date = otpError.voucherActivates ?? otpResetDate

  const ChevronIcon = isQrExpanded ? ChevronUpIcon : ChevronDownIcon

  return (
    <ThemedScene onBack={handleBack} title={lstrings.otp_approve_title}>
      <KeyboardAwareScrollView
        bottomOffset={theme.rem(6)}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={AUTHORIZE_LOGIN}
          style={styles.heroImage}
          resizeMode="contain"
        />
        <Paragraph center>
          <HeaderText>{lstrings.otp_approve_welcome}</HeaderText>
        </Paragraph>
        <Paragraph center>{lstrings.otp_approve_subtitle}</Paragraph>

        {isIp ? null : (
          <View style={styles.section}>
            <Paragraph>{lstrings.otp_backup_code_modal_title}</Paragraph>
            <FilledTextInput
              horizontal={0.5}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus={false}
              clearIcon
              error={codeError}
              placeholder={lstrings.backup_key_label}
              returnKeyType="done"
              testID="otpCodeFormField"
              value={code}
              onChangeText={handleChangeCode}
              onSubmitEditing={handleSubmitEditing}
            />
            <EdgeButton
              disabled={code === ''}
              label={lstrings.otp_approve_verify_button}
              layout="column"
              marginRem={0.5}
              spinner={isVerifying}
              type="primary"
              onPress={handleVerify}
            />
          </View>
        )}

        <View style={styles.section}>
          <Paragraph>{lstrings.otp_approve_device_header}</Paragraph>
          <EdgeCard>
            <Paragraph>
              {sprintf(lstrings.otp_approve_device_body_1s, appName)}
            </Paragraph>
            <EdgeTouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ expanded: isQrExpanded }}
              style={styles.expanderRow}
              testID="otpQrExpander"
              onPress={handleToggleQr}
            >
              <EdgeText>{lstrings.otp_approve_not_seeing}</EdgeText>
              <ChevronIcon color={theme.iconTappable} size={theme.rem(1.25)} />
            </EdgeTouchableOpacity>
            {isQrExpanded ? (
              <>
                <Paragraph>{lstrings.otp_approve_qr_body}</Paragraph>
                <EdgeButton
                  label={lstrings.otp_approve_show_qr}
                  layout="column"
                  marginRem={0.5}
                  type="secondary"
                  onPress={handleQrModal}
                />
              </>
            ) : null}
          </EdgeCard>
        </View>

        {date != null ? (
          <View style={styles.section}>
            <Paragraph>{lstrings.otp_approve_auto_header}</Paragraph>
            <EdgeCard>
              <Paragraph>
                {sprintf(lstrings.otp_approve_auto_date_1s, toLocalTime(date))}
              </Paragraph>
              <Paragraph>{lstrings.otp_approve_auto_body}</Paragraph>
            </EdgeCard>
          </View>
        ) : resetToken != null ? (
          <EdgeButton
            label={lstrings.disable_otp_button_two}
            layout="column"
            marginRem={[1, 0.5, 0.5]}
            type="secondary"
            onPress={handleResetModal}
          />
        ) : null}

        <View style={styles.footer}>
          <EdgeButton
            label={lstrings.otp_approve_contact_support}
            type="tertiary"
            onPress={handleContactSupport}
          />
          {lockId == null ? null : (
            <Paragraph center>
              <SmallText>{sprintf(lstrings.otp_lock_id, lockId)}</SmallText>
            </Paragraph>
          )}
        </View>
      </KeyboardAwareScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  expanderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: theme.rem(0.5)
  },
  footer: {
    marginTop: theme.rem(1),
    marginBottom: theme.rem(1)
  },
  heroImage: {
    alignSelf: 'center',
    height: theme.rem(9),
    marginTop: theme.rem(0.5),
    width: theme.rem(9)
  },
  section: {
    marginTop: theme.rem(1)
  }
}))
