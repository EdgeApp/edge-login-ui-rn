import { Action } from '../types/ReduxTypes'
import { LoginParamList } from '../types/routerTypes'

// Assemble every valid combination of scene key and route params:
type NamedSceneStates = {
  [Name in keyof LoginParamList]: {
    name: Name
    params: LoginParamList[Name]
  }
}

/**
 * A union of every possible route state,
 * with its name and matching parameters.
 */
export type SceneState = NamedSceneStates[keyof LoginParamList]

const initialState: SceneState = {
  name: 'loading',
  params: {}
}

export function scene(
  state: SceneState = initialState,
  action: Action
): SceneState {
  switch (action.type) {
    case 'NAVIGATE':
      return action.data
    case 'RESET_APP':
      return initialState
    default:
      return state
  }
}
