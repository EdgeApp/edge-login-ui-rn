export type TrackingEventName =
  | 'Login_Password_Forgot_Password'
  | 'Signup_Create_Account'
  | 'Signup_Create_User_Success'
  | 'Signup_Password_Valid'
  | 'Signup_Review_Done'
  | 'Signup_Terms_Agree_and_Create_User'
  | 'Signup_Username_Available'
  | 'Signup_Username_Unavailable'
  | 'Signup_Welcome_Next'

export function logEvent(event: TrackingEventName) {
  // @ts-expect-error
  const { firebase } = global
  if (firebase != null) firebase.analytics().logEvent(event)
}
