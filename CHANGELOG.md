# edge-login-ui-rn

## Unreleased

## 3.2.0 (2024-01-22)

- added: react-native-haptic-feedback
- changed: Update buttons, modals, and cards to their edge-react-gui UI4 counterparts
- changed: "Get Started" -> "Create Account" on the Password Login Scene
- fixed: New password scene showing blank error message

## 3.1.2 (2024-01-19)

- fixed: Copy text-input visual improvements from edge-react-gui.

## 3.1.1 (2024-01-16)

- fixed: Correctly save the PIN when creating a light account.

## 3.1.0 (2024-01-11)

- changed: Replaced OutlinedTextInput with FilledTextInput and SimpleTextInput

## 3.0.0 (2024-01-09)

- removed: No longer render scene backgrounds. The app background shows through now and therefore parent app needs to provide background.

## 2.20.0 (2024-01-04)

- added: Enter/exit/layout animations
- fixed: Excessive margins
- fixed: Password login scene transitions
- fixed: Choose PIN scene so Next button is immediately tappable (keyboardShouldPersistTaps)

## 2.19.0 (2023-12-21)

- removed: Terms of Service scene from light account creation flow
- added: New 'Signup_Create_Light_Account' analytics event specific to light account creation success

## 2.18.0 (2023-12-06)

- changed: 'Create Account' button text always set to "Get Started"

## 2.17.3 (2023-11-14)

- fixed: Do not perform a double-login when using the QR modal on the OTP error scene.
- fixed: Handle CAPTCHA errors in the OTP backup-code modal.

## 2.17.2 (2023-11-13)

- fixed: Always show the notifications permission modal after all login/sign-up methods.

## 2.17.1 (2023-11-06)

- fixed: Correctly request permissions on Android 13 or higher.
- fixed: Show the permission notification reminder on the password login scene.

## 2.17.0 (2023-11-02)

- added: Add skipOtpReminder for testing

## 2.16.0 (2023-10-30)

- fixed: Search box incorrectly showing in Password recovery questions modal
- changed: ListModal props updated: `textInput`->`hideSearch`

## 2.15.0 (2023-10-23)

- added: Signup captcha experiment.

## 2.14.1 (2023-10-06)

- fixed: Revert the `RadioListModal` to the previous working state.

## 2.14.0 (2023-10-03)

- changed: Update modals to be in sync with their GUI counterparts

## 2.13.2 (2023-10-02)

- fixed: Password login scene back button when on legacy landing variant

## 2.13.1 (2023-09-25)

- fixed: Unintended breaking API changes from 2.13.0

## 2.13.0 (2023-09-25)

- added: 'Create Account' button text experiment

## 2.12.0 (2023-09-25)

- removed: Redundant tracking implementation

## 2.11.1 (2023-09-20)

- fixed: Clean up error handling, particularly for incorrect CAPTCHA solutions.
- fixed: Remove visual glitches in the CAPTCHA modal.

## 2.11.0 (2023-09-20)

- changed: Update translations
- removed: Redundant recovery question

## 2.10.0 (2023-09-13)

- added: Show a CAPTCHA modal when the core returns a `ChallengeError` for password login.

## 2.9.1 (2023-09-05)

- fixed: Testability of "Enter Backup Code" modal tile

## 2.9.0 (2023-08-30)

- changed: Remove the Account Review Scene from Light Account creation flow

## 2.8.1 (2023-08-30)

- fixed: Always show the username in PIN login scene

## 2.8.0 (2023-08-28)

- changed: Hide "No Username" in the PIN login scene
- changed: Update translations

## 2.7.0 (2023-08-11)

- added: Tracking event for logins
- changed: Update translations

## 2.6.6 (2023-08-03)

- changed: Update translations

## 2.6.5 (2023-07-30)

- fixed: Correctly handle errors during account creation.
- fixed: Allow biometric logins for light accounts.

## 2.6.4 (2023-07-28)

- changed: Update password login to allow configurable account creation options

## 2.6.3 (2023-07-26)

- fixed: Don't clear modals upon unmounting UpgradeUsernameScreen
- changed: Update translations

## 2.6.2 (2023-07-25)

