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
        return <ChangePasswordScene />
      case 'changePin':
        return <ChangePinScene />
      case 'changeRecovery':
        return <ChangeRecoveryScene branding={props.branding} />
      case 'newAccountWelcome':
        return <NewAccountWelcomeScene branding={props.branding} />
      case 'newAccountUsername':
        return <NewAccountUsernameScene branding={props.branding} />
      case 'newAccountPassword':
        return <NewAccountPasswordScene />
      case 'newAccountPin':
        return <NewAccountPinScene />
      case 'newAccountTos':
        return <NewAccountTosScene branding={props.branding} />
      case 'newAccountWait':
        return (
          <WaitScene
            title={s.strings.great_job}
            message={s.strings.hang_tight + '\n' + s.strings.secure_account}
          />
        )
      case 'newAccountReview':
        return <NewAccountReviewScene branding={props.branding} />
      case 'landing':
        return <LandingScene branding={props.branding} />
      case 'loading':
        return <LoadingScene branding={props.branding} />
      case 'otpError':
        return <OtpErrorScene />
      case 'otpRepair':
        return <OtpRepairScene branding={props.branding} />
      case 'passwordLogin':
        return <PasswordLoginScene branding={props.branding} />
      case 'pinLogin':
        return <PinLoginScene branding={props.branding} />
      case 'recoveryLogin':
        return <RecoveryLoginScene />
      case 'resecurePassword':
        return <ResecurePasswordScene />
      case 'resecurePin':
        return <ResecurePinScene />
      case 'securityAlert':
        return <SecurityAlertsScene />
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
