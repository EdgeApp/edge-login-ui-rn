import { getSupportedBiometryType, supportsTouchId } from '../keychain'
import { TouchState } from '../reducers/TouchReducer'
import { Dispatch } from '../types/ReduxTypes'
import { readKeychainFile } from '../util/keychainFile'

/**
 * Figures out whether or not biometric logins are available,
 * and saves that to redux.
 */
export const loadTouchState = () => async (
  dispatch: Dispatch
): Promise<TouchState> => {
  const [file, supported, type] = await Promise.all([
    readKeychainFile(),
    supportsTouchId().catch(() => false),
    getSupportedBiometryType()
  ])

  const touchState = { file, supported, type }
  dispatch({ type: 'SET_TOUCH', data: touchState })
  return touchState
}
