import { EdgeAccount, EdgePasswordRules } from 'edge-core-js'

import { PreviousUsersState } from '../reducers/PreviousUsersReducer'
import { SceneState } from '../reducers/SceneReducer'
import { TouchState } from '../reducers/TouchReducer'

// Actions with no payload:
type NoDataActionName = 'CLEAR_CREATE_ERROR_MESSAGE' | 'RESET_APP'

export type Action =
  | { type: NoDataActionName }
  // Actions with known payloads:
  | {
      type: 'AUTH_UPDATE_CONFIRM_PASSWORD'
      data: {
        password: string | null
        error: string | null
      }
    }
  | {
      type: 'AUTH_UPDATE_PASSWORD'
      data: {
        password: string
        passwordStatus: EdgePasswordRules
        passwordCheckString: string
        error: string | null
      }
    }
  | { type: 'AUTH_UPDATE_PIN'; data: string }
  | { type: 'AUTH_UPDATE_USERNAME'; data: string }
  | { type: 'CREATE_ACCOUNT_FAIL'; data: string /* error */ }
  | { type: 'CREATE_ACCOUNT_SUCCESS'; data: EdgeAccount }
  | {
      // TODO: remove
      type: 'CREATE_UPDATE_PIN'
      data: {
        pin: string
        error: string | null
      }
    }
  | { type: 'NAVIGATE'; data: SceneState }
  | { type: 'SET_PREVIOUS_USERS'; data: PreviousUsersState }
  | { type: 'SET_TOUCH'; data: TouchState }
