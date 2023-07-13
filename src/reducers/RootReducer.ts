import { combineReducers } from 'redux'

import { scene, SceneState } from './SceneReducer'
import { touch, TouchState } from './TouchReducer'

export interface RootState {
  scene: SceneState
  touch: TouchState
}

export const rootReducer = combineReducers<RootState>({
  scene,
  touch
})
