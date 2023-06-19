import { BiometryType } from '../keychain'
import { Action } from '../types/ReduxActions'
import { KeychainInfo } from '../util/keychainFile'

export interface TouchState {
  readonly file: KeychainInfo[]
  readonly supported: boolean
  readonly type: BiometryType
}

const initialState: TouchState = {
  file: [],
  supported: false,
  type: false
}

export const touch = (
  state: TouchState = initialState,
  action: Action
): TouchState => {
  return action.type === 'SET_TOUCH' ? action.data : state
}
