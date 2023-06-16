import { Action } from '../types/ReduxTypes'

export interface CreateState {
  readonly createErrorMessage: string | null
}

const initialState: CreateState = {
  createErrorMessage: null
}

export function create(
  state: CreateState = initialState,
  action: Action
): CreateState {
  switch (action.type) {
    case 'CREATE_ACCOUNT_FAIL':
      return { ...state, createErrorMessage: action.data }
    case 'CLEAR_CREATE_ERROR_MESSAGE':
      return { ...state, createErrorMessage: null }
    case 'RESET_APP':
      return initialState
    default:
      return state
  }
}
