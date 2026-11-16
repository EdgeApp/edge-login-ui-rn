import { getInvalidBiometricKeys, getSupportedBiometryType } from '../keychain'
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
  // HACK: yarn prepare breaks for some reason when specifying the type of
  // 'values' after ButtonsModal and ChallengeModal were updated to UI4
  const values: any = await Promise.all([
    readKeychainFile(),
    getSupportedBiometryType()
  ])
  const [touchFile, biometryType] = values

  const invalidKeys =
    biometryType === false ? [] : await getInvalidBiometricKeys(touchFile)

  const touchState: TouchState = { touchFile, biometryType, invalidKeys }
  dispatch({ type: 'SET_TOUCH', data: touchState })
  return touchState
}
