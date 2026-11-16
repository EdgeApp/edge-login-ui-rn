import { BiometryType } from '../components/publicApi/publicTypes'
import { Action } from '../types/ReduxActions'
import { KeychainInfo } from '../util/keychainFile'

export interface TouchState {
  readonly touchFile: KeychainInfo[]
  readonly biometryType: BiometryType
  /** Keychain entries the current biometric enrollment can no longer read. */
  readonly invalidKeys: readonly string[]
}

const initialState: TouchState = {
  touchFile: [],
  biometryType: false,
  invalidKeys: []
}

export const touch = (
  state: TouchState = initialState,
  action: Action
): TouchState => {
  return action.type === 'SET_TOUCH' ? action.data : state
}
