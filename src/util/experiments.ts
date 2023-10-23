import { lstrings } from '../common/locales/strings'
import { ExperimentConfig } from '../types/ReduxTypes'

export const getCreateAccountTextString = (
  experimentCfg: ExperimentConfig
): string => {
  const { createAccountText } = experimentCfg
  return createAccountText === 'signUp'
    ? lstrings.sign_up
    : createAccountText === 'getStarted'
    ? lstrings.get_started
    : lstrings.create_an_account
}
