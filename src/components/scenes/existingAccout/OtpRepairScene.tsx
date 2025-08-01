import { asMaybeOtpError, EdgeAccount, OtpError } from 'edge-core-js'
import * as React from 'react'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { sprintf } from 'sprintf-js'

import { completeLogin } from '../../../actions/LoginCompleteActions'
import { getAppConfig } from '../../../common/appConfig'
import { lstrings } from '../../../common/locales/strings'
import { useHandler } from '../../../hooks/useHandler'
import { useImports } from '../../../hooks/useImports'
import { Branding } from '../../../types/Branding'
import { useDispatch } from '../../../types/ReduxTypes'
import { SceneProps } from '../../../types/routerTypes'
import { toLocalTime } from '../../../util/utils'
import { showResetModal } from '../../modals/OtpResetModal'
import { QrCodeModal } from '../../modals/QrCodeModal'
import { TextInputModal } from '../../modals/TextInputModal'
import { Airship, showError } from '../../services/AirshipInstance'
import { DividerWithText } from '../../themed/DividerWithText'
import { IconHeaderRow } from '../../themed/IconHeaderRow'
import { LinkRow } from '../../themed/LinkRow'
import { ThemedScene } from '../../themed/ThemedScene'
import { MessageText, Warning } from '../../themed/ThemedText'

export interface OtpRepairParams {
  account: EdgeAccount
  otpError: OtpError
}

interface Props extends SceneProps<'otpRepair'> {
  branding: Branding
}

export function OtpRepairScene(props: Props): JSX.Element {
  const { branding, route } = props
  const { account, otpError } = route.params
  const { resetToken } = otpError
  const { accountOptions, context, onComplete = () => {} } = useImports()
  const dispatch = useDispatch()

  const [otpResetDate, setOtpResetDate] = React.useState(otpError.resetDate)

  //
  // Handlers
  //

  const handleBackupModal = useHandler(async () => {
    async function handleSubmit(otpKey: string): Promise<boolean | string> {
      try {
        if (account.repairOtp == null) {
          throw new Error('Wrong edge-core-js version')
        }
        await account.repairOtp(otpKey)
        onComplete()
        return true
      } catch (error) {
        // Translate known errors:
        const otpError = asMaybeOtpError(error)
        if (otpError != null) {
          dispatch({
            type: 'NAVIGATE',
            data: { name: 'otpRepair', params: { account, otpError } }
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
      }
    }
    await Airship.show(bridge => (
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
  })

  const handleQrModal = useHandler(async () => {
    const account = await Airship.show<EdgeAccount | undefined>(bridge => (
      <QrCodeModal
        bridge={bridge}
        accountOptions={accountOptions}
        context={context}
      />
    ))

    if (account != null) await dispatch(completeLogin(account))
  })

  const handleResetModal = useHandler(async () => {
    async function handleSubmit(): Promise<void> {
      if (resetToken == null) {
        throw new Error('No OTP reset token')
      }
      if (account.username == null) {
        throw new Error('No username')
      }

      const date = await context.requestOtpReset(account.username, resetToken)
      setOtpResetDate(date)
    }
    await showResetModal(handleSubmit)
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
    <ThemedScene onBack={onComplete} title={lstrings.otp_header_repair}>
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
              ? sprintf(lstrings.otp_repair_header_ip_branded, branding.appName)
              : sprintf(
                  lstrings.otp_repair_header_2fa_branded,
                  branding.appName
                )}
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
