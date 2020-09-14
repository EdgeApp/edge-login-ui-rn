// @flow

import { type EdgePendingEdgeLogin } from 'edge-core-js'

import s from '../common/locales/strings.js'
import { loginWithTouchId } from '../keychain.js'
import type { Dispatch, GetState, Imports } from '../types/ReduxTypes.js'
import { type LoginAttempt, attemptLogin } from '../util/loginAttempt.js'
import { completeLogin } from './LoginCompleteActions.js'

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

export function userLoginWithTouchId(data: Object) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const { context, folder } = imports
    const startFunction = () => {
      dispatch({ type: 'AUTH_LOGGING_IN_WITH_PIN' })
    }
    loginWithTouchId(
      context,
      folder,
      data.username,
      'Touch to login user: `' + data.username + '`',
      s.strings.login_with_password,
      imports.accountOptions,
      startFunction
    )
      .then(async account => {
        if (account) {
          dispatch(completeLogin(account))
        }
      })
      .catch(e => {
        console.log(e)
      })
  }
}
export function userLoginWithPin(data: Object) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const { callback, context } = imports
    setTimeout(async () => {
      try {
        const abcAccount = await context.loginWithPIN(
          data.username,
          data.pin,
          imports.accountOptions
        )
        dispatch(completeLogin(abcAccount))
      } catch (e) {
        console.log('LOG IN WITH PIN ERROR ', e)
        if (e.name === 'OtpError') {
          const { username, pin } = data
          dispatch({
            type: 'OTP_ERROR',
            data: {
              attempt: { type: 'pin', username, pin },
              error: e
            }
          })
          return
        }
        const message =
          e.name === 'PasswordError'
            ? s.strings.invalid_pin
            : e.name === 'UsernameError'
            ? s.strings.pin_not_enabled
            : e.message
        dispatch({
          type: 'LOGIN_PIN_FAIL',
          data: {
            message,
            wait: e.wait
          }
        })
        if (e.wait) {
          setTimeout(() => {
            dispatch(processWait(message))
          }, 1000)
        }
        callback(e.message, null)
      }
    }, 300)
    // the timeout is a hack until we put in interaction manager.
  }
}
export function processWait(message: string) {
  return (dispatch: Dispatch, getState: GetState, imports: Imports) => {
    const state = getState()
    const wait = state.login.wait
    console.log('RL: wait ', wait)
    if (wait > 0) {
      // console.log('RL: got more than 1', wait)
      dispatch({
        type: 'LOGIN_PIN_FAIL',
        data: {
          message,
          wait: wait - 1
        }
      })
      setTimeout(() => {
        dispatch(processWait(message))
      }, 1000)
    }
  }
}

export const requestEdgeLogin = () => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
): Promise<EdgePendingEdgeLogin> => {
  const { accountOptions, context } = imports
  return context.requestEdgeLogin({
    ...accountOptions,
    // These are no longer used in recent core versions:
    displayImageUrl:
      'https://github.com/Airbitz/edge-brand-guide/blob/master/Logo/Mark/Edge-Final-Logo_Mark-Green.png',
    displayName: 'Edge Wallet'
  })
}
