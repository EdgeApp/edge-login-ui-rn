import { asMaybeOtpError, OtpError } from 'edge-core-js'
import * as React from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { sprintf } from 'sprintf-js'

import { completeLogin } from '../../actions/LoginCompleteActions'
import { lstrings } from '../../common/locales/strings'
import { useImports } from '../../hooks/useImports'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { attemptLogin, LoginAttempt } from '../../util/loginAttempt'
import { makePeriodicTask } from '../../util/periodicTask'
import { toLocalTime } from '../../util/utils'
import { showResetModal } from '../modals/OtpResetModal'
import { showQrCodeModal } from '../modals/QrCodeModal'
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

interface OwnProps extends SceneProps<'otpError'> {}
interface StateProps {
  otpError: OtpError
  otpAttempt: LoginAttempt
  otpResetDate?: Date
}
interface DispatchProps {
  onBack: () => void
  handleQrModal: () => void
  hasReadyVoucher: (otpError: OtpError) => Promise<boolean>
  login: (otpAttempt: LoginAttempt, otpKey?: string) => Promise<void>
  requestOtpReset: () => Promise<void>
  saveOtpError: (otpAttempt: LoginAttempt, otpError: OtpError) => void
}
type Props = OwnProps & StateProps & DispatchProps

class OtpErrorSceneComponent extends React.Component<Props> {
  checkVoucher = makePeriodicTask(async () => {
    const {
      hasReadyVoucher,
      login,
      otpAttempt,
      otpError,
      saveOtpError
    } = this.props

    try {
      const result = await hasReadyVoucher(otpError)
      if (result) {
        showToast(lstrings.otp_scene_retrying)
        await login(otpAttempt)
      }
    } catch (error) {
      const otpError = asMaybeOtpError(error)
      if (otpError != null) {
        saveOtpError(otpAttempt, otpError)
      } else {
        showError(error)
      }
    }
  }, 5000)

  componentDidMount() {
    this.checkVoucher.start()
  }

  componentWillUnmount() {
    this.checkVoucher.stop()
  }

  handleBackupModal = () => {
    const { login, otpAttempt, saveOtpError } = this.props

    const handleSubmit = async (otpKey: string): Promise<boolean | string> => {
      try {
        this.checkVoucher.stop()
        await login(otpAttempt, otpKey)
        return true
      } catch (error) {
        // Restart the background checking if the login failed:
        this.checkVoucher.start()

        // Translate known errors:
        const otpError = asMaybeOtpError(error)
        if (otpError != null) {
          saveOtpError(otpAttempt, otpError)
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
      }
    }

    Airship.show(bridge => (
      <TextInputModal
        bridge={bridge}
        onSubmit={handleSubmit}
        title={lstrings.otp_backup_code_modal_title}
        message={lstrings.otp_instructions}
        inputLabel={lstrings.backup_key_label}
        submitLabel={lstrings.submit}
        autoCapitalize="characters"
        returnKeyType="done"
      />
    ))
  }

  render() {
    const { handleQrModal, otpError, otpResetDate } = this.props
    const isIp = otpError.reason === 'ip'

    // Find the automatic login date:
    let date = otpResetDate
    if (otpError.voucherActivates != null) date = otpError.voucherActivates

    return (
      <ThemedScene
        onBack={this.props.onBack}
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
              onPress={this.handleBackupModal}
            />
          </>
        )}
        {date == null ? null : (
          <>
            <DividerWithText />
            <MessageText>
              {sprintf(lstrings.otp_scene_wait, toLocalTime(date))}
            </MessageText>
          </>
        )}
        {otpError.resetToken == null || date != null ? null : (
          <>
            <DividerWithText />
            <LinkRow
              label={lstrings.disable_otp_button_two}
              onPress={() => {
                showResetModal(this.props.requestOtpReset).catch(error =>
                  showError(error)
                )
              }}
            />
          </>
        )}
      </ThemedScene>
    )
  }
}

export function OtpErrorScene(props: OwnProps) {
  const { route } = props
  const { otpAttempt, otpError } = route.params
  const { accountOptions, context } = useImports()
  const dispatch = useDispatch()

  const [otpResetDate, setOtpResetDate] = React.useState(otpError.resetDate)

  const handleBack = (): void => {
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'passwordLogin',
        params: { username: otpAttempt.username }
      }
    })
  }

  const handleQrModal = (): void => {
    dispatch(showQrCodeModal())
  }

  async function hasReadyVoucher(): Promise<boolean> {
    const { voucherId } = otpError
    if (voucherId == null) return false

    // Is that voucher pending?
    const messages = await context.fetchLoginMessages()
    for (const message of messages) {
      const { pendingVouchers } = message
      for (const voucher of pendingVouchers) {
        if (voucher.voucherId === voucherId) return false
      }
    }
    return true
  }

  async function requestOtpReset() {
    const { resetToken } = otpError
    if (resetToken == null) {
      throw new Error('No OTP reset token')
    }

    const date = await context.requestOtpReset(otpAttempt.username, resetToken)
    setOtpResetDate(date)
  }

  function saveOtpError(otpAttempt: LoginAttempt, otpError: OtpError) {
    setOtpResetDate(otpError.resetDate)
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'otpError', params: { otpAttempt, otpError } }
    })
  }

  async function login(attempt: LoginAttempt, otpKey?: string): Promise<void> {
    const account = await attemptLogin(context, attempt, {
      ...accountOptions,
      otpKey
    })
    dispatch(completeLogin(account))
  }

  return (
    <OtpErrorSceneComponent
      handleQrModal={handleQrModal}
      hasReadyVoucher={hasReadyVoucher}
      login={login}
      otpAttempt={otpAttempt}
      otpError={otpError}
      otpResetDate={otpResetDate}
      requestOtpReset={requestOtpReset}
      route={route}
      saveOtpError={saveOtpError}
      onBack={handleBack}
    />
  )
}
