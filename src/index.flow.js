// @flow

import {
  type EdgeAccount,
  type EdgeAccountOptions,
  type EdgeContext,
  type OtpError
} from 'edge-core-js'
import * as React from 'react'

type BiometryType = 'Fingerprint' | 'TouchID' | 'FaceID'

type ParentButton = {
  callback: () => void,
  style?: any,
  text: string
}

/**
 * @deprecated This will not be provided in `fastLogin` mode
 * Use `getSupportedBiometryType` and `touchIdEnabled` to learn these values.
 */
type TouchIdInfo = {
  isTouchSupported: boolean,
  isTouchEnabled: boolean
}

type OnLogin = (account: EdgeAccount, touchIdInfo?: TouchIdInfo) => void

type Unsubscribe = () => void

// ---------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------

/**
 * Provides modals and other services for the login UI.
 * In the future, this will be our injection point for branding &
 * theme customizations.
 */
declare export class LoginUiProvider
  extends
    React.Component<{
      children: React.Node
    }> {}

declare export class ChangePasswordScreen
  extends
    React.Component<{
      account: EdgeAccount,
      context: EdgeContext,
      showHeader?: boolean,
      onComplete: () => void
    }> {}

declare export class ChangePinScreen
  extends
    React.Component<{
      account: EdgeAccount,
      context: EdgeContext,
      showHeader?: boolean,
      onComplete: () => void
    }> {}

declare export class PasswordRecoveryScreen
  extends
    React.Component<{
      account: EdgeAccount,
      context: EdgeContext,
      showHeader?: boolean,
      onComplete: () => void
    }> {}

declare export class LoginScreen
  extends
    React.Component<{
      // ---------------------------------------------------------------------
      // Login functionality
      // ---------------------------------------------------------------------

      context: EdgeContext,

      /** Options passed to the core login methods. */
      accountOptions: EdgeAccountOptions,

      /**
       * Skip all post-login preparation steps.
       *
       * The goal is to display the main application as quickly as possible.
       * Then, once the app is ready, several steps can happen in the background:
       *
       * - `prepareTouchId` to ensure the account can log in with biometrics.
       * - `showNotificationPermissionReminder` to request permissions,
       *   (or the app can provide its own reminder).
       * - `showOtpReminder` to encourage the user to set up 2fa,
       *   (or the app can provide its own reminder).
       * - `watchSecurityAlerts` to check for incoming login requests,
       *   followed by showing the `SecurityAlertsScreen` if detected.
       *
       * If you do not pass the `fastLogin` flag, edge-login-ui-rn itself
       * will perform these steps, which can delay login by several seconds
       * on slower phones.
       */
      fastLogin?: boolean,

      /**
       * The user to select, if present on the device.
       * Get this from `EdgeContext.localUsers`
       */
      initialLoginId?: string,
      // initialRoute?: InitialRouteName,

      /** Pass a recoveryKey from the user's email to trigger recovery login. */
      recoveryLogin?: string,

      // ---------------------------------------------------------------------
      // Branding & customization
      // ---------------------------------------------------------------------

      appId?: string,
      appName?: string,
      landingScreenText?: string,
      parentButton?: ParentButton,
      primaryLogo?: any,
      primaryLogoCallback?: () => void,

      /** Contains the terms of service URL */
      // appConfig?: AppConfig,

      /**  Behavior and appearance management flags, for A/B testing. */
      // experimentConfig?: ExperimentConfig,

      // ---------------------------------------------------------------------
      // Callbacks
      // ---------------------------------------------------------------------

      /**
       * Called when the user navigates back past the initialRoute if it was set.
       */
      onComplete?: () => void,

      /*
       * Called when the login completes.
       */
      onLogin: OnLogin,

      /**
       * Records events for analytics.
       */
      // onLogEvent?: OnLogEvent,

      // ---------------------------------------------------------------------
      // Deprecated
      // ---------------------------------------------------------------------

      /**
       * Called at login.
       *
       * @deprecated Pass `fastLogin` instead, and then perform
       * your custom permissions logic after receiving `onLogin`.
       */
      customPermissionsFunction?: () => void,

      /**
       * @deprecated Use the LoginUiProvider component for theming.
       */
      fontDescription?: { regularFontFamily: string },

      /**
       * Called when the user makes a choice from RequestPermissionsModal.
       * @deprecated Use `fastLogin` mode instead.
       */
      onNotificationPermit?: (settings: any) => void,

      /**
       * Do not show the OTP reminder during login.
       *
       * @deprecated Pass `fastLogin` instead
       */
      skipOtpReminder?: boolean,

      /**
       * Do not show the security alerts screen during login.
       *
       * @deprecated Pass `fastLogin` instead.
       */
      skipSecurityAlerts?: boolean,

      /**
       * The username to select, if present on the device.
       *
       * @deprecated Use initialLoginId instead.
       */
      username?: string
    }> {}

declare export class OtpRepairScreen
  extends
    React.Component<{
      account: EdgeAccount,
      context: EdgeContext,
      onComplete: () => void,
      otpError: OtpError
    }> {}

declare export class SecurityAlertsScreen
  extends
    React.Component<{
      account: EdgeAccount,
      context: EdgeContext,
      onComplete: () => void
    }> {}

// ---------------------------------------------------------------------
// Post-login steps
// ---------------------------------------------------------------------

/**
 * Should be called at login to ensure biometric login is properly enabled.
 * @param account The account that has just logged in.
 */
declare export function refreshTouchId(account: EdgeAccount): Promise<void>

/**
 * Asks the users for notification permissions, if needed.
 */
declare export function showNotificationPermissionReminder(opts: {
  appName?: string,
  // onLogEvent?: OnLogEvent,
  onNotificationPermit?: (settings: any) => void
}): Promise<void>

/**
 * Check and show the 2fa reminder on login, if necessary.
 */
declare export function showOtpReminder(account: EdgeAccount): Promise<void>

/**
 * Returns true if the application should show the SecurityAlertsScreen.
 */
declare export function hasSecurityAlerts(account: EdgeAccount): boolean

/**
 * Calls a callback when the account gains or loses security alerts.
 */
declare export function watchSecurityAlerts(
  account: EdgeAccount,
  onChange: (hasAlerts: boolean) => void
): Unsubscribe

// ---------------------------------------------------------------------
// Biometric utilities
// ---------------------------------------------------------------------

declare export function disableTouchId(account: EdgeAccount): Promise<void>
declare export function enableTouchId(account: EdgeAccount): Promise<void>
declare export function getSupportedBiometryType(): Promise<BiometryType | null>
declare export function isTouchEnabled(account: EdgeAccount): Promise<boolean>
