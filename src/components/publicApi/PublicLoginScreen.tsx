import { EdgeAccountOptions, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { initializeLogin } from '../../actions/LoginInitActions'
import { updateFontStyles } from '../../constants/Fonts'
import { Branding, ParentButton } from '../../types/Branding'
import { OnLogin } from '../../types/ReduxTypes'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'
import { changeFont, useTheme } from '../services/ThemeContext'

interface Props {
  context: EdgeContext

  // Branding stuff:
  appId?: string
  appName?: string
  backgroundImage?: any
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

  // Called when the login completes:
  onLogin: OnLogin

  // The recoveryKey from the user's email, to trigger recovery login:
  recoveryLogin?: string

  // Do not show the security alerts screen during login,
  // since the app plans to show the `SecurityAlertsScreen` itself
  // based on `hasSecurityAlerts` and `watchSecurityAlerts`:
  skipSecurityAlerts?: boolean

  // The username to select, if present on the device:
  username?: string

  // Call that overwrites the internal checkAndRequestNotifications function. Executed on Login initialization:
  customPermissionsFunction?: () => void
}

export function LoginScreen(props: Props): JSX.Element {
  const { fontDescription = { regularFontFamily: 'System' } } = props
  const {
    regularFontFamily,
    headingFontFamily = regularFontFamily
  } = fontDescription

  const theme = useTheme()

  // Always update legacy fonts:
  updateFontStyles(regularFontFamily, headingFontFamily)

  // Update theme fonts if they are different:
  React.useEffect(() => changeFont(regularFontFamily, headingFontFamily), [
    regularFontFamily,
    headingFontFamily
  ])

  const branding: Branding = {
    appId: props.appId,
    appName: props.appName,
    backgroundImage: props.backgroundImage,
    landingSceneText: props.landingScreenText,
    parentButton: props.parentButton,
    primaryLogo: props.primaryLogo,
    primaryLogoCallback: props.primaryLogoCallback
  }

  return (
    <ReduxStore
      imports={{
        accountOptions: props.accountOptions,
        context: props.context,
        onComplete: () => {},
        onLogin: props.onLogin,
        recoveryKey: props.recoveryLogin,
        skipSecurityAlerts: props.skipSecurityAlerts,
        username: props.username,
        customPermissionsFunction: props.customPermissionsFunction
      }}
      initialAction={initializeLogin(theme, branding)}
    >
      <Router branding={branding} showHeader />
    </ReduxStore>
  )
}
