import { EdgeAccount } from 'edge-core-js'

import { ChangeRecoveryParams } from '../components/scenes/existingAccout/ChangeRecoveryScene'
import { OtpRepairParams } from '../components/scenes/existingAccout/OtpRepairScene'
import { OtpErrorParams } from '../components/scenes/OtpErrorScene'
import { RecoveryLoginParams } from '../components/scenes/RecoveryLoginScene'
import { WaitParams } from '../components/scenes/WaitScene'

interface AccountParams {
  account: EdgeAccount
}

/**
 * Defines the acceptable route parameters for each scene key.
 */
export interface LoginParamList {
  changePassword: AccountParams
  changePin: AccountParams
  changeRecovery: ChangeRecoveryParams
  newAccountWelcome: {}
  newAccountUsername: {}
  newAccountPassword: {}
  newAccountPin: {}
  newAccountTos: {}
  newAccountWait: WaitParams
  newAccountReview: AccountParams
  landing: {}
  loading: {}
  otpError: OtpErrorParams
  otpRepair: OtpRepairParams
  passwordLogin: {}
  pinLogin: {}
  recoveryLogin: RecoveryLoginParams
  resecurePassword: AccountParams
  resecurePin: AccountParams
  securityAlert: AccountParams
}

/**
 * The `route` prop passed to each scene.
 */
export interface RouteProp<Name extends keyof LoginParamList> {
  name: Name
  params: LoginParamList[Name]
}

/**
 * The props passed to each scene.
 */
export interface SceneProps<Name extends keyof LoginParamList> {
  route: RouteProp<Name>
  // navigation: Use `dispatch` for now
}
