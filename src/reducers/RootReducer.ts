import { EdgeAccount } from 'edge-core-js'
import { combineReducers } from 'redux'

import { Action } from '../types/ReduxTypes'
import { create, CreateState } from './CreateUserReducer'
import { login, LoginState } from './LoginReducer'
import {
  passwordRecovery,
  PasswordRecoveryState
} from './PasswordRecoveryReducer'
import { passwordStatus, PasswordStatusState } from './PasswordStatusReducer'
import { previousUsers, PreviousUsersState } from './PreviousUsersReducer'
import { scene, SceneState } from './SceneReducer'
import { touch, TouchState } from './TouchReducer'

export interface RootState {
  create: CreateState
  login: LoginState
  passwordRecovery: PasswordRecoveryState
  passwordStatus: PasswordStatusState | null
  previousUsers: PreviousUsersState
  scene: SceneState
  touch: TouchState

  // Local reducers:
  readonly account: EdgeAccount | null
}

export const rootReducer = combineReducers<RootState>({
  create,
  login,
  passwordRecovery,
  passwordStatus,
  previousUsers,
  scene,
  touch,

  account(
    state: EdgeAccount | null = null,
    action: Action
  ): EdgeAccount | null {
    switch (action.type) {
      case 'CREATE_ACCOUNT_SUCCESS':
      case 'START_CHANGE_PASSWORD':
      case 'START_CHANGE_PIN':
      case 'START_RESECURE':
      case 'START_SECURITY_ALERT':
        return action.data
      case 'START_CHANGE_RECOVERY':
      case 'START_OTP_REPAIR':
        return action.data.account
    }
    return state
  }
})
