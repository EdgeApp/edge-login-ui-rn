import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'
import { Keyboard } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { cacheStyles } from 'react-native-patina'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler'
import { useImports } from '../../hooks/useImports'
import { useDispatch } from '../../types/ReduxTypes'
import { SceneProps } from '../../types/routerTypes'
import { EdgeAnim } from '../common/EdgeAnim'
import { WarningCard } from '../common/WarningCard'
import { ButtonsModal } from '../modals/ButtonsModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'
import { FilledTextInput, FilledTextInputRef } from '../themed/FilledTextInput'
import { MainButton } from '../themed/MainButton'
import {
  PasswordRequirements,
  PasswordRequirementStatus,
  PasswordStatus
} from '../themed/PasswordStatus'
import { ThemedScene } from '../themed/ThemedScene'

export interface ChangePasswordParams {
  account: EdgeAccount
}

export interface NewAccountPasswordParams {
  password?: string
  pin?: string
  username?: string
}

export interface ResecurePasswordParams {
  account: EdgeAccount
}

export interface UpgradePasswordParams {
  account: EdgeAccount
  password?: string
  username: string
}

interface Props {
  initPassword?: string | undefined
  title?: string | undefined
  onBack?: (() => void) | undefined
  onSkip?: (() => void) | undefined
  onSubmit: (password: string) => void | Promise<void>
  mainButtonLabel?: string
}

const ChangePasswordSceneComponent = ({
  initPassword,
  title,
  onBack,
  onSkip,
  onSubmit,
  mainButtonLabel = lstrings.done
}: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)
  const [spinning, setSpinning] = React.useState(false)
  const [passwordReqs, setPasswordReqs] = React.useState<PasswordRequirements>({
    minLengthMet: 'unmet',
    hasNumber: 'unmet',
    hasLowercase: 'unmet',
    hasUppercase: 'unmet',
    confirmationMatches: 'unmet'
  })
  const [password, setPassword] = React.useState(initPassword ?? '')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  const secondInputRef = React.useRef<FilledTextInputRef>(null)

  // Omit confirmationMatches from next button availability
  const isNextButtonDisabled = Object.entries(passwordReqs)
    .filter(([key]) => key !== 'confirmationMatches') // Exclude confirmationMatches from the check
    .some(([, value]) => value === 'unmet' || value === 'error')

  const handleNext = useHandler(async () => {
    setSpinning(true)

    const newPasswordReqs = validatePassword(password, confirmPassword, 'error')
    setPasswordReqs(newPasswordReqs)
    if (
      !Object.entries(newPasswordReqs).some(
        ([, value]) => value === 'unmet' || value === 'error'
      )
    ) {
      try {
        await onSubmit(password)
      } catch (e) {
        showError(e)
      }
    }

    setSpinning(false)
  })

  const handleSubmitPasswordField = useHandler(() => {
    secondInputRef.current?.focus()
  })

  React.useEffect(() => {
    setPasswordReqs(validatePassword(password, confirmPassword, 'unmet'))
  }, [password, confirmPassword])

  return (
    <ThemedScene onBack={onBack} onSkip={onSkip} title={title}>
      <KeyboardAwareScrollView
        style={styles.container}
        keyboardOpeningTime={0}
        keyboardShouldPersistTaps="handled"
        enableResetScrollToCoords={false}
        /**
         * HACK: In iOS:
         * - extraScrollHeight is ONLY respected when tapping to
         * focus a field.
         * - Pressing next does not apply the extraScrollHeight.
         * - Refuses to respect extraScrollHeight while typing, and
         * ALWAYS resets the focus position to make the text field sit just
         * above the keyboard.
         *
         * Android correctly uses this prop to ensure the "next" button is
         * always visible above the keyboard, screen size permitting.
         */
        extraScrollHeight={theme.rem(6)}
        enableAutomaticScroll
        enableOnAndroid
      >
        <EdgeAnim
          enter={{ type: 'fadeInUp', distance: 50 }}
          exit={{ type: 'fadeOutDown' }}
        >
          <EdgeText style={styles.description} numberOfLines={4}>
            {lstrings.password_desc}
          </EdgeText>
        </EdgeAnim>
        <EdgeAnim
          enter={{ type: 'fadeInUp', distance: 30 }}
          exit={{ type: 'fadeOutDown' }}
        >
          <PasswordStatus passwordReqs={passwordReqs} />
        </EdgeAnim>

        <EdgeAnim enter={{ type: 'fadeInUp', distance: 25 }}>
          <FilledTextInput
            top={0.75}
            horizontal={0.75}
            bottom={0.25}
            value={password}
            secureTextEntry
            returnKeyType="next"
            placeholder={lstrings.password}
            onChangeText={setPassword}
            onSubmitEditing={handleSubmitPasswordField}
            clearIcon
            maxLength={100}
          />
        </EdgeAnim>
        <EdgeAnim enter={{ type: 'fadeInDown', distance: 25 }}>
          <FilledTextInput
            ref={secondInputRef}
            top={0.25}
            horizontal={0.75}
            value={confirmPassword}
            secureTextEntry
            returnKeyType="done"
            placeholder={lstrings.confirm_password}
            onChangeText={setConfirmPassword}
            onSubmitEditing={handleNext}
            clearIcon
            maxLength={100}
          />
        </EdgeAnim>
        <EdgeAnim
          style={styles.actions}
          enter={{ type: 'fadeInDown', distance: 50 }}
          exit={{ type: 'fadeOutDown', distance: 50 }}
        >
          {spinning ? (
            <MainButton disabled marginRem={0.5} type="primary" spinner />
          ) : (
            <MainButton
              label={mainButtonLabel}
              disabled={isNextButtonDisabled || confirmPassword === ''}
              marginRem={0.5}
              onPress={handleNext}
              type="primary"
            />
          )}
        </EdgeAnim>
      </KeyboardAwareScrollView>
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flexGrow: 1,
    marginHorizontal: theme.rem(0.5),
    marginTop: -theme.rem(0.5)
  },
  description: {
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875),
    margin: theme.rem(0.5)
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.rem(1)
  }
}))

