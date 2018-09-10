// @flow
const strings = {
  login_button: 'Login',
  username: 'Username',
  password: 'Password',
  pin: 'PIN',
  back_caps: 'BACK',
  back: 'Back',
  forgot_password: 'Forgot Password',
  create_an_account: 'Create an Account', // 'Forgot Password' is capitalized, making consistent
  initiate_password_recovery:
    'To recover your password, you must have setup password recovery prior. Please find the recovery email you sent yourself and click on the link from this device.',
  choose_recovery_question: 'Choose recovery question',
  submit: 'Submit',
  save: 'Save',
  disable: 'Disable',
  disable_password_recovery: 'Disable Password Recovery',
  show_password: 'Show Password',
  password_changed: 'Password Changed',
  pwd_change_success: 'Password Successfully Changed',
  pwd_change_modal:
    'DO NOT FORGET YOUR PASSWORD OR RECOVERY ANSWERS! THEY CANNOT BE RECOVERED!',
  backup_key_label: 'Backup Key',
  ok: 'OK',
  or: 'OR',
  exit: 'Exit',
  exit_pin: 'Exit PIN', // nothing should be all-caps
  next_label: 'Next',
  next_label_caps: 'NEXT',
  delete: 'Delete',
  done: 'Done',
  skip: 'SKIP',
  done_caps: 'DONE',
  cancel: 'Cancel',
  cancel_caps: 'CANCEL',
  change_password: 'Change Password',
  change_pin: 'Change PIN',
  pin_changed: 'PIN Changed',
  delete_account: 'Delete Account?',
  pin_successfully_changed: 'PIN Successfully Changed',
  delete_account_header: 'Delete Account',
  delete_username_account:
    'Delete %1$s on this device? This will disable access via PIN. If 2FA is enabled on this account, this device will not be able to login without a 2FA reset which takes 7 days.',
  disable_otp_header: 'Are you sure you want to disable 2FA',
  disable_otp_modal_body:
    '2FA will take 7 days to disable if no action is taken by the account user on authentiacated devices',
  disable_otp_button: 'Disable 2FA',
  send_email_error_header: "Can't send email",
  email_error_modal:
    "Please set up an email client that is default to your device's OS in order to send a token to yourself",
  password_recovery: 'Password Recovery',
  otp_auth_code_header: 'Enter Authentication Code',
  save_recovery_token: 'Save recovery token',
  skip_modal_header: 'Are you sure you want to skip?',
  skip_modal_body:
    'Without a password, you will not be able to login on a new device if this device is lost or stolen, or if this app is uninstalled.',
  must_ten_characters: 'Must have at least 10 characters',
  must_one_lowercase: 'Must have at least 1 lowercase letter',
  must_one_uppercase: 'Must have at least 1 uppercase letter',
  must_one_number: 'Must have at least 1 number',
  terms_one:
    'I understand that my funds are held securely on this device, not by Edge',
  terms_two:
    'I understand that if I lose this device or uninstall the app, my digital assets can only be recovered with my username and password',
  terms_three:
    'I understand that if I lose my username and password, Edge will not be able to recover my account, unless I setup password recovery',
  step_one: 'Step 1/3', // title of scene
  step_two: 'Step 2/3', // title of scene
  step_three: 'Step 3/3', // title of scene
  choose_title_username: 'Choose a Username', // title of scene
  choose_title_password: 'Set a Password', // title of scene
  set_four_digit_pin: 'Set a 4-digit PIN ',
  create_your_account: 'Creating Your Account', // title of scene
  write_it_down: 'Write It Down', // Is this smaller green title even necessary?
  quick_review: 'Quick Review',
  recovery: 'Recovery',
  account_confirmation: 'Account Confirmation', // title should be regular capitalization, not all uppercase
  otp_header: 'Two Factor Authentication',
  recovery_questions_header: 'Recovery Questions',
  account_info_warning:
    'You did not set your password. We strongly encourage you to create a password and backup your account as soon as possible. You can set a password in the Settings screen in the app.',
  show_account_info: 'Show account information',
  hide_account_info: 'Hide account information',
  password_successfully_changed:
    'Password Successfully Changed. DO NOT FORGET YOUR PASSWORD OR RECOVERY ANSWERS! THEY CANNOT BE RECOVERED!',
  otp_hero_scan:
    'Scan the QR code below using the device that enabled 2FA to give access to the device',
  password_desc: 'The password is used to login and change sensitive settings',
  re_enter_new_password: 'Re-enter New Password',
  new_password: 'New Password',
  pswd_and_pin_changed: 'Password and PIN successfully changed.',
  change_pwd_body:
    "Don't forget your password or recovery answers. You will permanently lose access to your funds if you lose your password and recovery answers.",
  pin_desc:
    'Your PIN is a 4 digit code used to do quick re-logins into your account',
  recovery_successful:
    'Recovery successful! Please change your password and PIN.',
  recover_by_username:
    'Please enter the username of the account you want to recover.',
  your_answer_label: 'Your Answer',
  answer_case_sensitive: 'Answers are case sensitive',
  answers_four_chanracters: 'Answers should be minimum of 4 characters',
  otp_dispable_req_sent:
    "2FA disable request has been sent. You'll be able to login with your username and password after 7 days.",
  otp_instructions:
    'Sign into your account using the device you setup 2FA with, and go to Settings > 2 Factor Authentication to find the code.',
  disable_otp_button_two: 'Disable 2 Factor Authentication',
  type_auth_button: 'Type in authentication code instead',
  otp_email_body:
    'Please click the link below from a mobile device with Edge installed to initiate account recovery for username ',
  otp_email_subject: 'Edge Recovery Token',
  recovery_disabled:
    'Password Recovery has been disabled. You can enable it again by going into Password Recovery anytime',
  recovery_what_account:
    'Please enter the username of the account you want to recover.',
  email_address: 'Email Address',
  recovery_instructions_complete:
    'To complete account recovery setup you MUST save an account recovery token. This will be required to recover your account in addition to your username and recovery answers. \n\n Please enter your email below to send yourself a recovery token.',
  read_understod: 'I have read, understood, and agree to the Terms of Use',
  last_step_review: 'Last step! Let’s finish with a quick review',
  confirm_finish: 'Confirm & Finish',
  welcome_one:
    "Let's get started by creating your account login. You’ll choose a username and password, which we’ll use to encrypt your account. Not even Edge has access to your information, so you have full and complete control over your digital assets.",
  start_username: 'Let’s get started with choosing a username',
  get_started: 'Get Started', // button title, not a complete sentence so capitalize first letters
  encrypting: 'Doing the encryption',
  username_desc:
    'Your username will be required to sign in to your Edge account on this and other devices.',
  almost_done: "Almost done! Let's write down your account information",
  warning_message:
    'If you lose your account information, you’ll lose access to your funds permanently. Write down and store it securely.',
  good_job: 'Good job!',
  hang_tight: 'Hang tight while we create',
  secure_account: 'and secure your account',
  encrypting_wallet: 'Encrypting wallet...',
  unexpected_end_of_data: 'Not enough characters in field',
  confirm_recovery_questions: 'Confirm Recovery',
  login_with_password: 'Login with password',
  landing_tagline:
    'The secure and easy to use wallet for your blockchain assets and tokens',
  landing_create_account_button: 'Create account',
  landing_already_have_account: 'Already have an account? Sign in',
  pin_not_enabled: 'PIN is not enabled for this account',
  invalid_pin: 'Invalid PIN',
  account_locked_for: 'Account locked for \n%1$s more seconds',
  otp_modal_reset_headline: '2FA Reset Requested',
  otp_modal_reset_body:
    'URGENT: 2FA reset has been requested by another device for the following accounts:\n %1$s\n\nIf you did not request a 2FA reset, please go to Settings -> 2 Factor and click Keep 2FA. Then change your password.'
}

module.exports = strings
