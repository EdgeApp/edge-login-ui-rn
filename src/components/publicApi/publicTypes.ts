import { asObject } from 'cleaners'
import { EdgeAccount } from 'edge-core-js'

export type BiometryType = 'FaceID' | 'TouchID' | false

export type InitialRouteName =
  | 'login'
  | 'login-password'
  /** @deprecated - No longer used. Same behavior as login-password. */
  | 'login-password-light'
  | 'new-account'
  | 'new-light-account'

/** @deprecated - No longer used. Light/full account experiment concluded in
 * favor of light account. */
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

//
// Notification Permission
//

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

//
// Experiment Config
//

export interface ExperimentConfig {}

export const asExperimentConfig = asObject<ExperimentConfig>({})

//
// Performance Events
//

export type PerfEvent =
  // Password Login Events
  | { name: 'passwordLoginBegin' }
  | { name: 'passwordLoginEnd'; error?: unknown }
  // Pin Login Events
  | { name: 'pinLoginBegin' }
  | { name: 'pinLoginEnd'; error?: unknown }

//
// Tracking Event Types (aka Log Events)
//

export type TrackingEventName =
  // Password Login Scene Events
  | 'Password_Login_Create_Account'
  | 'Password_Login_Forgot_Password'
  | 'Pasword_Login'

  // Permissions Modal Events (only the response to the modal, not the actual
  // resulting notification permission status)
  | 'Permission_Modal_Notification_Enable'

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

//
// Callbacks
//

export type OnComplete = () => void

export type OnLogEvent = (
  event: TrackingEventName,
  values?: TrackingValues
) => void

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

export type OnPerfEvent = (event: PerfEvent) => void
