import { Dispatch, GetState, Imports } from '../types/ReduxTypes'

export const deleteUserFromDevice = (username: string) => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { context } = imports
  await context.deleteLocalAccount(username)
}
