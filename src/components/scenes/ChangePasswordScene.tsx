import * as React from 'react'
import { Keyboard, KeyboardAvoidingView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import {
  validateConfirmPassword,
  validatePassword
} from '../../actions/CreateAccountActions'
import { onComplete } from '../../actions/WorkflowActions'
import s from '../../common/locales/strings'
import { useHandler } from '../../hooks/useHandler.js'
import { useDispatch, useSelector } from '../../types/ReduxTypes'
import { logEvent } from '../../util/analytics'
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

interface Props {
  title?: string | undefined
  onBack?: (() => void) | undefined
  onSkip?: (() => void) | undefined
  onSubmit: (password: string) => void | Promise<void>
  mainButtonLabel?: string
}

const ChangePasswordSceneComponent = ({
  title,
  onBack,
  onSkip,
  onSubmit,
  mainButtonLabel = s.strings.done
}: Props) => {
  const theme = useTheme()
  const styles = getStyles(theme)

  const dispatch = useDispatch()
  const [focusFirst, setFocusFirst] = React.useState(true)
  const [focusSecond, setFocusSecond] = React.useState(false)
  const [hidePassword, setHidePassword] = React.useState(true)
  const [spinning, setSpinning] = React.useState(false)
  const [isShowError, setIsShowError] = React.useState(false)

  const hasPasswordStatus = useSelector(state => state.passwordStatus != null)
  const isRequirementsMet = useSelector(
    state => state.passwordStatus?.passed ?? false
  )
  const password = useSelector(state => state.create.password ?? '')
  const confirmPassword = useSelector(
    state => state.create.confirmPassword ?? ''
  )
  const confirmPasswordErrorMessage = useSelector(
    state => state.create.confirmPasswordErrorMessage ?? ''
  )

  const handleHidePassword = useHandler(() => {
    setHidePassword(!hidePassword)
  })

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

  const validatePasswordDispatch = (password: string) => {
    setIsShowError(false)
    dispatch(validatePassword(password))
  }
  const validateConfirmPasswordDispatch = (password: string) => {
    setIsShowError(false)
    dispatch(validateConfirmPassword(password))
  }

  const renderInterior = () => {
    return (
      <>
        {hasPasswordStatus ? (
          <PasswordStatus marginRem={[0.5, 0.5, 1.25]} />
        ) : (
          <EdgeText style={styles.description} numberOfLines={4}>
            {s.strings.password_desc}
          </EdgeText>
        )}
        <OutlinedTextInput
          value={password}
          secureTextEntry
          returnKeyType="next"
          label={s.strings.password}
          autoFocus={focusFirst}
          hidePassword={hidePassword}
          onChangeText={validatePasswordDispatch}
          onSubmitEditing={handleFocusSwitch}
          onHidePassword={handleHidePassword}
          clearIcon
          searchIcon={false}
          marginRem={[0, 0.75, 1.25]}
          maxLength={100}
        />
        <OutlinedTextInput
          value={confirmPassword}
          secureTextEntry
          returnKeyType="go"
          label={s.strings.confirm_password}
          autoFocus={focusSecond}
          hidePassword={hidePassword}
          onChangeText={validateConfirmPasswordDispatch}
          onSubmitEditing={handlePress}
          onHidePassword={handleHidePassword}
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
export const ChangePasswordScene = () => {
  const dispatch = useDispatch()
  const account = useSelector(state => state.account ?? undefined)
  const handleSubmit = useHandler(async (password: string) => {
    Keyboard.dismiss()
    if (account == null) return

    await account.changePassword(password)
    await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={s.strings.password_changed}
        message={s.strings.pwd_change_modal}
        buttons={{ ok: { label: s.strings.ok } }}
      >
        <WarningCard
          title={s.strings.warning}
          header={s.strings.password_change_warning}
          marginRem={[1, 0.5]}
        />
      </ButtonsModal>
    ))
    dispatch(onComplete())
  })

  return <ChangePasswordSceneComponent onSubmit={handleSubmit} />
}

// The scene for existing users to recover their password
export const ResecurePasswordScene = () => {
  const dispatch = useDispatch()
  const account = useSelector(state => state.account ?? undefined)

  const handleSkip = useHandler(() => {
    dispatch({ type: 'RESECURE_PIN' })
  })

  const handleSubmit = useHandler(async (password: string) => {
    Keyboard.dismiss()
    if (account == null) return

    await account.changePassword(password)
    await Airship.show(bridge => (
      <ButtonsModal
        bridge={bridge}
        title={s.strings.password_changed}
        message={s.strings.pwd_change_modal}
        buttons={{ ok: { label: s.strings.ok } }}
      />
    ))
    dispatch({ type: 'RESECURE_PIN' })
  })

  return (
    <ChangePasswordSceneComponent
      onSkip={handleSkip}
      title={s.strings.change_password}
      onSubmit={handleSubmit}
    />
  )
}

// The scene for new users to create a password
export const NewAccountPasswordScene = () => {
  const dispatch = useDispatch()

  const handleBack = useHandler(() => {
    dispatch({ type: 'NEW_ACCOUNT_USERNAME' })
  })

  const handleSubmit = useHandler(() => {
    logEvent('Signup_Password_Valid')
    dispatch({ type: 'NEW_ACCOUNT_PIN' })
  })

  return (
    <ChangePasswordSceneComponent
      onBack={handleBack}
      onSubmit={handleSubmit}
      title={s.strings.choose_title_password}
      mainButtonLabel={s.strings.next_label}
    />
  )
}
