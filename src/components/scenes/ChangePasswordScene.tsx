import { EdgeAccount, EdgePasswordRules } from 'edge-core-js'
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
import { FilledTextInput } from '../themed/FilledTextInput'
import { MainButton } from '../themed/MainButton'
import { PasswordStatus } from '../themed/PasswordStatus'
import { ThemedScene } from '../themed/ThemedScene'
import { AlertCardUi4 } from '../ui4/AlertUi4'

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
  const imports = useImports()

  const [focusFirst, setFocusFirst] = React.useState(true)
  const [focusSecond, setFocusSecond] = React.useState(false)
  const [spinning, setSpinning] = React.useState(false)
  const [isShowError, setIsShowError] = React.useState(false)
  const [passwordEval, setPasswordEval] = React.useState<EdgePasswordRules>({
    secondsToCrack: 0, // unused
    passed: false,
    tooShort: true,
    noLowerCase: true,
    noUpperCase: true,
    noNumber: true
  })

  const isRequirementsMet = passwordEval.passed

  const [password, setPassword] = React.useState(initPassword ?? '')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [
    confirmPasswordErrorMessage,
    setConfirmPasswordErrorMessage
  ] = React.useState('')
  const handlePress = useHandler(async () => {
    if (!isRequirementsMet) return
    if (password !== confirmPassword) {
      setConfirmPasswordErrorMessage(lstrings.password_mismatch_error)
      setIsShowError(true)
      return
    }

    setSpinning(true)

    try {
      await onSubmit(password)
    } catch (e) {
      showError(e)
      setSpinning(false)
    }
  })

  const handleFocusSwitch = () => {
    setFocusFirst(false)
    setFocusSecond(true)
  }

  const handleValidatePassword = (password: string) => {
    setPassword(password)
    setIsShowError(false)
    setPasswordEval(imports.context.checkPasswordRules(password))
  }

  const handleChangeConfirmPassword = (confirmPassword: string) => {
    setConfirmPassword(confirmPassword)
    setIsShowError(false)
    if (confirmPassword !== password) {
      setConfirmPasswordErrorMessage(lstrings.password_mismatch_error)
      setIsShowError(true)
    }
  }

  const renderInterior = () => {
    return (
      <>
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
          <PasswordStatus passwordEval={passwordEval} />
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
            autoFocus={focusFirst}
            onChangeText={handleValidatePassword}
            onSubmitEditing={handleFocusSwitch}
            clearIcon
            maxLength={100}
          />
        </EdgeAnim>
        <EdgeAnim enter={{ type: 'fadeInDown', distance: 25 }}>
          <FilledTextInput
            top={0.25}
            horizontal={0.75}
            value={confirmPassword}
            secureTextEntry
            returnKeyType="go"
            placeholder={lstrings.confirm_password}
            autoFocus={focusSecond}
            onChangeText={handleChangeConfirmPassword}
            onSubmitEditing={handlePress}
            clearIcon
            maxLength={100}
          />
        </EdgeAnim>
        {isShowError ? (
          <EdgeAnim
            style={styles.actions}
            enter={{ type: 'fadeInUp', distance: 50 }}
            exit={{ type: 'fadeOutUp', distance: 50 }}
          >
            <AlertCardUi4
              marginRem={[0.75, 1.25]}
              type="error"
              title={confirmPasswordErrorMessage}
            />
          </EdgeAnim>
        ) : null}
        <EdgeAnim
          style={styles.actions}
          enter={{ type: 'fadeInDown', distance: 50 }}
          exit={{ type: 'fadeOutDown', distance: 50 }}
          visible={!isShowError}
        >
          {spinning ? (
            <MainButton disabled marginRem={0.5} type="primary" spinner />
          ) : (
            <MainButton
              label={mainButtonLabel}
              disabled={!isRequirementsMet || confirmPassword === ''}
              marginRem={0.5}
              onPress={handlePress}
              type="primary"
            />
          )}
        </EdgeAnim>
      </>
    )
  }

  return (
    <ThemedScene onBack={onBack} onSkip={onSkip} title={title}>
      {focusSecond ? (
        <KeyboardAwareScrollView style={styles.container}>
          {renderInterior()}
        </KeyboardAwareScrollView>
      ) : (
        renderInterior()
      )}
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
