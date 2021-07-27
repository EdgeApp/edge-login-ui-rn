import { EdgeAccount, EdgeContext, OtpError } from 'edge-core-js'
import * as React from 'react'

import { useClearOnUnmount } from '../../hooks/useClearOnUnmount'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'

interface Props {
  account: EdgeAccount
  context: EdgeContext
  onComplete: () => void
  otpError: OtpError
}

export function OtpRepairScreen(props: Props): JSX.Element {
  const { account, context, onComplete, otpError } = props
  useClearOnUnmount()

  return (
    <ReduxStore
      imports={{
        accountOptions: {},
        context,
        onComplete
      }}
      initialAction={{
        type: 'START_OTP_REPAIR',
        data: { account, error: otpError }
      }}
    >
      <Router branding={{}} showHeader />
    </ReduxStore>
  )
}
