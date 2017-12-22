import { NativeModules, Platform } from 'react-native'
const { AbcCoreJsUi } = NativeModules

const LOGINKEY_KEY = 'key_loginkey'
// const USE_TOUCHID_KEY = 'key_use_touchid'
// const RECOVERY2_KEY = 'key_recovery2'

function createKeyWithUsername (username, key) {
  return username + '___' + key
}

export async function isTouchEnabled (abcAccount) {
  const supported = await supportsTouchId()
  return supported
}

export async function supportsTouchId () {
  if (!AbcCoreJsUi) {
    console.warn('AbcCoreJsUi  is unavailable')
    return false
  }
  const out = await AbcCoreJsUi.supportsTouchId()
  return out
}

export async function enableTouchId (abcAccount) {
  const supported = await supportsTouchId()

  if (supported) {
    const loginKeyKey = createKeyWithUsername(abcAccount.username, LOGINKEY_KEY)
    await AbcCoreJsUi.setKeychainString(abcAccount.loginKey, loginKeyKey)
    return true
  } else {
    // throw new Error('TouchIdNotSupportedError')
  }
}

export async function disableTouchId (abcAccount) {
  const supported = await supportsTouchId()

  if (supported) {
    const loginKeyKey = createKeyWithUsername(abcAccount.username, LOGINKEY_KEY)
    await AbcCoreJsUi.clearKeychain(loginKeyKey)
    return true
  } else {
    // throw new Error('TouchIdNotSupportedError')
  }
}

export async function loginWithTouchId (
  abcContext,
  username,
  promptString,
  fallbackString,
  opts,
  callback
) {
  const supported = await supportsTouchId()

  if (supported) {
    const loginKeyKey = createKeyWithUsername(username, LOGINKEY_KEY)

    if (Platform.OS === 'ios') {
      const loginKey = await AbcCoreJsUi.getKeychainString(loginKeyKey)
      if (loginKey && loginKey.length > 10) {
        console.log('loginKey valid. Launching TouchID modal...')

        const success = await AbcCoreJsUi.authenticateTouchID(
          promptString,
          fallbackString
        )
        if (success) {
          console.log('TouchID authenticated. Calling loginWithKey')
          callback()
          const abcAccount = abcContext.loginWithKey(username, loginKey, opts)
          console.log('abcAccount logged in: ' + username)
          return abcAccount
        } else {
          console.log('Failed to authenticate TouchID')
          return null
        }
      } else {
        console.log('No valid loginKey for TouchID')
        return null
      }
    } else if (Platform.OS === 'android') {
      try {
        const loginKey = await AbcCoreJsUi.getKeychainStringWithFingerprint(loginKeyKey, promptString)
        callback()
        const abcAccount = abcContext.loginWithKey(username, loginKey, opts)
        console.log('abcAccount logged in: ' + username)
        return abcAccount
      } catch (e) {
        console.log(e)
        return null
      }
    }
  } else {
    console.log('TouchIdNotSupportedError')
    return null
    // throw new Error('TouchIdNotSupportedError')
  }
}