- fixed: Stop returning the incorrect keychain data for light accounts.
- fixed: Update the wording on the new light account PIN scene, since there is no password.
- fixed: Update the terms & conditions wording for light accounts, which have no password.

## 2.6.1 (2023-07-24)

- fixed: Reinstate login screen back button, conditionalize light username-less vs full account creation

## 2.6.0 (2023-07-21)

- added: Accept an `initialLoginId` prop for the `LoginScreen`. Use this to select the initial user.
- deprecated: The `username` prop for the `LoginScreen`. Use `initialLoginId` instead.

## 2.5.2 (2023-07-20)

- fixed: Enable the username dropdown for > 0 saved users on the password login scene
- fixed: Password login scene user list dropdown fade covering last entry
- fixed: Unnecessary scene scrolling in password login scene

## 2.5.1 (2023-07-18)

- fixed: Add missing gradient in Password Login Scene scrollable list
- fixed: Allow text wrapping in PIN Login Scene account dropdown list
- changed: Update translations

## 2.5.0 (2023-07-17)

- changed: Upgrade to edge-core-js v1.3.2.
- changed: Support for username-less (light) account.

## 2.4.2 (2023-07-14)

- fixed: Correctly handle username deletion on the PIN scene.

## 2.4.1 (2023-07-11)

- fixed: Maestro testing targetability of components

## 2.4.0 (2023-07-10)

- changed: Update password login scene to use themed text input
- fixed: Password login scene errors were not localized
- changed: Allow biometric logins for accounts without usernames.

## 2.3.3 (2023-07-07)

- fixed: Modal close button covering modal submit buttons while Android keyboard is open
- fixed: Username availability check error would incorrectly show in some cases

## 2.3.2 (2023-07-05)

- fixed: Modal close button overlapping submit button in PW Recovery modal

## 2.3.1 (2023-07-03)

- fixed: Allow pressing modal buttons without dismissing the keyboard.
- fixed: Remove an extra close button from the security alerts modal.
- changed: Simplify the create-account flow internals.

## 2.3.0 (2023-06-26)

- changed: Update the Android gradle build file.
- fixed: Sometimes the username availability check mis-reports availability status

## 2.2.0 (2023-06-09)

- added: Add an `appconfig` prop to `LoginScreen`.
- changed: Update routing behavior when `onComplete` is not passed to `LoginScreen`.
- changed: Give scrolling modals a bottom fade-out effect.
- changed: Make the QR login modal and text input modals scrollable.
- changed: Allow the PIN scene to log into username-less accounts.
- removed: Remove OTP support for PIN logins. The login server will never return OTP errors for PIN logins, so this capability is not needed.

## 2.1.0 (2023-06-06)

- added: Validate that the recovery key is valid base58 before submitting the modal.
- changed: Simplify internal redux and routing logic.
- fixed: Disable keyboard "next" button if the new-account username has not yet been checked for availability.

## 2.0.0 (2023-06-01)

- changed: Upgrade to edge-core-js v1.0.0. Earlier versions will not work.
- changed: Adjust `isTouchEnabled` to take an `EdgeAccount` instead of a username.

## 1.5.0 (2023-06-12)

- added: Ability to pass AppConfig to LoginScreen with termsOfServiceSite
- added: Allow onComplete prop to LoginScreen to be optional

## 1.4.7 (2023-05-22)

- added: Accessibility hints to logo and button

## 1.4.6 (2023-05-02)

- Fixed: Background brand image handling and display.

## 1.4.5 (2023-04-21)

- Changed: Reword IP OTP warning text

## 1.4.4 (2023-04-19)

- fixed: Broken 'Confirm and Email' Recovery setup button

## 1.4.3 (2023-04-14)

- added: OutlinedTextInput prop allowing user edits while spinner is active
- changed: Reduce delay for checking username availability to 400ms
- fixed: Add missing mount check to the first setState in the timeout to check username availability
- fixed: Back on `NewAccountPinScene`
- fixed: New account username input defocuses when auto-checking for availability
- fixed: Username persistence on back button
- removed: Too much space above brand image on `PinLoginScene`

## 1.4.2 (2023-04-11)

- fixed: Reinstate onComplete handling from 1.3
- changed: Update translations

## 1.4.1 (2023-04-11)

