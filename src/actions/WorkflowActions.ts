import { Dispatch, GetState, Imports } from '../types/ReduxTypes'

export const onComplete = () => (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  if (imports.onComplete == null) return
  imports.onComplete()
}
