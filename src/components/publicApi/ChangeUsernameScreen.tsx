import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'
import { asExperimentConfig, OnLogEvent, OnPerfEvent } from './publicTypes'

interface Props {
  account: EdgeAccount
  context: EdgeContext
  password: string
  onComplete: () => void
  onLogEvent?: OnLogEvent
  onPerfEvent?: OnPerfEvent
}

/**
 * A standalone screen for changing a username that can be mounted independently.
 * This component handles the username availability check and completes immediately
 * after username change.
 */
export function ChangeUsernameScreen(props: Props): JSX.Element {
  const {
    account,
    context,
    password,
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
        data: {
          name: 'changeUsername',
          params: { account, password }
        }
      }}
    >
      <Router branding={{}} />
    </ReduxStore>
  )
}
