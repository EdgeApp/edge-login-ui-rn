import { EdgeAccountOptions, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { initializeLogin } from '../../actions/LoginInitActions'
import { setAppConfig } from '../../common/appConfig'
import { Branding, ParentButton } from '../../types/Branding'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'
import { changeFont } from '../services/ThemeContext'
import {
  AppConfig,
  asExperimentConfig,
  ExperimentConfig,
  InitialRouteName,
  OnComplete,
  OnLogEvent,
  OnLogin,
  OnNotificationPermit,
  OnPerfEvent
} from './publicTypes'

interface Props {
  // ---------------------------------------------------------------------
  // Login functionality
  // ---------------------------------------------------------------------

  context: EdgeContext

  /**
   * Options passed to the core login methods.
   */
  accountOptions: EdgeAccountOptions

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
  fastLogin?: boolean

  forceLightAccountCreate?: boolean

  /**
   * The user to select, if present on the device.
   * Get this from `EdgeContext.localUsers`
   */
  initialLoginId?: string

  /**
   * Which scene to begin with.
   */
  initialRoute?: InitialRouteName

  /**
   * Pass a recoveryKey from the user's email to trigger recovery login.
   */
  recoveryLogin?: string

  // ---------------------------------------------------------------------
  // Branding & customization
  // ---------------------------------------------------------------------

  appId?: string
  appName?: string
  landingScreenText?: string
  parentButton?: ParentButton
  primaryLogo?: any
  primaryLogoCallback?: () => void

  /** Contains the terms of service URL */
  appConfig?: AppConfig

  /**  Behavior and appearance management flags, for A/B testing. */
  experimentConfig?: ExperimentConfig

  // ---------------------------------------------------------------------
  // Callbacks
  // ---------------------------------------------------------------------

  /**
   * Called when the user navigates back past the initialRoute if it was set.
   */
  onComplete?: OnComplete

  /**
   * Called when the login completes.
   */
  onLogin: OnLogin

  /**
   * Generic Login UI interaction events.
   */
  onPerfEvent?: OnPerfEvent

  /**
   * Records events for analytics.
   */
  onLogEvent?: OnLogEvent

  // ---------------------------------------------------------------------
  // Deprecated
  // ---------------------------------------------------------------------

  /**
   * Called at login.
   *
   * @deprecated Pass `fastLogin` instead, and then perform
   * your custom permissions logic after receiving `onLogin`.
   */
  customPermissionsFunction?: () => void

  /**
   * @deprecated Use the LoginUiProvider component for theming.
   */
  fontDescription?: {
    regularFontFamily: string
    headingFontFamily?: string
  }

  /**
   * Called when the user makes a choice from RequestPermissionsModal.
   *
   * @deprecated Use `fastLogin` mode instead.
   */
  onNotificationPermit?: OnNotificationPermit

  /**
   * Do not show the OTP reminder during login.
   *
   * @deprecated Pass `fastLogin` instead
   */
  skipOtpReminder?: boolean

  /**
   * Do not show the security alerts screen during login.
   *
   * @deprecated Pass `fastLogin` instead.
   */
  skipSecurityAlerts?: boolean

  /**
   * The username to select, if present on the device.
   *
   * @deprecated Use initialLoginId instead.
   */
  username?: string
}

export function LoginScreen(props: Props): JSX.Element {
  const {
    context,
    fastLogin = false,
    forceLightAccountCreate = false,
    fontDescription,
    initialLoginId,
    onPerfEvent = () => {},
    username
  } = props

  // Look up the requested user:
  const initialUserInfo =
    initialLoginId != null
      ? context.localUsers.find(info => info.loginId === initialLoginId)
      : username != null
      ? context.localUsers.find(info => info.username === username)
      : undefined

  // Update theme fonts if they are different:
  React.useEffect(() => {
    if (fontDescription == null) return
    const {
      regularFontFamily,
      headingFontFamily = regularFontFamily
    } = fontDescription
    changeFont(regularFontFamily, headingFontFamily)
  }, [fontDescription])

  setAppConfig(props.appConfig)
  const branding: Branding = {
    appId: props.appId,
    appName: props.appName,
    landingSceneText: props.landingScreenText,
    parentButton: props.parentButton,
    primaryLogo: props.primaryLogo,
    primaryLogoCallback: props.primaryLogoCallback
  }

  // Clean to populate with defaults
  const experimentConfig = asExperimentConfig(props.experimentConfig ?? {})

  return (
    <ReduxStore
      imports={{
        accountOptions: props.accountOptions,
        branding,
        context,
        fastLogin: props.fastLogin,
        forceLightAccountCreate,
        initialUserInfo,
        initialRoute: props.initialRoute,
        onComplete: props.onComplete,
        onLogin: props.onLogin,
        onPerfEvent: onPerfEvent,
        onLogEvent: props.onLogEvent,
        onNotificationPermit: props.onNotificationPermit,
        recoveryKey: props.recoveryLogin,
        skipOtpReminder: fastLogin || props.skipOtpReminder,
        skipSecurityAlerts: fastLogin || props.skipSecurityAlerts,
        experimentConfig,
        customPermissionsFunction: props.customPermissionsFunction
      }}
      initialAction={initializeLogin()}
    >
      <Router branding={branding} />
    </ReduxStore>
  )
}
