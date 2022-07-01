import { BiometryType } from '../keychain'
import { Action } from '../types/ReduxActions'

export interface TouchState {
  readonly disabledUsers: string[]
  readonly enabledUsers: string[]
  readonly supported: boolean
  readonly type: BiometryType
}

const initialState: TouchState = {
  disabledUsers: [],
  enabledUsers: [],
  supported: false,
  type: false
}

export const touch = (
  state: TouchState = initialState,
  action: Action
): TouchState => {
  return action.type === 'SET_TOUCH' ? action.data : state
}