- fixed: Calculation of minLength for legacy recovery questions in login scene

## 1.4.0 (2023-04-11)

- fixed: Calculation of minLength for legacy recovery questions

## 1.3.1 (2023-04-11)

- changed: Move "Security Alerts" notification prompt to after account creation is completed
- changed: Update username availability check to be on a per-character-input basis

## 1.3.0 (2023-04-10)

- added: Add an onComplete prop to the LoginScene component
- changed: Add a back button to the `PasswordLoginScene`
- changed: Move Help button to the top-right corner for all scenes

## 1.2.4 (2023-04-11)

- fixed: Calculation of minLength for legacy recovery questions in login scene

## 1.2.3 (2023-04-11)

- fixed: Calculation of minLength for legacy recovery questions

## 1.2.2 (2023-03-20)

- changed: Change `'new-account'` value for `initialRoute` prop to route to the username screen
- changed: Updated password description verbaige

## 1.2.1 (2023-03-15)

- changed: Don't require showing acct creds to continue acct creation
- changed: Change wording to not require writing down password on acct creation

## 1.2.0 (2023-03-10)

- fixed: Missing back button on password recovery login

## 1.1.0 (2023-03-09)

- added: `PublicLoginScreen` takes a `initialRoute` prop to allow for control over the scene that it will initially show

## 1.0.0 (2023-03-03)

- added: Accessibility hint to Edge logo
- fixed: Safe area for iPhone 14+

## 0.11.0 (2023-02-13)

- added: Depend on the native `@react-native-community/datetimepicker` library, which must be installed manually.
- changed: Re-theme the recovery login scenes to match the rest of the app.
- removed: Scene components no longer accept a `showHeader` prop. With the final scene being themed, this prop no longer does anything.

## 0.10.21 (2023-02-10)

- changed: Re-format the new-account username screen to work better on small screens.

## 0.10.20 (2023-01-06)

- added: Instructions to Terms of Use
- added: Conversion event tracking to login and account creation

## 0.10.19 (2023-1-18)

- changed: Orient background gradient using Theme

## 0.10.18 (2023-1-10)

- added: A new RequestPermissionsModal with toggles to opt-in for marketing and/or price notifications.

## 0.10.17 (2022-12-20)

- fixed: Add flexGrow to username dropdown in PasswordLoginScene

## 0.10.16 (2022-12-16)

- fixed: No longer allow a user to bypass password requirements with an empty password

## 0.10.15 (2022-12-14)

- Add warning message to change password modal

## 0.10.14 (2022-11-15)

- Update password error display rules
- Conditionally show character limit counter in password input field
- Update translations

## 0.10.12 (2022-10-31)

- Increase touch area of password login screen dropdown button

## 0.10.11 (2022-10-19)

- Allow Powered By icon to be disabled by info server

## 0.10.10 (2022-10-03)

- Fix password submit handling on `ChangePasswordScene`

## 0.10.9 (2022-09-21)

- Add a spinner to `ChangePasswordSceneComponent` to prevent double submission

## 0.10.8 (2022-09-05)

- Fix off center alert error text
- Enforce 100 character max password length
- Fix >4 digit pin length
- Update translations

## 0.10.7 (2022-07-12)

- changed: Update forget account description text

## 0.10.6 (2022-07-08)

- changed: Update PIN description text

## 0.10.5 (2022-07-08)

- changed: Add titles for resecure password/pin scenes
- changed: Add SKIP button for resecure password and pin scenes

## 0.10.4 (2022-07-05)

- changed: Move this library to its own Git repository.
- fixed: Correctly document the native dependencies this library requires.
- fixed: Automatically update the user list when it changes.
- removed: No longer depend on @react-native-community/art.

## 0.10.3 (2022-06-29)

- rn: Create a UI2 ChangePinScene and reuse it for creating, changing and resecuring the pin code
- rn: Create a UI2 ChangePasswordScene and reuse it for creating, changing and resecuring the password
- rn: Sync password eyes
- rn: remove unused strings
- rn: remove unused redux states
- rn: Update "react-redux" to version 7.2.4
- rn: Add properly typed redux hooks
- rn: Add the useHandler hook from edge-react-gui

