import * as React from 'react'
import { View } from 'react-native'

import { Branding } from '../../types/Branding'
import { useSelector } from '../../types/ReduxTypes'
import { MaybeProvideLoginUi } from '../publicApi/LoginUiProvider'
import {
  ChangePasswordScene,
  NewAccountPasswordScene,
  ResecurePasswordScene,
  UpgradePasswordScene
} from '../scenes/ChangePasswordScene'
import {
  ChangePinScene,
  NewAccountPinScene,
  ResecurePinScene
} from '../scenes/ChangePinScene'
import { ChangeRecoveryScene } from '../scenes/existingAccout/ChangeRecoveryScene'
import { ChangeUsernameScene } from '../scenes/existingAccout/ChangeUsernameScene'
import { OtpRepairScene } from '../scenes/existingAccout/OtpRepairScene'
import { SecurityAlertsScene } from '../scenes/existingAccout/SecurityAlertsScene'
import { LandingScene } from '../scenes/LandingScene'
import { LoadingScene } from '../scenes/LoadingScene'
import {
  NewAccountReviewScene,
  UpgradeReviewScene
} from '../scenes/newAccount/NewAccountReviewScene'
import {
  NewAccountTosScene,
  UpgradeTosScene
} from '../scenes/newAccount/NewAccountTosScene'
import {
  NewAccountUsernameScene,
  UpgradeUsernameScene
} from '../scenes/newAccount/NewAccountUsernameScene'
import { NewAccountWaitScene } from '../scenes/newAccount/NewAccountWaitScene'
import { NewAccountWelcomeScene } from '../scenes/newAccount/NewAccountWelcomeScene'
import { OtpErrorScene } from '../scenes/OtpErrorScene'
import { PasswordLoginScene } from '../scenes/PasswordLoginScene'
import { PinLoginScene } from '../scenes/PinLoginScene'
import { RecoveryLoginScene } from '../scenes/RecoveryLoginScene'

interface Props {
  branding: Branding
}

export function Router(props: Props) {
  const route = useSelector(state => state.scene)

  function renderContent() {
    switch (route.name) {
      case 'changePassword':
        return <ChangePasswordScene route={route} />
      case 'changePin':
        return <ChangePinScene route={route} />
      case 'changeRecovery':
        return <ChangeRecoveryScene branding={props.branding} route={route} />
      case 'newAccountWelcome':
        return (
          <NewAccountWelcomeScene branding={props.branding} route={route} />
        )
      case 'newAccountUsername':
        return (
          <NewAccountUsernameScene branding={props.branding} route={route} />
        )
      case 'newAccountPassword':
        return <NewAccountPasswordScene route={route} />
      case 'newAccountPin':
        return <NewAccountPinScene route={route} />
      case 'newAccountTos':
        return <NewAccountTosScene branding={props.branding} route={route} />
      case 'newAccountWait':
        return <NewAccountWaitScene route={route} />
      case 'newAccountReview':
        return <NewAccountReviewScene route={route} />
      case 'landing':
        return <LandingScene branding={props.branding} route={route} />
      case 'loading':
        return <LoadingScene route={route} />
      case 'otpError':
        return <OtpErrorScene route={route} />
      case 'otpRepair':
        return <OtpRepairScene branding={props.branding} route={route} />
      case 'passwordLogin':
        return <PasswordLoginScene branding={props.branding} route={route} />
      case 'pinLogin':
        return <PinLoginScene branding={props.branding} route={route} />
      case 'recoveryLogin':
        return <RecoveryLoginScene route={route} />
      case 'resecurePassword':
        return <ResecurePasswordScene route={route} />
      case 'resecurePin':
        return <ResecurePinScene route={route} />
      case 'securityAlert':
        return <SecurityAlertsScene route={route} />
      case 'upgradeAccountReview':
        return <UpgradeReviewScene route={route} />
      case 'upgradePassword':
        return <UpgradePasswordScene route={route} />
      case 'upgradeTos':
        return <UpgradeTosScene branding={props.branding} route={route} />
      case 'upgradeUsername':
        return <UpgradeUsernameScene branding={props.branding} route={route} />
      case 'changeUsername':
        return <ChangeUsernameScene branding={props.branding} route={route} />
    }
  }

  return (
    <MaybeProvideLoginUi>
      <View style={styles.container}>{renderContent()}</View>
    </MaybeProvideLoginUi>
  )
}

const styles = {
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  }
}
