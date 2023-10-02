import { EdgePasswordRules } from 'edge-core-js'
import * as React from 'react'
import { Keyboard, KeyboardAvoidingView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import { lstrings } from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler.js'
import { useImports } from '../../hooks/useImports'
import { useDispatch } from '../../types/ReduxTypes'
import {
  AccountParams,
  CreateFlowParams,
  SceneProps
} from '../../types/routerTypes'
import { WarningCard } from '../common/WarningCard'
import { ButtonsModal } from '../modals/ButtonsModal'
import { Airship, showError } from '../services/AirshipInstance'
import { Theme, useTheme } from '../services/ThemeContext'
import { EdgeText } from '../themed/EdgeText'
import { Fade } from '../themed/Fade'
import { FormError } from '../themed/FormError'
import { MainButton } from '../themed/MainButton'
import { OutlinedTextInput } from '../themed/OutlinedTextInput'
import { PasswordStatus } from '../themed/PasswordStatus'
import { ThemedScene } from '../themed/ThemedScene'

export interface AccountPasswordParams
  extends AccountParams,
    CreateFlowParams {}

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
  const [passwordEval, setPasswordEval] = React.useState<
    EdgePasswordRules | undefined
  >(undefined)
  const isRequirementsMet = passwordEval?.passed ?? false

  const [password, setPassword] = React.useState(initPassword ?? '')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [
    confirmPasswordErrorMessage,
    setConfirmPasswordErrorMessage
  ] = React.useState('')

  const handlePress = useHandler(async () => {
    if (!isRequirementsMet) return
    if (password !== confirmPassword) {
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
        {passwordEval != null ? (
          <PasswordStatus
            marginRem={[0.5, 0.5, 1.25]}
            passwordEval={passwordEval}
          />
        ) : (
          <EdgeText style={styles.description} numberOfLines={4}>
            {lstrings.password_desc}
          </EdgeText>
        )}
        <OutlinedTextInput
          value={password}
          secureTextEntry
          returnKeyType="next"
          label={lstrings.password}
          autoFocus={focusFirst}
          onChangeText={handleValidatePassword}
          onSubmitEditing={handleFocusSwitch}
          clearIcon
          searchIcon={false}
          marginRem={[0, 0.75, 1.25]}
          maxLength={100}
        />
        <OutlinedTextInput
          value={confirmPassword}
          secureTextEntry
          returnKeyType="go"
          label={lstrings.confirm_password}
          autoFocus={focusSecond}
          onChangeText={handleChangeConfirmPassword}
          onSubmitEditing={handlePress}
          clearIcon
          searchIcon={false}
          marginRem={[0, 0.75, 1.25]}
          maxLength={100}
        />
        <FormError marginRem={[0, 0.75]} invisible={!isShowError}>
          {confirmPasswordErrorMessage}
        </FormError>
        <View style={styles.actions}>
          <Fade visible={!isShowError} hidden>
            {spinning ? (
              <MainButton
                alignSelf="center"
                disabled
                marginRem={0.5}
                type="secondary"
                spinner
              />
            ) : (
              <MainButton
                alignSelf="center"
                label={mainButtonLabel}
                disabled={!isRequirementsMet || confirmPassword === ''}
                marginRem={0.5}
                onPress={handlePress}
                type="secondary"
              />
            )}
          </Fade>
        </View>
      </>
    )
  }

  return (
    <ThemedScene onBack={onBack} onSkip={onSkip} title={title}>
      {focusSecond ? (
        <KeyboardAvoidingView
          style={styles.container}
          behavior="position"
          keyboardVerticalOffset={-150}
        >
          {renderInterior()}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.container}>{renderInterior()}</View>
      )}
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  container: {
    flex: 1,
    marginHorizontal: theme.rem(0.5),
    overflow: 'hidden'
  },
  description: {
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875),
    marginBottom: theme.rem(3.25),
    marginTop: theme.rem(1.5)
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
  const { onLogEvent = (event, values?) => {} } = useImports()
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
  const { onLogEvent = (event, values?) => {} } = useImports()
  const dispatch = useDispatch()

  const handleBack = useHandler(() => {
    dispatch({
      type: 'NAVIGATE',
      data: { name: 'upgradeUsername', params: { ...route.params } }
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
