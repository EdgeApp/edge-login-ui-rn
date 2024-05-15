import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'
import { asExperimentConfig, OnLogEvent, OnPerfEvent } from './publicTypes'

interface Props {
  account: EdgeAccount
  context: EdgeContext
  onComplete: () => void
  onLogEvent?: OnLogEvent
  onPerfEvent?: OnPerfEvent
}

export function UpgradeUsernameScreen(props: Props): JSX.Element {
  const {
    account,
    context,
    onComplete,
    onLogEvent,
    onPerfEvent = () => {}
  } = props

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
      initialAction={{
        type: 'NAVIGATE',
        data: { name: 'upgradeUsername', params: { account } }
      }}
    >
      <Router branding={{}} />
    </ReduxStore>
  )
}
