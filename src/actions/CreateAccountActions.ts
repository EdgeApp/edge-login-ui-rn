import s from '../common/locales/strings'
import { Dispatch, GetState, Imports } from '../types/ReduxTypes'

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