## 0.10.2 (2022-05-26)

- rn: Accept Branding props in OtpRepairScreen and PasswordRecoveryScreen to populate appName

## 0.10.1 (2022-05-20)

- rn: Fix the pin-login error message height

## 0.10.0 (2022-05-02)

- rn: Allow passing a Theme object to the LoginUiProvider to provide custom theming of colors and fonts.
- rn: Remove hardcoded uses of "Edge" and use appName parameter
- rn: Upgrade to cleaners 0.3.12
- rn: Upgrade Airship to 0.2.9
- rn: Add dependency on react-native-svg which needs to be installed in parent application
- rn: Fix incorrect logic for when Notification and Background App Refresh permissions as requested

## 0.9.32 (2022-04-19)

- rn: Add show/hide toggle to password fields
- rn: Replace safe loader gif
- rn: Various visual fixes

## 0.9.31 (2022-03-28)

- rn: Remove allowFontScaling from text components

## 0.9.30 (2022-03-08)

- rn: Update dependency of react-native-keyboard-aware-scroll-view to 0.9.5 to fix an issue with react-native >= 0.65

## 0.9.29 (2022-01-11)

- Update dependencies to use 'https://' instead of 'git://'

## 0.9.28 (2021-12-01)

- rn: Tweak header spacing again

## 0.9.27 (2021-11-30)

- rn: Fix header spacing

## 0.9.26 (2021-11-22)

- rn: Fix tarball

## 0.9.25 (2021-11-22)

- rn: Fix tarball

## 0.9.24 (2021-11-22)

- rn: Various minor fixes for account creation process

## 0.9.23 (2021-11-17)

- rn: Various visual fixes for account creation process
- rn: Upgrade sha3 to v2.1.4
- rn: Upgrade react-native-patina to v0.1.6

## 0.9.22 (2021-11-02)

- rn: Refactor Create Cccount scenes to use common components
- rn: Update Create Account scene headers
- rn: Dismiss keyboard when showing the QR modal
- rn: Standardize button text to regular with thinner borders

## 0.9.21 (2021-10-20)

- rn: changed: Match the edge-react-gui button style more closely.
- rn: fixed: Use the passed-in font on all scenes.

## 0.9.20 (2021-09-27)

- rn: Fix handling for the START_RESECURE action type.

## 0.9.19 (2021-09-27)

- rn: Fix date handling in 2FA scenes

## 0.9.18 (2021-09-22)

- rn: Fix date handling in alert modal
- rn: Fix keyboard hiding in recovery scene
- rn: Rename any instance of 'screen' to 'scene'
- rn: Update translations

## 0.9.17 (2021-09-14)

- rn: Add gif loader to wait screen

## 0.9.16 (2021-08-20)

- rn: Fix Change PIN scene losing access to keyboard

## 0.9.15 (2021-08-18)

- rn: Fix error when cancelling sending
- rn: Enable Typescript strict mode and fix type definitions
- rn: Update translations

## 0.9.14 (2021-08-02)

- rn: Use hooks for the public login screen
- rn: Font size consistency fixes

## 0.9.13 (2021-07-27)

- rn: Close modals on scene exit.
- rn: Add type definitions for TypeScript (this release re-writes the entire codebase into TypeScript, but this should be the only externally-visible difference).

## 0.9.12 (2021-07-20)

- rn: Added back a couple of "$FlowFixMe" that is needed when this module is used by edge-react-gui

## 0.9.11 (2021-07-20)

- rn: Synchronize outlined text field logic fixes
- rn: Tighten the outlined text field props
- rn: Fix the crash in the QR-login modal
- rn: Run `yarn precommit` to update strings
- rn: Always close modals on the way out the door
- rn: Fix coding errors caught by TypeScript
- rn: Add missing react-native-gesture-handler dependency
- rn: Put `withTheme` after `connect`
- rn: Simplify the `Fade` component
- rn: Move the `isASCII` function to the right file
- rn: Use better export syntax
- rn: Use modern syntax for localization
- rn: Remove unused components & libraries
- rn: Implemented recovery translations
- rn: Add back button to the "TermsAndConditions" screen
- rn: Switch New Account flow screens positions: move "TermsAndConditions" screen after "Pin" screen and before "Wait" screen
- rn: Upgrade to react-native-airship v0.2.6

