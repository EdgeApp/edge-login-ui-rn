// @flow

import * as React from 'react'
import { KeyboardAvoidingView, View } from 'react-native'
import { cacheStyles } from 'react-native-patina'

import {
  validateConfirmPassword,
  validatePassword
} from '../../../actions/CreateAccountActions.js'
import s from '../../../common/locales/strings.js'
import { type Dispatch, type RootState } from '../../../types/ReduxTypes.js'
import { logEvent } from '../../../util/analytics.js'
import { useState } from '../../../util/hooks'
import { connect } from '../../services/ReduxStore.js'
import {
  type Theme,
  type ThemeProps,
  withTheme
} from '../../services/ThemeContext'
import { EdgeText } from '../../themed/EdgeText'
import { EdgeTextFieldOutlined } from '../../themed/EdgeTextFieldOutlined'
import { Fade } from '../../themed/Fade'
import { FormError } from '../../themed/FormError'
import { PasswordStatus } from '../../themed/PasswordStatus'
import { SimpleSceneHeader } from '../../themed/SimpleSceneHeader'
import { SecondaryButton } from '../../themed/ThemedButtons'
import { ThemedScene } from '../../themed/ThemedScene'

type OwnProps = {}
type StateProps = {
  confirmPassword: string,
  confirmPasswordErrorMessage: string,
  createPasswordErrorMessage: string,
  password: string,
  isPasswordStatusExists: boolean,
  isPasswordPassed: boolean
}
type DispatchProps = {
  onDone(): void,
  validateConfirmPassword(password: string): void,
  validatePassword(password: string): void
}
type Props = OwnProps & StateProps & DispatchProps & ThemeProps

const NewAccountPasswordScreenComponent = ({
  confirmPassword,
  confirmPasswordErrorMessage,
  createPasswordErrorMessage,
  password,
  onDone,
  validateConfirmPassword,
  validatePassword,
  isPasswordStatusExists,
  isPasswordPassed,
  theme
}: Props) => {
  const styles = getStyles(theme)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [focusFirst, setFocusFirst] = useState<boolean>(true)
  const [focusSecond, setFocusSecond] = useState<boolean>(false)

  const handleFocusSwitch = () => {
    setFocusFirst(false)
    setFocusSecond(true)
  }

  const handleNext = () => {
    setIsProcessing(true)

    if (!isPasswordStatusExists) {
      // TODO Skip component
      setIsProcessing(false)
      return
    }

    if (
      confirmPasswordErrorMessage !== '' ||
      createPasswordErrorMessage !== ''
    ) {
      setIsProcessing(false)
      logEvent('Signup_Password_Invalid')
      return
    }

    if (password && password !== confirmPassword) {
      setIsProcessing(false)
      validateConfirmPassword(confirmPassword)
      logEvent('Signup_Password_Invalid')
      return
    }

    logEvent('Signup_Password_Valid')
    onDone()
  }

  const renderInterior = () => {
    return (
      <>
        {isPasswordStatusExists ? (
          <PasswordStatus marginRem={[0, 0, 1.25]} />
        ) : (
          <>
            <EdgeText
              style={styles.subtitle}
            >{`${s.strings.step_two}: ${s.strings.choose_title_password}`}</EdgeText>
            <EdgeText style={styles.description} numberOfLines={2}>
              {s.strings.password_desc}
            </EdgeText>
          </>
        )}
        <EdgeTextFieldOutlined
          value={password}
          secureTextEntry
          returnKeyType="next"
          label={s.strings.password}
          autoFocus={focusFirst}
          onChangeText={validatePassword}
          onSubmitEditing={handleFocusSwitch}
          isClearable
          showSearchIcon={false}
          marginRem={[0, 0, 1.25]}
        />
        <EdgeTextFieldOutlined
          value={confirmPassword}
          secureTextEntry
          returnKeyType="go"
          label={s.strings.confirm_password}
          autoFocus={focusSecond}
          onChangeText={validateConfirmPassword}
          onSubmitEditing={handleNext}
          isClearable
          showSearchIcon={false}
          marginRem={0}
        />
        <FormError marginRem={[1.25, 0, 0]}>
          {confirmPasswordErrorMessage || createPasswordErrorMessage}
        </FormError>
        <View style={styles.actions}>
          <Fade
            visible={
              isPasswordPassed &&
              password === confirmPassword &&
              !confirmPasswordErrorMessage &&
              !createPasswordErrorMessage
            }
            hidden
          >
            <SecondaryButton
              label={s.strings.next_label}
              onPress={handleNext}
              spinner={isProcessing}
              straight
              bold
            />
          </Fade>
        </View>
      </>
    )
  }

  return (
    <ThemedScene paddingRem={[0.5, 0, 0.5, 0.5]}>
      <SimpleSceneHeader>{s.strings.create_your_account}</SimpleSceneHeader>
      {focusSecond ? (
        <KeyboardAvoidingView
          style={styles.pageContainer}
          contentContainerStyle={styles.pageContainer}
          behavior="position"
          keyboardVerticalOffset={-150}
        >
          {renderInterior()}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.pageContainer}>{renderInterior()}</View>
      )}
    </ThemedScene>
  )
}

const getStyles = cacheStyles((theme: Theme) => ({
  pageContainer: {
    flex: 1,
    marginHorizontal: theme.rem(0.5)
  },
  subtitle: {
    fontFamily: theme.fontFaceBold,
    color: theme.secondaryText,
    fontSize: theme.rem(1),
    marginBottom: theme.rem(2.25)
  },
  description: {
    fontFamily: theme.fontFaceDefault,
    fontSize: theme.rem(0.875),
    marginBottom: theme.rem(3.25)
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.rem(5)
  }
}))

export const NewAccountPasswordScreen = connect<
  StateProps,
  DispatchProps,
  OwnProps
>(
  (state: RootState) => ({
    confirmPassword: state.create.confirmPassword || '',
    confirmPasswordErrorMessage: state.create.confirmPasswordErrorMessage || '',
    createPasswordErrorMessage: state.create.createPasswordErrorMessage || '',
    password: state.create.password || '',
    isPasswordStatusExists: !!state.passwordStatus,
    isPasswordPassed: Boolean(
      state.passwordStatus && state.passwordStatus.passed
    )
  }),
  (dispatch: Dispatch) => ({
    onDone() {
      dispatch({ type: 'WORKFLOW_NEXT' })
    },
    validateConfirmPassword(password: string) {
      dispatch(validateConfirmPassword(password))
    },
    validatePassword(password: string) {
      dispatch(validatePassword(password))
    }
  })
)(withTheme(NewAccountPasswordScreenComponent))
