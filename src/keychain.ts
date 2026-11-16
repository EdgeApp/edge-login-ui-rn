import { EdgeAccount, EdgeUserInfo } from 'edge-core-js'
import { NativeModules, Platform } from 'react-native'

import { BiometryType } from './components/publicApi/publicTypes'
import {
  getKeychainStatus,
  KeychainInfo,
  readKeychainFile,
  saveKeychainStatus
} from './util/keychainFile'

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

  /**
   * True if a secret exists and the current biometric enrollment may read it.
   * This never prompts and never changes the stored secret.
   */
  hasValidKeychainString: (name: string) => Promise<boolean>
}

const nativeMethods: NativeMethods = NativeModules.AbcCoreJsUi

/**
 * Should be called at login to ensure biometric login is properly enabled.
 * @param account The account that has just logged in.
 */
export async function refreshTouchId(account: EdgeAccount): Promise<void> {
  const supported = await supportsTouchId()
  const file = await readKeychainFile()
  const status = getKeychainStatus(file, account)

  if (supported && status !== false && !account.isDuressAccount) {
    const loginKey = await account.getLoginKey()
    const location =
      typeof status === 'string' ? status : account.rootLoginId + '_loginId'
    await nativeMethods.setKeychainString(loginKey, location)

    // Update the file:
    await saveKeychainStatus(file, account, location)
  }
}

export async function isTouchEnabled(account: EdgeAccount): Promise<boolean> {
  const supported = await supportsTouchId()
  const file = await readKeychainFile()
  const status = getKeychainStatus(file, account)

  return supported && typeof status === 'string'
}

export async function enableTouchId(account: EdgeAccount): Promise<void> {
  const supported = await supportsTouchId()
  const file = await readKeychainFile()
  const status = getKeychainStatus(file, account)

  if (!supported || account.isDuressAccount) {
    throw new Error('TouchIdNotSupportedError')
  }

  const loginKey = await account.getLoginKey()
  const location =
    typeof status === 'string' ? status : account.rootLoginId + '_loginId'
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
    const supported = await supportsTouchId()
    if (!supported) return false
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
 * Returns undefined if there is no secret, the biometric enrollment changed,
 * or the user denies the request.
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

  // Redux can be stale, so a tap cannot rely on the icon having been hidden:
  if (!(await isBiometricKeyValid(status))) {
    console.log('Biometric enrollment changed since this login was saved')
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

/**
 * Lists the secrets in the keychain file that the current biometric enrollment
 * can no longer read, per docs/biometric-login-policy.md.
 */
export async function getInvalidBiometricKeys(
  file: KeychainInfo[]
): Promise<string[]> {
  const keys = file
    .map(info => info.key)
    .filter((key): key is string => typeof key === 'string')
  const valid = await Promise.all(keys.map(isBiometricKeyValid))
  return keys.filter((_, index) => !valid[index])
}

/**
 * A native failure hides biometric login, since the read it guards would
 * fail or could not be trusted. The list is rebuilt on every load, so a
 * transient failure only lasts until the next one.
 */
async function isBiometricKeyValid(key: string): Promise<boolean> {
  try {
    return await nativeMethods.hasValidKeychainString(key)
  } catch (error: unknown) {
    console.log(error)
    return false
  }
}

async function supportsTouchId(): Promise<boolean> {
  if (nativeMethods == null) {
    console.warn('Native edge-login-ui-rn methods are missing')
    return false
  }
  const out = await nativeMethods.supportsTouchId()
  return !!out
}