## 0.9.10 (2021-07-14)

- rn: Put working auto scroll on the account creation screens
- rn: Fix Next button size and spacing
- rn: Fix terms confirm button location
- rn: Fix text input box padding
- rn: Fix font size on terms and conditions screen
- rn: Fix account info border widths
- rn: Update welcome screen text
- rn: Update PIN description text
- rn: Change back button icon
- rn: Fix inconsistent horizontal margins in New Account flow screens
- rn: Add the ability to set all sides margins in Divider component
- rn: Add "overflow: 'hidden'" to the styles of KeyboardAvoidingView and inner container
- rn: Fix spinner bugs in sign up buttons
- rn: Restore themed buttons to sanity
- rn: Add eslint-plugin-react-native to the project
- rn: Fix ability of Fade component to hide children after animation
- rn: Add Back button to New Account screens
- rn: Create themed Back button component
- rn: Change small outlined field padding and font size
- rn: Change containers paddings/margins in all New Account flow screens to match the current design11:59
- rn: Add additional margin for title SimpleSceneHeader component to prevent visual glitches
- rn: Change Divider component marginVertical prop default value
- rn: Upgrade to react-native-patina v0.1.4

## 0.9.9 (2021-07-05)

- rn: New themed Create Account flow
- rn: Update translations

## 0.9.8 (2021-06-21)

- rn: Fix Change Recovery Questions modal on large screens
- rn: Update translations

## 0.9.7 (2021-06-14)

- rn: Add Exit button to return to the landing screen from registration flow

## 0.9.6 (2021-06-11)

- rn: Close the security alerts if the list starts empty

## 0.9.5 (2021-06-08)

- rn: New themed Create Account scene
- rn: Reorganize layers and decreased tappable area to prevent text entry in PIN field
- rn: Allow direct entry of recovery token
- rn: Update translations

## 0.9.4 (2021-05-26)

- rn: Prevent user from selecting duplicate recovery questions

## 0.9.3 (2021-05-25)

- rn: Show error on Change Password Recovery Screen when user selecting the same question
- rn: Fix spacing issue on create account welcome screen
- rn: Prepare for future edge-core-js breaking changes

## 0.9.2 (2021-05-10)

- rn: Add testID's to various screens.
- rn: Improve internal type-safety. This should not have any extenally-visible effects.

## 0.9.1 (2021-04-19)

- rn: Disable the password recovery email on Android. This works around a tricky crash in the React Native rendering code.

## 0.9.0 (2021-04-12)

- rn: Update modal colors

## 0.8.3 (2021-04-07)

- _Breaking change: This release contains a breaking change that was not indicated in the minor version update_:
  - rn: Prompt for notification permissions to support security features
- rn: Restrict PIN input to numbers only
- rn: Show error when recovery questions match

## 0.8.2 (2021-04-06)

- rn: Port all password recovery modals to the new theming system.
- rn: Fix a bug that would leave the recovery token blank when sharing recovery links.

## 0.8.1 (2021-03-25)

- rn: Show a spinner on the barcode modal.

## 0.8.0 (2021-03-12)

- Breaking changes:
  - rn: Add react-native-share as a native dependency.
- Other changes:
  - Add a "share" option for the password recovery token.

## 0.7.1 (2021-03-03)

- rn: Catch & display errors while launching screens.
- rn: Make the OTP error & OTP repair screens less confusing based on user feedback.
- rn: Upgrade edge-core-js & use its latest type definitions internally.
- all: Upgrade linting tools.

## 0.7.0 (2021-02-24)

- Breaking changes:
  - rn: Add a native react-native-localize dependency.
  - rn: Remove the unused `folder` parameter from various touch-related functions:
    - `isTouchEnabled`
    - `isTouchDisabled`
    - `enableTouchId`
    - `disableTouchId`
  - rn: Remove the `error` parameter from the `onLogin` callback.
  - rn: Remove the `ChooseTestAppScreen` component.
  - rn: Upgrade other native dependencies.
- Other changes:
  - rn: Add German translation.
  - rn: Flip the background gradient direction.
  - rn: Improve thex security alerts screen appearance

