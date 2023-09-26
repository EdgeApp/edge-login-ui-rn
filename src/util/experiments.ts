import s from '../common/locales/strings'
import { ExperimentConfig } from '../types/ReduxTypes'

export const getExperimentVal = <T extends keyof ExperimentConfig>(
  experimentCfg: ExperimentConfig | undefined,
  key: T,
  defaultVal: ExperimentConfig[T]
): ExperimentConfig[T] => {
  return experimentCfg && experimentCfg[key] ? experimentCfg[key] : defaultVal
}

export const getCreateAccountText = (
  experimentCfg: ExperimentConfig | undefined
): string => {
  const createAccTextVar = getExperimentVal(
    experimentCfg,
    'createAccountText',
    'createAccount'
  )
  return createAccTextVar === 'signUp'
    ? s.strings.sign_up
    : createAccTextVar === 'getStarted'
    ? s.strings.get_started
    : s.strings.create_an_account
}
