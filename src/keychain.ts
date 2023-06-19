import { asArray, asJSON, asObject, asOptional, asString } from 'cleaners'
import { makeReactNativeDisklet } from 'disklet'
import { EdgeAccount } from 'edge-core-js'
import { NativeModules, Platform } from 'react-native'

const disklet = makeReactNativeDisklet()

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

function createKeyWithUsername(username: string) {
  return username + '___key_loginkey'
}

const asFingerprintFile = asJSON(
  asObject({
    enabledUsers: asOptional(asArray(asString), []),
    disabledUsers: asOptional(asArray(asString), [])
  })
)
type FingerprintFile = ReturnType<typeof asFingerprintFile>

export async function isTouchEnabled(account: EdgeAccount): Promise<boolean> {
  const { username } = account
  if (username == null) return false

  const file = await loadFingerprintFile()
  const supported = await supportsTouchId()

  return supported && file.enabledUsers.includes(username)
}

export async function isTouchDisabled(account: EdgeAccount): Promise<boolean> {
  const { username } = account
  if (username == null) return true

  const file = await loadFingerprintFile()
  const supported = await supportsTouchId()

  return !supported || file.disabledUsers.includes(username)
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
  const { username } = account

  const file = await loadFingerprintFile()
  const supported = await supportsTouchId()
  if (!supported || username == null) {
    throw new Error('TouchIdNotSupportedError')
  }

  const loginKey = await account.getLoginKey()
  const loginKeyKey = createKeyWithUsername(username)
  await nativeMethods.setKeychainString(loginKey, loginKeyKey)

  // Update the file:
  if (!file.enabledUsers.includes(username)) {
    file.enabledUsers = [...file.enabledUsers, username]
  }
  if (file.disabledUsers.includes(username)) {
    file.disabledUsers = file.disabledUsers.filter(item => item !== username)
  }
  saveFingerprintFile(file)
}

export async function disableTouchId(account: EdgeAccount): Promise<void> {
  const { username } = account

  const file = await loadFingerprintFile()
  const supported = await supportsTouchId()
  if (!supported || username == null) return // throw new Error('TouchIdNotSupportedError')

  const loginKeyKey = createKeyWithUsername(username)
  await nativeMethods.clearKeychain(loginKeyKey)

  // Update the file:
  if (!file.disabledUsers.includes(username)) {
    file.disabledUsers = [...file.disabledUsers, username]
  }
  if (file.enabledUsers.includes(username)) {
    file.enabledUsers = file.enabledUsers.filter(item => item !== username)
  }
  await saveFingerprintFile(file)
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
  username: string,
  promptString: string,
  fallbackString: string
): Promise<string | undefined> {
  const file = await loadFingerprintFile()
  const supported = await supportsTouchId()
  if (
    !supported ||
    !file.enabledUsers.includes(username) ||
    file.disabledUsers.includes(username)
  ) {
    return
  }

  const loginKeyKey = createKeyWithUsername(username)
  if (Platform.OS === 'ios') {
    const loginKey = await nativeMethods.getKeychainString(loginKeyKey)
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
        loginKeyKey,
        promptString
      )
    } catch (error) {
      console.log(error) // showError?
    }
  }
}

export async function loadFingerprintFile(): Promise<FingerprintFile> {
  try {
    const json = await disklet.getText('fingerprint.json')
    return asFingerprintFile(json)
  } catch (error) {
    return { enabledUsers: [], disabledUsers: [] }
  }
}

async function saveFingerprintFile(file: FingerprintFile): Promise<void> {
  const text = JSON.stringify(file)
  await disklet.setText('fingerprint.json', text)
}