## 0.6.29 (2021-02-19)

- rn: Add a new 2fa repair screen component.

## 0.6.28 (2021-01-26)

- rn: Only fetch recovery questions if they exist

## 0.6.27 (2021-01-22)

- rn: Fix the OTP backup code modal crash.
- rn: Add a scroll view to the change password screen.
- rn: Expose the security alerts screen as a standalone component.
  - Add `hasSecurityAlerts` and `watchSecurityAlerts` helpers to determine when to show this screen.
  - Add a `skipSecurityAlerts` prop to the `LoginScreen` component, so the GUI can manage the alerts instead of the login UI.
- rn: Eliminate all legacy Disklet usage.

## 0.6.26 (2021-01-11)

- rn: Expose the QR modal from the password login screen
- rn: Update translations

## 0.6.25 (2021-01-08)

- rn: Fix a bug that could show the user redundant login approval requests.
- rn: Add helper text to pin login network errors.
- rn: Improve the password recovery error text.
- rn: Replace several old-style modals with themed modals.

## 0.6.24 (2020-12-18)

- rn: Fix & theme the password recovery input modal.
- rn: Show the correct header for IP validation errors.
- rn: Fix typos on the 2fa reset modal.

## 0.6.23 (2020-12-09)

- rn: Add colors to all spinner components.
- rn: Fix Flow types around react-native-material-textfield.

## 0.6.22 (2020-11-20)

- rn: Use a different icon for the back button.

## 0.6.21 (2020-11-02)

- rn: Add a skip button to the security alert screen.
- rn: Fix layout issues on iPhone 12 devices.
- rn: Clean various icon-related components.

## 0.6.20 (2020-10-15)

- rn: Don't show the reset button without a reset token.
- rn: Use more modern React methods & import styles.

## 0.6.19 (2020-10-08)

- rn: Upgrade to react-redux v6.0.1.
- rn: Theme the delete user modal.

## 0.6.18 (2020-09-22)

- rn: Fix a crash when rendering the SecondaryButton. This would occur when the 2fa reminder modal popped up.

## 0.6.17 (2020-09-18)

- rn: Fix a race condition that could lead to an infinite login loop.

## 0.6.16 (2020-09-14)

- rn: Upgrade to the latest react-native-airship.
- rn: Remove unused TouchId logic from the password login screen.
- rn: Re-theme and add voucher support to the OTP reset alert, OTP error screen, and related modals.
- rn: Route to a security alert screen after logging into an account with pending issues.

## 0.6.15 (2020-09-03)

- rn: Do not enable touch for users without locally-stored data.
- rn: Fix the modal title size.
- rn: Upgrade to react-native-patina v0.1.3

## 0.6.14 (2020-08-17)

- rn: Use react-native-airship to power more modals.
- rn: Fix the header "skip" buttons on the password recovery workflow.
- rn: Many internal cleanups & refactorings.

## 0.6.13 (2020-08-10)

- rn: Prevent the welcome screen from flickering at startup, due to a bug in the last release.

## 0.6.12 (2020-08-04)

- web: Add a temporary `etherscanApiKey` field to `makeEdgeUiContext`,
- rn: Enforce Flow typing & other cleanups throughout the codebase. This shouldn't have any user-visible changes.

## 0.6.11 (2020-06-05)

- Fix ion icon size variable name

## 0.6.10

- rn: Remove native-base as a dependency.
- rn: Upgrade to react-native-vector-icons version 6.

## 0.6.9

- rn: Make the password recovery scene question list full height.
- rn: Fix the OTP scene buttons.

## 0.6.8 (2020-03-18)

- rn: Add auto scroll to terms and condition screen

## 0.6.7 (2020-03-09)

- rn: Update translations

## 0.6.6 (2020-02-11)

- rn: Fix previous users related crashes

## 0.6.5 (2020-02-09)

- rn: Added most recently used function to username list

## 0.6.4 (2020-02-04)

- rn: Update TOS

## 0.6.2 (2019-11-25)

- web: Improve visual appearance.
- rn: Fix compatibility with React Native 0.61

## 0.6.1 (2019-11-13)

- rn: Export `getSupportedBiometryType`

## 0.6.0 (2019-10-25)

