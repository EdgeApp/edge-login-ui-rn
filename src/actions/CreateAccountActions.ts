import { sprintf } from 'sprintf-js'
import passwordCheck from 'zxcvbn'

import s from '../common/locales/strings'
import { Airship } from '../components/services/AirshipInstance'
import * as Constants from '../constants/index'
import { enableTouchId, isTouchDisabled } from '../keychain'
import { Dispatch, GetState, Imports } from '../types/ReduxTypes'
import { logEvent } from '../util/analytics'
import { loadTouchState } from './TouchActions'

export interface CreateUserData {
  username: string
  password: string
  pin: string
}

export function validatePin(pin: string) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    let error = null
    if (pin.length !== 4) {
      error = s.strings.four_digit_pin_error
    }
    if (pin.length > 4) {
      return
    }
    dispatch({ type: 'CREATE_UPDATE_PIN', data: { pin, error } })
  }
}

/**
 * Fetch whether the username is available
 */
export function fetchIsUsernameAvailable(username: string) {
  return async (
    dispatch: Dispatch,
    getState: GetState,
    imports: Imports
  ): Promise<boolean> => {
    return await imports.context
      .usernameAvailable(username)
      .then(async isAvailable => {
        return isAvailable
      })
      .catch(e => {
        throw new Error(e.message)
      })
  }
}

export function validateConfirmPassword(confirmPassword: string) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const state = getState()
    // dispatch(openLoading()) Legacy dealt with state for showing a spinner
    // the timeout is a hack until we put in interaction manager.
    let error = null
    if (confirmPassword !== state.create.password) {
      error = s.strings.password_mismatch_error
    }
    dispatch({
      type: 'AUTH_UPDATE_CONFIRM_PASSWORD',
      data: { password: confirmPassword, error }
    })
  }
}
export function validatePassword(data: string) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const context = imports.context
    const error = null
    // dispatch(openLoading()) Legacy dealt with state for showing a spinner
    // the timeout is a hack until we put in interaction manager.
    const passwordEval = context.checkPasswordRules(data)
    const passwordCheckResult = passwordCheck(data)
    let passwordCheckString

    if (
      passwordCheckResult &&
      passwordCheckResult.crack_times_display &&
      passwordCheckResult.crack_times_display.online_no_throttling_10_per_second
    ) {
      passwordCheckString =
        passwordCheckResult.crack_times_display
          .online_no_throttling_10_per_second
    }

    passwordCheckString = sprintf(
      s.strings.it_would_take_xx_to_crack,
      passwordCheckString
    )
    if (passwordCheckResult.score < 3) {
      passwordCheckString += s.strings.recommend_choosing_a_stronger
    }

    dispatch({
      type: 'AUTH_UPDATE_PASSWORD',
      data: {
        password: data,
        passwordStatus: passwordEval,
        passwordCheckString,
        error: error
      }
    })
  }
}

export function createUser(data: CreateUserData) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const { context } = imports
    dispatch({ type: 'NEW_ACCOUNT_WAIT' })
    setTimeout(async () => {
      try {
        const abcAccount = await context.createAccount({
          ...imports.accountOptions,
          ...data
        })
        abcAccount.watch('loggedIn', loggedIn => {
          if (!loggedIn) dispatch({ type: 'RESET_APP' })
        })
        const touchDisabled = await isTouchDisabled(abcAccount.username)
        if (!touchDisabled) {
          await enableTouchId(abcAccount).catch(e => {
            console.log(e) // Fail quietly
          })
        }
        dispatch({ type: 'CREATE_ACCOUNT_SUCCESS', data: abcAccount })
        dispatch({ type: 'NEW_ACCOUNT_REVIEW' })
        logEvent('Signup_Create_User_Success')
        await abcAccount.dataStore.setItem(
          Constants.OTP_REMINDER_STORE_NAME,
          Constants.OTP_REMINDER_KEY_NAME_CREATED_AT,
          Date.now().toString()
        )
        dispatch(loadTouchState())
      } catch (e: any) {
        console.log(e)
        dispatch({ type: 'CREATE_ACCOUNT_FAIL', data: e.message })
        dispatch({ type: 'NEW_ACCOUNT_USERNAME' })
      }
    }, 300)
  }
}

export const confirmAndFinish = () => (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { account } = getState()
  const { onLogin } = imports
  if (account == null) return

  Airship.clear()
  if (onLogin != null) onLogin(account)
}
