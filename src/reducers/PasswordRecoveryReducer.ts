import { Action } from '../types/ReduxTypes'

export interface PasswordRecoveryState {
  readonly questionsList: string[] // For changing settings
  readonly recoveryKey?: string // For login
  readonly userQuestions: string[] // For login & changing settings
}

const initialState: PasswordRecoveryState = {
  questionsList: [],
  userQuestions: []
}

export function passwordRecovery(
  state: PasswordRecoveryState = initialState,
  action: Action
): PasswordRecoveryState {
  switch (action.type) {
    case 'NAVIGATE':
      switch (action.data.name) {
        case 'changeRecovery': {
          const { questionsList, userQuestions } = action.data.params
          return { ...state, questionsList, userQuestions }
        }
        case 'recoveryLogin': {
          const { recoveryKey, userQuestions } = action.data.params
          return { ...state, recoveryKey, userQuestions }
        }
      }
      return state
    default:
      return state
  }
}
