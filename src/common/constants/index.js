export * from './Colors'
export * from './Fonts'
export * from './Theme'
export * from './ErrorConstants'
export * from './IconConstants'
export * from './OtpConstants'

/* export const LEFT_TO_RIGHT = 'leftToRight'
export const RIGHT_TO_LEFT = 'rightToLeft'
export const NONE ='none'
export const FROM ='from'
export const TO ='to' */
export const ALWAYS = 'always'

export const WORKFLOW_FIRST_LOAD = 'firstLoadWF'
export const WORKFLOW_INIT = 'initalizeWF'
export const WORKFLOW_CREATE = 'createWF'
export const WORKFLOW_PASSWORD = 'passwordWF'
export const WORKFLOW_PIN = 'pinWF'

export const WORKFLOW_RECOVERY = 'recoveryWF'
export const WORKFLOW_FINGERPRINT = 'fingerprintWF'
export const WORKFLOW_OTP = 'otpWF'

export const WORKFLOW_START = 'workflowStart'
export const WORKFLOW_SKIP = 'workflowSkip'
export const WORKFLOW_LAUNCH_MODAL = 'workflowLaunchModal'
export const WORKFLOW_CANCEL_MODAL = 'workflowCancelSkip'
export const WORKFLOW_CANCEL_BETA_MODAL = 'cancelWorkflowBeta'
export const WORKFLOW_BACK = 'workflowBack'
export const WORKFLOW_CANCEL = 'workflowCancel'
export const WORKFLOW_NEXT = 'workflowNext'

// create actions
export const CREATE_UPDATE_USERNAME = 'createUpdateUsername'
export const CREATE_UPDATE_PIN = 'createUpdatePin'
export const LOG_IN_PIN = 'LOG_IN_PIN'
export const LOGIN_SUCCEESS = 'USERNAME_PASSWORD'
export const LOGIN_USERNAME_PASSWORD_FAIL = 'USERNAME_PASSWORD_FAIL'
export const CREATE_ACCOUNT_SUCCESS = 'CREATE_ACCOUNT_SUCCESS'
export const CREATE_ACCOUNT_FAIL = 'CREATE_ACCOUNT_FAIL'
export const ACCEPT_TERMS_CONDITIONS = 'acceptTermsAndConditions'
export const SET_PREVIOUS_USERS = 'SET_PREVIOUS_USERS'

// Login Actions
export const AUTH_UPDATE_USERNAME = 'authUpdateUsername'
export const AUTH_UPDATE_PASSWORD = 'authUpdatePassword'
export const AUTH_UPDATE_LOGIN_PASSWORD = 'authUpdateLoginPassword'
export const AUTH_UPDATE_CONFIRM_PASSWORD = 'authUpdatePasswordConfirm'
export const AUTH_UPDATE_PIN = 'authUpdatePin'
export const AUTH_LOGGING_IN_WITH_PIN = 'authLoggingInWithPin'
export const AUTH_UPDATE_OTP_BACKUP_KEY = 'authSetOtpBackupKey'
export const DELETE_USER_FROM_DEVICE = 'deleteUserFromDevice'

// Change Password Pin Actions =
export const LAUNCH_NOTIFICATION_MODAL = 'launchNotificationmodal'
export const CLOSE_NOTIFICATION_MODAL = 'closeNotificationmodal'

export const OTP_ERROR = 'otpError'

export const RESET_APP = 'resetApplication'

