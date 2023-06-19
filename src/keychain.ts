import { EdgeAccount, EdgeUserInfo } from 'edge-core-js'
import { NativeModules, Platform } from 'react-native'

import {
  getKeychainStatus,
  readKeychainFile,
  saveKeychainStatus
} from './util/keychainFile'

export type BiometryType = 'FaceID' | 'TouchID' | false

interface NativeMethods {
  supportsTouchId: () => Promise<boolean>
  getSupportedBiometryType: () => Promise<
    'FaceID' | 'TouchID' | 'Fingerprint' | null
  >

  /**
   * Stores a secret on either iOS and Android.
   */
  setKeychainString: (secret: string, name: string) => Promise<void>

  /**
   * Forgets a secret on either iOS or Android.
   */
  clearKeychain: (name: string) => Promise<void>

  /**
   * Retrieves a stored secret on iOS.
   * Call `authenticateTouchID` to show a fingerprint prompt separately,
   * since this requires no authentication.
   */
  getKeychainString: (name: string) => Promise<string>

  /**
   * Performs a biometric authentication on iOS.
   */
  authenticateTouchID: (
    promptString: string,
    fallbackString: string
  ) => Promise<boolean>

  /**
   * Retrieves a stored secret on Android, with authentication.
   */
  getKeychainStringWithFingerprint: (
    name: string,
    promptString: string
  ) => Promise<string | undefined>
}

const nativeMethods: NativeMethods = NativeModules.AbcCoreJsUi

export async function isTouchEnabled(account: EdgeAccount): Promise<boolean> {
  const supported = await supportsTouchId()
  const file = await readKeychainFile()
  const status = getKeychainStatus(file, account)

  return supported && typeof status === 'string'
}

export async function isTouchDisabled(account: EdgeAccount): Promise<boolean> {
  const supported = await supportsTouchId()
  const file = await readKeychainFile()
  const status = getKeychainStatus(file, account)

  return !supported || status === false
}

export async function supportsTouchId(): Promise<boolean> {
  if (nativeMethods == null) {
    console.warn('Native edge-login-ui-rn methods are missing')
    return false
  }
  const out = await nativeMethods.supportsTouchId()
  return !!out
}

export async function enableTouchId(account: EdgeAccount): Promise<void> {
  const supported = await supportsTouchId()
  const file = await readKeychainFile()

  if (!supported) {
    throw new Error('TouchIdNotSupportedError')
  }

  const loginKey = await account.getLoginKey()
  const location = account.rootLoginId + '_loginId'
  await nativeMethods.setKeychainString(loginKey, location)

  // Update the file:
  await saveKeychainStatus(file, account, location)
}

export async function disableTouchId(account: EdgeAccount): Promise<void> {
  const supported = await supportsTouchId()
  const file = await readKeychainFile()
  const status = getKeychainStatus(file, account)

  if (supported && typeof status === 'string') {
    await nativeMethods.clearKeychain(status)
  }

  // Update the file:
  await saveKeychainStatus(file, account, false)
}

export async function getSupportedBiometryType(): Promise<BiometryType> {
  try {
    const biometryType = await nativeMethods.getSupportedBiometryType()
    switch (biometryType) {
      // Keep these as-is:
      case 'FaceID':
      case 'TouchID':
        return biometryType

      // Android sends this one:
      case 'Fingerprint':
        return 'TouchID'

      // Translate anything truthy to 'TouchID':
      default:
        return biometryType ? 'TouchID' : false
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

/**
 * Looks up the stored biometric secret for a user.
 * Returns undefined if there is no secret, or if the user denies the request.
 */
export async function getLoginKey(
  userInfo: EdgeUserInfo,
  promptString: string,
  fallbackString: string
): Promise<string | undefined> {
  const supported = await supportsTouchId()
  const file = await readKeychainFile()
  const status = getKeychainStatus(file, userInfo)

  if (!supported || typeof status !== 'string') {
    return
  }

  if (Platform.OS === 'ios') {
    const loginKey = await nativeMethods.getKeychainString(status)
    if (typeof loginKey !== 'string' || loginKey.length <= 10) {
      console.log('No valid loginKey for TouchID')
      return
    }

    console.log('loginKey valid. Launching TouchID modal...')
    const success = await nativeMethods.authenticateTouchID(
      promptString,
      fallbackString
    )
    if (success) return loginKey
    console.log('Failed to authenticate TouchID')
  } else if (Platform.OS === 'android') {
    try {
      return await nativeMethods.getKeychainStringWithFingerprint(
        status,
        promptString
      )
    } catch (error) {
      console.log(error) // showError?
    }
  }
}
