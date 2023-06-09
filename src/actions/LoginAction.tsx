import * as React from 'react'

import s from '../common/locales/strings'
import { TextInputModal } from '../components/modals/TextInputModal'
import { Airship, showError } from '../components/services/AirshipInstance'
import { Dispatch, GetState, Imports } from '../types/ReduxTypes'
import { logEvent } from '../util/analytics'
import { attemptLogin, LoginAttempt } from '../util/loginAttempt'
import { completeLogin } from './LoginCompleteActions'

/**
 * Logs the user in, using password, PIN, or recovery.
 * There is no error handling in here, since components do that best.
 */
export const login = (attempt: LoginAttempt, otpKey?: string) => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
): Promise<void> => {
  const { accountOptions, context } = imports

  const account = await attemptLogin(context, attempt, {
    ...accountOptions,
    otp: otpKey, // Legacy property name
    otpKey
  })
  dispatch(completeLogin(account))
}

/**
 * Ask the user for the username that goes with a recovery key,
 * then launches the questions scene.
 */
export const launchPasswordRecovery = (recoveryKey: string) => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { context } = imports

  async function handleSubmit(username: string): Promise<boolean | string> {
    try {
      const questions = await context.fetchRecovery2Questions(
        recoveryKey,
        username
      )
      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'recoveryLogin',
          params: { recoveryKey, userQuestions: questions, username }
        }
      })
      logEvent('Recovery_Username_Success')
      return true
    } catch (error: any) {
      showError(
        error != null && error.name === 'UsernameError'
          ? s.strings.recovery_by_username_error
          : error
      )
      logEvent('Recovery_Username_Failure')
      return false
    }
  }

  Airship.show(bridge => (
    <TextInputModal
      bridge={bridge}
      onSubmit={handleSubmit}
      title={s.strings.password_recovery}
      message={s.strings.recover_by_username}
      inputLabel={s.strings.username}
      autoCapitalize="none"
      autoCorrect={false}
      autoFocus
    />
  ))
}
