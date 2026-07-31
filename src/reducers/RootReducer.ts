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
    switch (action.type) {
      case 'CREATE_CHALLENGE':
        return action.data
      case 'CLEAR_CREATE_CHALLENGE':
        return null
      default:
        return state
    }
  },
  scene,
  touch
})