// The scene for existing users to change their password
export const ChangePasswordScene = (props: SceneProps<'changePassword'>) => {
  const { route } = props
  const { account } = route.params
  const { onComplete = () => {} } = useImports()
  const handleSubmit = useHandler(async (password: string) => {
    Keyboard.dismiss()

    await account.changePassword(password)
    await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={lstrings.password_changed}
        message={lstrings.pwd_change_modal}
        buttons={{ ok: { label: lstrings.ok } }}
      >
        <WarningCard
          title={lstrings.warning}
          header={lstrings.password_change_warning}
          marginRem={[1, 0.5]}
        />
      </ButtonsModal>
    ))
    onComplete()
  })

  return <ChangePasswordSceneComponent onSubmit={handleSubmit} />
}

// The scene for existing users to recover their password
export const ResecurePasswordScene = (
  props: SceneProps<'resecurePassword'>
) => {
  const { route } = props
  const { account } = route.params
  const dispatch = useDispatch()

  const handleSkip = useHandler(() => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'resecurePin', params: { account } }
    })
  })

  const handleSubmit = useHandler(async (password: string) => {
    Keyboard.dismiss()

    await account.changePassword(password)
    await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={lstrings.password_changed}
        message={lstrings.pwd_change_modal}
        buttons={{ ok: { label: lstrings.ok } }}
      />
    ))
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'resecurePin', params: { account } }
    })
  })

  return (
    <ChangePasswordSceneComponent
      onSkip={handleSkip}
      title={lstrings.change_password}
      onSubmit={handleSubmit}
    />
  )
}

// The scene for new users to create a password
export const NewAccountPasswordScene = (
  props: SceneProps<'newAccountPassword'>
) => {
  const { route } = props
  const { onLogEvent = () => {} } = useImports()
  const dispatch = useDispatch()

  const handleBack = useHandler(() => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'newAccountUsername', params: route.params }
    })
  })

  const handleSubmit = useHandler((newPassword: string) => {
    onLogEvent('Signup_Password_Valid')
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'newAccountPin',
        params: { ...route.params, password: newPassword }
      }
    })
  })

  return (
    <ChangePasswordSceneComponent
      onBack={handleBack}
      onSubmit={handleSubmit}
      title={lstrings.choose_title_password}
      mainButtonLabel={lstrings.next_label}
    />
  )
}

// The scene for light account users to create a password for the upgrade/backup
export const UpgradePasswordScene = (props: SceneProps<'upgradePassword'>) => {
  const { route } = props
  const { onLogEvent = () => {} } = useImports()
  const dispatch = useDispatch()

  const handleBack = useHandler(() => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'upgradeUsername', params: route.params }
    })
  })

  const handleSubmit = useHandler(async (newPassword: string) => {
    onLogEvent('Backup_Password_Valid')
    dispatch({
      type: 'NAVIGATE',
      data: {
        name: 'upgradeTos',
        params: { ...route.params, password: newPassword }
      }
    })
  })

  return (
    <ChangePasswordSceneComponent
      onBack={handleBack}
      onSubmit={handleSubmit}
      title={lstrings.choose_title_password}
      mainButtonLabel={lstrings.next_label}
    />
  )
}

const validatePassword = (
  password: string,
  confirmPassword: string,
  failStatus: PasswordRequirementStatus
): PasswordRequirements => {
  return {
    minLengthMet: password.length >= 10 ? 'met' : failStatus,
    hasNumber: /[0-9]/.test(password) ? 'met' : failStatus,
    hasLowercase: /[a-z]/.test(password) ? 'met' : failStatus,
    hasUppercase: /[A-Z]/.test(password) ? 'met' : failStatus,
    confirmationMatches:
      confirmPassword !== '' && confirmPassword === password
        ? 'met'
        : failStatus
  }
}
