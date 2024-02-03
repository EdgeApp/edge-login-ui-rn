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
