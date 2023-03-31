import * as React from 'react'
import { View } from 'react-native'

import s from '../../common/locales/strings'
import * as Styles from '../../styles/index'
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
  const scene = useSelector(state => state.scene)
  const { SceneStyle } = Styles

  function renderContent() {
    switch (scene.currentScene) {
      case 'ChangePasswordScene':
        return <ChangePasswordScene />
      case 'ChangePinScene':
        return <ChangePinScene />
      case 'ChangeRecoveryScene':
        return <ChangeRecoveryScene branding={props.branding} />
      case 'NewAccountWelcomeScene':
        return <NewAccountWelcomeScene branding={props.branding} />
      case 'NewAccountUsernameScene':
        return <NewAccountUsernameScene branding={props.branding} />
      case 'NewAccountPasswordScene':
        return <NewAccountPasswordScene />
      case 'NewAccountPinScene':
        return <NewAccountPinScene />
      case 'NewAccountTosScene':
        return <NewAccountTosScene branding={props.branding} />
      case 'NewAccountWaitScene':
        return (
          <WaitScene
            title={s.strings.great_job}
            message={s.strings.hang_tight + '\n' + s.strings.secure_account}
          />
        )
      case 'NewAccountReviewScene':
        return <NewAccountReviewScene branding={props.branding} />
      case 'LandingScene':
        return <LandingScene branding={props.branding} />
      case 'LoadingScene':
        return <LoadingScene branding={props.branding} />
      case 'OtpScene':
        return <OtpErrorScene />
      case 'OtpRepairScene':
        return <OtpRepairScene branding={props.branding} />
      case 'PasswordScene':
        return <PasswordLoginScene branding={props.branding} />
      case 'PinScene':
        return <PinLoginScene branding={props.branding} />
      case 'RecoveryLoginScene':
        return <RecoveryLoginScene />
      case 'ResecurePasswordScene':
        return <ResecurePasswordScene />
      case 'ResecurePinScene':
        return <ResecurePinScene />
      case 'SecurityAlertScene':
        return <SecurityAlertsScene />
    }
  }

  return (
    <MaybeProvideLoginUi>
      <View accessible style={SceneStyle}>
        <WatchUsernames />
        {renderContent()}
      </View>
    </MaybeProvideLoginUi>
  )
}