- web: Visually redesign the SDK.
- rn: Allow the user to trigger an action by tapping the logo 5x.

## 0.5.44 (2019-10-08)

- rn: Fix layout on change PIN & change password screens.
- rn: Handle password recovery + 2FA.
- rn: Fix UX on 2FA entry screen.

## 0.5.43 (2019-09-27)

- Fix cropping of logo on new account welcome scene
- Upgrade flow and fix new flow errors
- Upgrade vulnerable dev dependency

## 0.5.41 (2019-09-13)

- rn: Fix fingerprint crash at login.

## 0.5.40 (2019-09-12)

- rn: Fix visual glitches.

## 0.5.39 (2019-09-09)

- web: Upgrade build tooling.
- rn: Update transactions.
- rn: Make "Confirm Password" string translatable.
- rn: Remove dangling semicolon.

## 0.5.38 (2019-08-07)

- rn: Update transactions.

## 0.5.37 (2019-08-06)

- rn: Fix button widths on tablets,
- rn: Fix Touch ID wording.
- rn: Update translations.

## 0.5.36 (2019-07-25)

- rn: Fix icons & messages for the updated login flow.

## 0.5.35 (2019-07-24)

- rn: Fix bugs with the refactored login flow.

## 0.5.34 (2019-07-22)

- rn: Refactor login flow to separate PIN / fingerprint / face methods.

## 0.5.31 (2019-06-10)

- rn: Fix modals to cover the entire screen.

## 0.5.21 (2019-05-13)

- rn: Show the exact date of the upcoming 2fa reset.

## 0.5.20 (2019-05-07)

- rn: Provide props for easy customization of text and logos
- rn: Improve visual appearance of some items

## 0.5.19 (2019-04-22)

- rn: Fix compatibility with React Native v0.59

## 0.5.18 (2019-04-01)

- rn: Fix account creation error popup.
- web: Fix Edge login barcode not working.

## 0.5.17

- rn: fix mobile safari
- rn: fix edge login password recovery bug
- rn: login text and functionality changes
- rn: fix pin login not displaying correctly on mobile
- rn: fix bug on delete cached mobile modal
- rn: fix some locale variables
- rn: change url links to latest url app
- rn: track if TextInput is mounted before calling focus()

## 0.5.16

- rn: update strings

## 0.5.15

- rn: added ko, fr, and vi language translations
- rn: improved UX for Login Screen with multiple accounts

## 0.5.14

- rn: handle errors thrown during create account

## 0.5.13

- all: Upgrade to edge-core-js v0.13.5
- rn: Fix fullscreen modal positioning

## 0.5.12

- rn: added Japanese
- rn: updated some translations

## 0.5.11

- rn: new background images
- rn: pin login close drop down bug
- rn: fix OTP error on character length

## 0.5.10

- rn: Wrap 2FA scene in SafeAreaView to account for notch on iPhone X
- rn: update components to remove componentWillMount
- rn: Adjust header styles
- rn: fix error message to only show wait when needed
- rn: Upgrade eslint
- rn: Change Airbitz texts to Edge, change -Edge vs Airbitz- to -Scan or Ta…
- rn: remove deprecated apis

## 0.5.9

- rn: Adjust height of PIN field on create account slightly
- rn: Fix styling for passwordRecoveryModal to prevent keyboard covering
- rn: Adjust font size of the CANCEL button on the Password Recovery screen

## 0.5.8

- Re-added Password Recovery Questions modal email input

## 0.5.7

- Added language translations for Spanish, Italian, Russian, and Portuguese
- Fixes for UI scaling and spacing

## 0.5.6

- CreateAccountNextButton UI tweak
- PasswordChange UI tweak
- PasswordRecovery scaling
- Fixes to new account PIN scene
- Prevent spinner from showing when user taps "Next" without typing a username in Create Account flow
- Add padding under Confirm Password field

## 0.5.5

- web: Fix the demo.
- rn: Fix styling.

## 0.5.4

- rn: clean up of translatable strings.
- rn: clean up of scaling issues

## 0.5.3

- web: Fix a build issue.

## 0.5.2

- rn: Fix more scaling issues.
- web: Upgrade to edge-core-js v0.12.3 (may affect callback timing).
- web: Fix build issues.
- web: Update readme file.

