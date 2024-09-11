import { SceneState } from '../reducers/SceneReducer'
import { TouchState } from '../reducers/TouchReducer'

export type Action =
  // Actions with no payload:
  | { type: 'RESET_APP' }
  // Actions with known payloads:
  | { type: 'CREATE_CHALLENGE'; data: string }
  | { type: 'NAVIGATE'; data: SceneState }
  | { type: 'SET_TOUCH'; data: TouchState }
