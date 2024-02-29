import { BiometryType } from '../keychain'
import { Action } from '../types/ReduxActions'
import { KeychainInfo } from '../util/keychainFile'

export interface TouchState {
  readonly touchFile: KeychainInfo[]
  readonly biometryType: BiometryType
}

const initialState: TouchState = {
  touchFile: [],
  biometryType: false
}

export const touch = (
  state: TouchState = initialState,
  action: Action
): TouchState => {
  return action.type === 'SET_TOUCH' ? action.data : state
}
