import { LoginUserInfo } from '../hooks/useLocalUsers'
import { Action } from '../types/ReduxTypes'

export interface PreviousUsersState {
  readonly loaded: boolean
  readonly startupUser?: LoginUserInfo
  readonly userList: LoginUserInfo[]
}

const initialState: PreviousUsersState = {
  userList: [],
  loaded: false
}

export function previousUsers(
  state: PreviousUsersState = initialState,
  action: Action
): PreviousUsersState {
  return action.type === 'SET_PREVIOUS_USERS' ? action.data : state
}
