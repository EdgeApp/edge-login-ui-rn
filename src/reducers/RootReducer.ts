import { combineReducers } from 'redux'

import { login, LoginState } from './LoginReducer'
import { previousUsers, PreviousUsersState } from './PreviousUsersReducer'
import { scene, SceneState } from './SceneReducer'
import { touch, TouchState } from './TouchReducer'

export interface RootState {
  login: LoginState
  previousUsers: PreviousUsersState
  scene: SceneState
  touch: TouchState
}

export const rootReducer = combineReducers<RootState>({
  login,
  previousUsers,
  scene,
  touch
})