## 0.5.1

- rn: Fix scaling issues.
- rn: Fix React key property error.
- rn: Disable TouchId during login.
- rn: Upgrade the Whorlwind library.
- rn: Add hacked `androidFetch` function to work around Bitpay issue.

## 0.5.0

- web: Re-write the iframe to use the `yaob` bridge added in edge-core-js v0.11.0. This gives the web access to the full core API, including spending.

## 0.4.8

- upgrade to edge-core-js v0.11.1

## 0.4.7

- rn: Use forked react-native-size-matters to fix iPad horizontal

## 0.4.6

- rn: fix f digit pin connector to prevent crash

## 0.4.5

- rn: surfaced rate limits on accountlogin
- rn: add alert for any account on the device that is experiencing a 2fa reset
- rn: fixed removing of usernames from device

## 0.4.3

- rn: upgrade dependencies for rn56 compatibility
- rn: implement AccountOptions
- rn: upgrade core
- rn: created account module scaling

## 0.4.2

- rn: rollback dependencies for rn56 compatibility
- rn: remove auto-translated files from being active

## 0.4.1

- rn: upgrade dependencies for rn56 compatibility

## 0.4.0

- rn: modified text for password recovery.
- rn: changes based on removal of context.io in core

## 0.3.5

- rn: added localization auto detect.
- rn: Machnie translations for Spanish, Portuguese.
- rn: Fix autocorrect bug on username creation
- rn: add firebase
- rn: fix types for imports
- rn: modified text for clarity

## 0.3.4

- rn: added git tag in failed publish attempt

## 0.3.3

- rn: Various font & style fixes.
- web: Fix currency wallet creation.

## 0.3.2

- react: Fix a spelling mistake.
- rn: Fix endless spinning on incorrect OTP login (again).
- web: Implement `createCurrencyWallet`.
- web: Fix Ethereum transaction signing.

## 0.3.1

- rn: Fix endless spinning on incorrect OTP login.

## 0.3.0

- web: Add transaction signing & private-key lockdown mode.
- web: Host iframe contents on the web for easier setup.
- react: Many UI fixes

## 0.2.13

- rn: Expose & fix some sneaky flow errors.

## 0.2.12

- all: Stop using deprecated core API's.
- rn: Add Confirmation Screen for Password Recovery.

## 0.2.11

- web: Fix recovery email contents to refer to "Edge".
- web: Do not show the account settings when they aren't available.
- web: Increase iframe timeouts.
- all: Upgrade edge-core-js to fix errors with really long passwords.

## 0.2.10

- react: Add missing files to the NPM module.
- web: Improve the account-creation screen.
- web: Fix screen height issues.

## 0.2.9

- all: Upgrade edge-login-js.
- web: Update the demo.
- web: Do not wipe out the context user list on login.

## 0.2.8

- web: Re-publish without using buggy Lerna.

## 0.2.7

- web: Re-publish due to Lerna bug.

## 0.2.6

- all: Fix build scripts to work correctly on Windows.
- rn: Fix corrupted header on 2fa screen.
- web: Fix various typos and visual glitches.
- web: Add a user list to the `EdgeUiContext` object.
- web: Rename `EdgeUiAccount.getFirstWallet` to `getFirstWalletInfo`.

## 0.2.5

- web: Re-publish library due to packaging error.

## 0.2.4

- web: Hack the library not to crash in node.js environments.
- react: Upgrade vulnerable moment.js.

## 0.2.3

- Publish `edge-login-ui-web`.
- web: Fix the `copy-edge-assets` script.

## 0.2.2

- Publish `edge-login-ui-react`.
- Fix minor visual glitches on the React Native login screens.
- Begin preparing React Native login screens for localization.

## 0.2.1

- Fix react-native build issues
- Fix the Samsung Note 8 crash

## 0.2.0

- Split the project into two NPM packages

## 0.1.6

- Upgrade to airbitz-core-js v0.3.5, which fixes edge logins.

## 0.1.5

- Upgrade to airbitz-core-js v0.3.4.
- Simplified the `assets` folder path specification.

## 0.1.4

- Upgrade to airbitz-core-js v0.3.3
