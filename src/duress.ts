import { asBoolean, asMaybe, asObject, asOptional, asString } from 'cleaners'
import { makeReactNativeDisklet } from 'disklet'

/**
 * Duress functionality is enabled by setting a pin and username. However
 * that doesn't mean the user is in duress mode.
 *
 * User is in duress mode if duressModeOn is true. If so, force login into
 * duress account and remove visibility of all other accounts. The account
 * that was currently displayed is set to duressDisplayUsername and is
 * used whenever a username needs to be displayed in the app or login ui.
 *
 * The only way to turn off duress mode is to enter the correct PIN of the
 * duressDisplayUsername.
 */

interface DuressSettings {
  duressPin?: string
  duressUsername?: string
  duressModeOn?: boolean
  duressDisplayUsername?: string
  duressDisplayLoginId?: string
}

const asDuressSettings = asMaybe<DuressSettings>(
  asObject({
    duressPin: asOptional(asString),
    duressUsername: asOptional(asString),
    duressModeOn: asOptional(asBoolean),
    duressDisplayUsername: asOptional(asString),
    duressDisplayLoginId: asOptional(asString)
  }),
  {
    duressPin: undefined,
    duressUsername: undefined,
    duressModeOn: undefined,
    duressDisplayUsername: undefined,
    duressDisplayLoginId: undefined
  }
)

const DURESS_SETTINGS_FILE = 'duressSettings.json'
const disklet = makeReactNativeDisklet()

let duressSettings: DuressSettings | undefined

export const initDuress = async (): Promise<void> => {
  const text = await disklet.getText(DURESS_SETTINGS_FILE).catch(e => {
    console.log('initDuress error:', String(e))
    console.log('No duress settings file found')
    return '{}'
  })
  console.log('initDuress text:', text)
  duressSettings = asDuressSettings(JSON.parse(text))
  console.log('initDuress')
  console.log(JSON.stringify(duressSettings,null,2))
}

export const setDuressSettings = async (
  params: DuressSettings
): Promise<void> => {
  if (duressSettings === undefined) {
    throw new Error('Must call initDuress first')
  }
  duressSettings = {
    ...duressSettings,
    ...params
  }
  console.log('setDuressSettings')
  console.log(JSON.stringify(duressSettings,null,2))
  await disklet.setText(DURESS_SETTINGS_FILE, JSON.stringify(duressSettings))
}

export const getDuressSettings = (): DuressSettings => {
  if (duressSettings === undefined) {
    throw new Error('Must call initDuress first')
  }
  console.log('getDuressSettings')
  console.log(JSON.stringify(duressSettings,null,2))
  return duressSettings
}
