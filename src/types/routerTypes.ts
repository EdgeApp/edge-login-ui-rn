import {
  ChangePasswordParams,
  NewAccountPasswordParams,
  ResecurePasswordParams,
  UpgradePasswordParams
} from '../components/scenes/ChangePasswordScene'
import {
  ChangePinParams,
  NewAccountPinParams,
  ResecurePinParams
} from '../components/scenes/ChangePinScene'
import { ChangeRecoveryParams } from '../components/scenes/existingAccout/ChangeRecoveryScene'
import { OtpRepairParams } from '../components/scenes/existingAccout/OtpRepairScene'
import { SecurityAlertParams } from '../components/scenes/existingAccout/SecurityAlertsScene'
import {
  NewAccountReviewParams,
  UpgradeAccountReviewParams
} from '../components/scenes/newAccount/NewAccountReviewScene'
import {
  NewAccountTosParams,
  UpgradeTosParams
} from '../components/scenes/newAccount/NewAccountTosScene'
import {
  NewAccountUsernameParams,
  UpgradeUsernameParams
} from '../components/scenes/newAccount/NewAccountUsernameScene'
import { OtpErrorParams } from '../components/scenes/OtpErrorScene'
import { PasswordLoginParams } from '../components/scenes/PasswordLoginScene'
import { PinLoginParams } from '../components/scenes/PinLoginScene'
import { RecoveryLoginParams } from '../components/scenes/RecoveryLoginScene'
import { NewAccountWaitParams } from '../components/scenes/WaitScene'

/**
 * Defines the acceptable route parameters for each scene key.
 */
export interface LoginParamList {
  changePassword: ChangePasswordParams
  changePin: ChangePinParams
  changeRecovery: ChangeRecoveryParams
  newAccountWelcome: {}
  newAccountUsername: NewAccountUsernameParams
  newAccountPassword: NewAccountPasswordParams
  newAccountPin: NewAccountPinParams
  newAccountTos: NewAccountTosParams
  newAccountWait: NewAccountWaitParams
  newAccountReview: NewAccountReviewParams
  upgradeUsername: UpgradeUsernameParams
  upgradePassword: UpgradePasswordParams
  upgradeTos: UpgradeTosParams
  upgradeAccountReview: UpgradeAccountReviewParams
  landing: {}
  loading: {}
  otpError: OtpErrorParams
  otpRepair: OtpRepairParams
  passwordLogin: PasswordLoginParams
  pinLogin: PinLoginParams
  recoveryLogin: RecoveryLoginParams
  resecurePassword: ResecurePasswordParams
  resecurePin: ResecurePinParams
  securityAlert: SecurityAlertParams
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
