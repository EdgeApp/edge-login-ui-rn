import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { asExperimentConfig, OnLogEvent } from '../../types/ReduxTypes'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'

interface Props {
  account: EdgeAccount
  context: EdgeContext
  onComplete: () => void
  onLogEvent?: OnLogEvent
}

export function UpgradeUsernameScreen(props: Props): JSX.Element {
  const { account, context, onComplete, onLogEvent } = props

  return (
    <ReduxStore
      imports={{
        accountOptions: {},
        context,
        onComplete,
        onLogEvent,
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
