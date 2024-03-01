import { asObject, asOptional, asValue } from 'cleaners'
import { EdgeAccount } from 'edge-core-js'

export type InitialRouteName =
  | 'login'
  | 'login-password'
  | 'login-password-light'
  | 'new-account'
  | 'new-light-account'

export type CreateAccountType = 'full' | 'light'

/**
 * Subset of AppConfig from https://github.com/EdgeApp/edge-react-gui/blob/develop/src/types/types.ts
 * This MUST always maintain as a subset
 */
export interface AppConfig {
  // appId?: string
  // appName: string
  // appNameShort: string
  // appStore: string
  // configName: string
  // darkTheme: Theme
  // defaultWallets: string[]
  // knowledgeBase: string
  // lightTheme: Theme
  // notificationServers: string[]
  // phoneNumber: string
  // referralServers?: string[]
  // supportsEdgeLogin: boolean
  // supportEmail: string
  // supportSite: string
  termsOfServiceSite: string
  // website: string
}

export interface NotificationOptIns {
  ignoreMarketing: boolean
  ignorePriceChanges: boolean
}

export interface NotificationPermissionsInfo {
  isNotificationBlocked: boolean
  notificationOptIns: NotificationOptIns
}

export interface NotificationPermissionReminderOptions {
  readonly appName?: string
  readonly onLogEvent?: OnLogEvent
  readonly onNotificationPermit?: OnNotificationPermit
}

/**
 * @deprecated This will not be provided in `fastLogin` mode.
 * Use `getSupportedBiometryType` and `touchIdEnabled` to learn these values.
 */
export interface TouchIdInfo {
  isTouchSupported: boolean
  isTouchEnabled: boolean
}

export interface ExperimentConfig {
  createAccountType: CreateAccountType
  signupCaptcha: 'withCaptcha' | 'withoutCaptcha'
}

export const asExperimentConfig = asObject<ExperimentConfig>({
  createAccountType: asOptional(asValue('light', 'full'), 'full'),
  signupCaptcha: asOptional(
    asValue('withCaptcha', 'withoutCaptcha'),
    'withoutCaptcha'
  )
})

export type TrackingEventName =
  // Password Login Scene Events
  | 'Password_Login_Create_Account'
  | 'Password_Login_Forgot_Password'
  | 'Pasword_Login'

  // Permissions Modal Events (only the response to the modal, not the actual
  // resulting notification permission status)
  | 'Permission_Modal_Notification_Enable'
  | 'Permission_Modal_Notification_Dismiss'

  // Pin Login Scene Events
  | 'Pin_Login'

  // Recovery Events
  | 'Recovery_Token_Submit'
  | 'Recovery_Username_Failure'
  | 'Recovery_Username_Success'

  // Light Account Upgrade Flow
  | 'Backup_Username_Available'
  | 'Backup_Password_Valid'
  | 'Backup_Terms_Agree_and_Create_User' // Also tracks errors in account creation
  | 'Backup_Review_Done'

  // Regular/Light Account Creation Flow
  | 'Signup_Captcha_Failed'
  | 'Signup_Captcha_Passed'
  | 'Signup_Captcha_Shown'
  | 'Signup_Captcha_Quit'
  | 'Signup_Username_Available'
  | 'Signup_Password_Valid'
  | 'Signup_PIN_Valid'
  | 'Signup_Terms_Agree_and_Create_User' // Full accounts only. Also tracks errors in account creation
  | 'Signup_Create_Light_Account' // Light accounts only. Also tracks errors in account creation
  | 'Signup_Review_Done'

  // To be deprecated
  | 'Signup_Create_Account'
  | 'Signup_Signin'
  | 'Signup_Welcome_Next'

export interface TrackingValues {
  error?: unknown | string
}

export type OnComplete = () => void

export type OnLogin = (
  account: EdgeAccount,

  /**
   * @deprecated This will not be provided in `fastLogin` mode
   * Use `getSupportedBiometryType` and `touchIdEnabled` to learn these values.
   */
  touchIdInfo?: TouchIdInfo
) => void

export type OnNotificationPermit = (
  settings: NotificationPermissionsInfo
) => void

export type OnLogEvent = (
  event: TrackingEventName,
  values?: TrackingValues
) => void
