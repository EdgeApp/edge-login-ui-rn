import { EdgeAccountOptions, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { initializeLogin } from '../../actions/LoginInitActions'
import { setAppConfig } from '../../common/appConfig'
import { Branding, ParentButton } from '../../types/Branding'
import {
  asExperimentConfig,
  ExperimentConfig,
  OnComplete,
  OnLogEvent,
  OnLogin,
  OnNotificationPermit
} from '../../types/ReduxTypes'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'
import { changeFont } from '../services/ThemeContext'
import { AppConfig, InitialRouteName } from './types'

interface Props {
  context: EdgeContext

  /**
   * The user to select, if present on the device.
   * Get this from `EdgeContext.localUsers`
   */
  initialLoginId?: string
  initialRoute?: InitialRouteName

  // Branding stuff:
  appId?: string
  appName?: string
  fontDescription?: {
    regularFontFamily: string
    headingFontFamily?: string
  }
  landingScreenText?: string
  parentButton?: ParentButton
  primaryLogo?: any
  primaryLogoCallback?: () => void

  // Options passed to the core login methods:
  accountOptions: EdgeAccountOptions

  /**
   * Application config options
   */
  appConfig?: AppConfig

  /**
   * Called when the user navigates back passed the initialRoute if it was set.
   */
  onComplete?: OnComplete
  // Called when the login completes:
  onLogin: OnLogin
  // Called when the user makes a choice from RequestPermissionsModal:
  onNotificationPermit?: OnNotificationPermit
  // Passed from the GUI for analytics reporting
  onLogEvent?: OnLogEvent

  // The recoveryKey from the user's email, to trigger recovery login:
  recoveryLogin?: string

  // Behavior and appearance management flags, for A/B testing.
  experimentConfig?: ExperimentConfig

  // Do not show the security alerts screen during login,
  // since the app plans to show the `SecurityAlertsScreen` itself
  // based on `hasSecurityAlerts` and `watchSecurityAlerts`:
  skipSecurityAlerts?: boolean

  // Do not show the OTP reminder during login
  skipOtpReminder?: boolean

  // Call that overwrites the internal checkAndRequestNotifications function. Executed on Login initialization:
  customPermissionsFunction?: () => void

  /**
   * The username to select, if present on the device.
   * @deprecated Use initialLoginId instead.
   */
  username?: string
}

export function LoginScreen(props: Props): JSX.Element {
  const {
    appConfig,
    context,
    fontDescription = { regularFontFamily: 'System' },
    initialLoginId,
    skipOtpReminder,
    username
  } = props
  const {
    regularFontFamily,
    headingFontFamily = regularFontFamily
  } = fontDescription
  const { onComplete, onLogEvent = () => {} } = props

  // Look up the requested user:
  const initialUserInfo =
    initialLoginId != null
      ? context.localUsers.find(info => info.loginId === initialLoginId)
      : username != null
      ? context.localUsers.find(info => info.username === username)
      : undefined

  // Update theme fonts if they are different:
  React.useEffect(() => changeFont(regularFontFamily, headingFontFamily), [
    regularFontFamily,
    headingFontFamily
  ])

  setAppConfig(appConfig)
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
        onComplete,
        onLogin: props.onLogin,
        onLogEvent,
        onNotificationPermit: props.onNotificationPermit,
        recoveryKey: props.recoveryLogin,
        skipOtpReminder,
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
