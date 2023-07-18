export type TrackingEventName =
  // Password Login Scene Events
  | 'Login_Password_Create_Account'
  | 'Login_Password_Forgot_Password'

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
  | 'Signup_Username_Available'
  | 'Signup_Password_Valid'
  | 'Signup_PIN_Valid'
  | 'Signup_Terms_Agree_and_Create_User' // Also tracks errors in account creation
  | 'Signup_Review_Done'

  // To be deprecated
  | 'Signup_Create_Account'
  | 'Signup_Signin'
  | 'Signup_Welcome_Next'

export interface TrackingValues {
  error?: string
  lightAccount?: boolean
}

export function logEvent(
  event: TrackingEventName,
  values: TrackingValues = {}
) {
  // @ts-expect-error
  const { firebase } = global
  const { error, lightAccount } = values

  const params: any = {}
  if (error != null) params.error = error
  if (lightAccount != null) params.lightAccount = String(lightAccount)

  if (firebase != null) firebase.analytics().logEvent(event, params)
}
