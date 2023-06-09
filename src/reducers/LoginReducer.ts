import { Action } from '../types/ReduxTypes'

export interface LoginState {
  readonly username: string
}

const initialState: LoginState = {
  username: ''
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
      return { ...state, username: action.data }
    case 'RESET_APP': {
      const username = state.username
      return { ...initialState, username: username }
    }

    default:
      return state
  }
}
