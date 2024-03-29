import { EdgeAccount, EdgeContext, OtpError } from 'edge-core-js'
import * as React from 'react'

import { useClearOnUnmount } from '../../hooks/useClearOnUnmount'
import { Branding } from '../../types/Branding'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'
import { asExperimentConfig, OnLogEvent } from './publicTypes'

interface Props {
  account: EdgeAccount
  branding: Branding
  context: EdgeContext
  otpError: OtpError
  onComplete: () => void
  onLogEvent?: OnLogEvent
}

export function OtpRepairScreen(props: Props): JSX.Element {
  const { account, branding, context, otpError, onComplete, onLogEvent } = props
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
      initialAction={{
        type: 'NAVIGATE',
        data: { name: 'otpRepair', params: { account, otpError } }
      }}
    >
      <Router branding={branding} />
    </ReduxStore>
  )
}
