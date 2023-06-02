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
      case 'NAVIGATE':
        switch (action.data.name) {
          case 'changePassword':
          case 'changePin':
          case 'changeRecovery':
          case 'otpRepair':
          case 'resecurePassword':
          case 'securityAlert': {
            const { account } = action.data.params
            return account
          }
        }
        return state

      case 'CREATE_ACCOUNT_SUCCESS':
        return action.data
    }
    return state
  }
})
