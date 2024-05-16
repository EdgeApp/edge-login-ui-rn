import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { initializeChangeRecovery } from '../../actions/PasswordRecoveryActions'
import { useClearOnUnmount } from '../../hooks/useClearOnUnmount'
import { Branding } from '../../types/Branding'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'
import { asExperimentConfig, OnLogEvent, OnPerfEvent } from './publicTypes'

interface Props {
  account: EdgeAccount
  branding: Branding
  context: EdgeContext
  onComplete: () => void
  onLogEvent: OnLogEvent
  onPerfEvent?: OnPerfEvent
}

export function PasswordRecoveryScreen(props: Props): JSX.Element {
  const {
    account,
    branding,
    context,
    onComplete,
    onLogEvent,
    onPerfEvent = () => {}
  } = props
  useClearOnUnmount()

  return (
    <ReduxStore
      imports={{
        accountOptions: {},
        context,
        onComplete,
        onLogEvent,
        onPerfEvent,
        experimentConfig: asExperimentConfig({})
      }}
      initialAction={initializeChangeRecovery(account)}
    >
      <Router branding={branding} />
    </ReduxStore>
  )
}
