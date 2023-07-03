import { EdgeAccount } from 'edge-core-js'

import { PreviousUsersState } from '../reducers/PreviousUsersReducer'
import { SceneState } from '../reducers/SceneReducer'
import { TouchState } from '../reducers/TouchReducer'

export type Action =
  // Actions with no payload:
  | { type: 'RESET_APP' }
  // Actions with known payloads:
  | { type: 'AUTH_UPDATE_PIN'; data: string }
  | { type: 'AUTH_UPDATE_USERNAME'; data: string }
  | { type: 'CREATE_ACCOUNT_SUCCESS'; data: EdgeAccount }
  | { type: 'NAVIGATE'; data: SceneState }
  | { type: 'SET_PREVIOUS_USERS'; data: PreviousUsersState }
  | { type: 'SET_TOUCH'; data: TouchState }
