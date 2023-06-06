import { Action } from '../types/ReduxTypes'

export interface LoginState {
  readonly errorMessage: string | null
  readonly isLoggingInWithPin: boolean
  readonly loginSuccess: boolean
  readonly pin: string | null
  readonly username: string
  readonly wait: number
}

const initialState: LoginState = {
  errorMessage: null,
  isLoggingInWithPin: false,
  loginSuccess: false,
  pin: null,
  username: '',
  wait: 0
}

export function login(
  state: LoginState = initialState,
  action: Action
): LoginState {
  switch (action.type) {
    case 'SET_PREVIOUS_USERS': {
      const { startupUser } = action.data
      if (startupUser != null) {
        return { ...state, username: startupUser.username ?? '' }
      }
      return state
    }
    case 'AUTH_UPDATE_USERNAME':
      return { ...state, username: action.data, errorMessage: null, wait: 0 }
    case 'AUTH_UPDATE_PIN':
      return { ...state, pin: action.data, errorMessage: null }
    case 'LOGIN_SUCCEESS':
      return {
        ...state,
        loginSuccess: true,
        isLoggingInWithPin: false,
        errorMessage: null,
        wait: 0
      }
    case 'LOGIN_PIN_FAIL':
      return {
        ...state,
        errorMessage: action.data.message,
        wait: action.data.wait,
        pin: '',
        isLoggingInWithPin: false
      }
    case 'AUTH_LOGGING_IN_WITH_PIN':
      return { ...state, isLoggingInWithPin: true }
    case 'RESET_APP': {
      const username = state.username
      return { ...initialState, username: username }
    }

    default:
      return state
  }
}
