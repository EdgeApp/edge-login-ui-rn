import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { useClearOnUnmount } from '../../hooks/useClearOnUnmount'
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

export function ChangeDuressCodeScreen(props: Props): JSX.Element {
  const {
    account,
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
      initialAction={{
        type: 'NAVIGATE',
        data: { name: 'changeDuressCode', params: { account, context } }
      }}
    >
      <Router branding={{}} />
    </ReduxStore>
  )
}
