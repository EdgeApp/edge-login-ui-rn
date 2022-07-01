import {
  getSupportedBiometryType,
  loadFingerprintFile,
  supportsTouchId
} from '../keychain'
import { TouchState } from '../reducers/TouchReducer'
import { Dispatch } from '../types/ReduxTypes'

/**
 * Figures out whether or not biometric logins are available,
 * and saves that to redux.
 */
export const loadTouchState = () => async (
  dispatch: Dispatch
): Promise<TouchState> => {
  const [{ disabledUsers, enabledUsers }, supported, type] = await Promise.all([
    loadFingerprintFile(),
    supportsTouchId().catch(() => false),
    getSupportedBiometryType()
  ])

  const touchState = { disabledUsers, enabledUsers, supported, type }
  dispatch({ type: 'SET_TOUCH', data: touchState })
  return touchState
}
