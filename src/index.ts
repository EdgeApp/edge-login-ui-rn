import './util/androidFetch'

// ---------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------

export { LoginUiProvider } from './components/publicApi/LoginUiProvider'
export { ChangePasswordScreen } from './components/publicApi/ChangePasswordScreen'
export { ChangePinScreen } from './components/publicApi/ChangePinScreen'
export { UpgradeUsernameScreen } from './components/publicApi/UpgradeUsernameScreen'
export { PasswordRecoveryScreen } from './components/publicApi/ChangeRecoveryScreen'
export { LoginScreen } from './components/publicApi/LoginScreen'
export { OtpRepairScreen } from './components/publicApi/OtpRepairScreen'
export { SecurityAlertsScreen } from './components/publicApi/SecurityAlertsScreen'
export type {
  AppConfig,
  CreateAccountType,
  InitialRouteName,
  NotificationPermissionReminderOptions
} from './components/publicApi/publicTypes'

// ---------------------------------------------------------------------
// Post-login steps
// ---------------------------------------------------------------------

export { showNotificationPermissionReminder } from './util/notificationPermissionReminder'
export { showOtpReminder } from './util/otpReminder'
export {
  hasSecurityAlerts,
  watchSecurityAlerts
} from './util/hasSecurityAlerts'

// ---------------------------------------------------------------------
// Biometric utilities
// ---------------------------------------------------------------------

export {
  disableTouchId,
  enableTouchId,
  isTouchEnabled,
  getSupportedBiometryType
} from './keychain'
