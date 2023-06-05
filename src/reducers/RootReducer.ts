import { combineReducers } from 'redux'

import { create, CreateState } from './CreateUserReducer'
import { login, LoginState } from './LoginReducer'
import { passwordStatus, PasswordStatusState } from './PasswordStatusReducer'
import { previousUsers, PreviousUsersState } from './PreviousUsersReducer'
import { scene, SceneState } from './SceneReducer'
import { touch, TouchState } from './TouchReducer'

export interface RootState {
  create: CreateState
  login: LoginState
  passwordStatus: PasswordStatusState | null
  previousUsers: PreviousUsersState
  scene: SceneState
  touch: TouchState
}

export const rootReducer = combineReducers<RootState>({
  create,
  login,
  passwordStatus,
  previousUsers,
  scene,
  touch
})
