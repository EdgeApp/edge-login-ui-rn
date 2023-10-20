import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { initializeChangeRecovery } from '../../actions/PasswordRecoveryActions'
import { useClearOnUnmount } from '../../hooks/useClearOnUnmount'
import { Branding } from '../../types/Branding'
import { asExperimentConfig, OnLogEvent } from '../../types/ReduxTypes'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'

interface Props {
  account: EdgeAccount
  branding: Branding
  context: EdgeContext
  onComplete: () => void
  onLogEvent: OnLogEvent
}

export function PasswordRecoveryScreen(props: Props): JSX.Element {
  const { account, branding, context, onComplete, onLogEvent } = props
  useClearOnUnmount()

  return (
    <ReduxStore
      imports={{
        accountOptions: {},
        context,
        onComplete,
        onLogEvent,
        experimentConfig: asExperimentConfig({})
      }}
      initialAction={initializeChangeRecovery(account)}
    >
      <Router branding={branding} />
    </ReduxStore>
  )
}
