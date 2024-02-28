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
  OnNotificationPermit
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

  /**
   * Do not show the OTP reminder during login.
   */
  skipOtpReminder?: boolean

  /**
   * Do not show the security alerts screen during login.
   */
  skipSecurityAlerts?: boolean

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
   * Records events for analytics.
   */
  onLogEvent?: OnLogEvent

  /**
   * Called when the user makes a choice from RequestPermissionsModal.
   */
  onNotificationPermit?: OnNotificationPermit

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
   * The username to select, if present on the device.
   *
   * @deprecated Use initialLoginId instead.
   */
  username?: string
}

export function LoginScreen(props: Props): JSX.Element {
  const { context, fontDescription, initialLoginId, username } = props

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
        initialUserInfo,
        initialRoute: props.initialRoute,
        onComplete: props.onComplete,
        onLogin: props.onLogin,
        onLogEvent: props.onLogEvent,
        onNotificationPermit: props.onNotificationPermit,
        recoveryKey: props.recoveryLogin,
        skipOtpReminder: props.skipOtpReminder,
        skipSecurityAlerts: props.skipSecurityAlerts,
        experimentConfig,
        customPermissionsFunction: props.customPermissionsFunction
      }}
      initialAction={initializeLogin()}
    >
      <Router branding={branding} />
    </ReduxStore>
  )
}
