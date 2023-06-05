import * as React from 'react'
import { View } from 'react-native'

import s from '../../common/locales/strings'
import { Branding } from '../../types/Branding'
import { useSelector } from '../../types/ReduxTypes'
import { MaybeProvideLoginUi } from '../publicApi/LoginUiProvider'
import {
  ChangePasswordScene,
  NewAccountPasswordScene,
  ResecurePasswordScene
} from '../scenes/ChangePasswordScene'
import {
  ChangePinScene,
  NewAccountPinScene,
  ResecurePinScene
} from '../scenes/ChangePinScene'
import { ChangeRecoveryScene } from '../scenes/existingAccout/ChangeRecoveryScene'
import { OtpRepairScene } from '../scenes/existingAccout/OtpRepairScene'
import { SecurityAlertsScene } from '../scenes/existingAccout/SecurityAlertsScene'
import { LandingScene } from '../scenes/LandingScene'
import { LoadingScene } from '../scenes/LoadingScene'
import { NewAccountReviewScene } from '../scenes/newAccount/NewAccountReviewScene'
import { NewAccountTosScene } from '../scenes/newAccount/NewAccountTosScene'
import { NewAccountUsernameScene } from '../scenes/newAccount/NewAccountUsernameScene'
import { NewAccountWelcomeScene } from '../scenes/newAccount/NewAccountWelcomeScene'
import { OtpErrorScene } from '../scenes/OtpErrorScene'
import { PasswordLoginScene } from '../scenes/PasswordLoginScene'
import { PinLoginScene } from '../scenes/PinLoginScene'
import { RecoveryLoginScene } from '../scenes/RecoveryLoginScene'
import { WaitScene } from '../scenes/WaitScene'
import { WatchUsernames } from '../services/WatchUsernames'

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
        return (
          <WaitScene
            title={s.strings.great_job}
            message={s.strings.hang_tight + '\n' + s.strings.secure_account}
            route={route}
          />
        )
      case 'newAccountReview':
        return <NewAccountReviewScene branding={props.branding} route={route} />
      case 'landing':
        return <LandingScene branding={props.branding} route={route} />
      case 'loading':
        return <LoadingScene branding={props.branding} route={route} />
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
    }
  }

  return (
    <MaybeProvideLoginUi>
      <View accessible style={styles.container}>
        <WatchUsernames />
        {renderContent()}
      </View>
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
