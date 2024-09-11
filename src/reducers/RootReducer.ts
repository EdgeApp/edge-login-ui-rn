import { combineReducers } from 'redux'

import { Action } from '../types/ReduxActions'
import { scene, SceneState } from './SceneReducer'
import { touch, TouchState } from './TouchReducer'

export interface RootState {
  createChallengeId: string | null
  scene: SceneState
  touch: TouchState
}

export const rootReducer = combineReducers<RootState>({
  createChallengeId(
    state: string | null = null,
    action: Action
  ): string | null {
    return action.type === 'CREATE_CHALLENGE' ? action.data : state
  },
  scene,
  touch
})
