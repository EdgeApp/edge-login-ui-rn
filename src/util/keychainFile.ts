import {
  asArray,
  asEither,
  asJSON,
  asMaybe,
  asObject,
  asOptional,
  asString,
  asValue,
  uncleaner
} from 'cleaners'
import { makeReactNativeDisklet } from 'disklet'
import { EdgeAccount, EdgeUserInfo } from 'edge-core-js'

/**
 * A row in the upgraded keychain status file.
 * If a login exists in this file,
 * biometric login is either enabled or disabled.
 * If we haven't made a decision, the login won't be in the file.
 */
export interface KeychainInfo {
  /**
   * The location where the secret is stored, if login is enabled.
   * False if the user has disabled biometric login.
   */
  key: string | false

  // We will have one or the other of these, but not both:
  loginId?: string // base58
  username?: string
}

/**
 * Looks up a login's status.
 * Returns the location where the secret is stored, false if disabled,
 * or undefined if we have no information about the user.
 */
export function getKeychainStatus(
  file: KeychainInfo[],
  account: EdgeAccount | EdgeUserInfo
): string | false | undefined {
  const row = file.find(row => {
    const accountLoginId =
      'rootLoginId' in account ? account.rootLoginId : account.loginId
    if (row.loginId === accountLoginId) return true
    if (row.username === account.username) return true
    return false
  })
  return row?.key
}

/**
 * Changes a login's status on disk.
 * If a login is enabled, pass the key where the secret is stored.
 * If a login is disabled, pass 'false'.
 * To forget a login, pass `undefined`.
 */
export async function saveKeychainStatus(
  file: KeychainInfo[],
  account: EdgeAccount,
  status: string | false | undefined
): Promise<void> {
  const newRows = file.filter(row => {
    if (row.loginId === account.rootLoginId) return false
    if (row.username === account.username) return false
    return true
  })

  if (status != null) {
    newRows.unshift({
      loginId: account.rootLoginId,
      key: status
    })
  }

  const text = wasKeychainFile({ logins: newRows })
  await disklet.setText('fingerprint.json', text)
}

/**
 * Reads all saved login statuses from disk.
 */
export async function readKeychainFile(): Promise<KeychainInfo[]> {
  try {
    const json = await disklet.getText('fingerprint.json')

    const clean = asMaybeKeychainFile(json)
    if (clean != null) return clean.logins

    const legacy = asLegacyKeychainFile(json)
    const out: KeychainInfo[] = []
    for (const username of legacy.enabledUsers) {
      out.push({
        key: username + '___key_loginkey',
        username
      })
    }
    for (const username of legacy.disabledUsers) {
      out.push({
        key: false,
        username
      })
    }
    return out
  } catch (error) {
    return []
  }
}

const disklet = makeReactNativeDisklet()

const asFalse = asValue(false)

const asLegacyKeychainFile = asJSON(
  asObject({
    enabledUsers: asOptional(asArray(asString), []),
    disabledUsers: asOptional(asArray(asString), [])
  })
)

const asKeychainFile = asJSON(
  asObject({
    logins: asArray(
      asObject<KeychainInfo>({
        key: asEither(asString, asFalse),
        loginId: asOptional(asString), // base58
        username: asOptional(asString)
      })
    )
  })
)
const asMaybeKeychainFile = asMaybe(asKeychainFile)
const wasKeychainFile = uncleaner(asKeychainFile)
