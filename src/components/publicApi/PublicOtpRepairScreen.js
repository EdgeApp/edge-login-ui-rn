// @flow

import { type EdgeAccount, type EdgeContext, OtpError } from 'edge-core-js'
import * as React from 'react'

import { useClearOnUnmount } from '../../hooks/useClearOnUnmount.js'
import { Router } from '../navigation/Router.js'
import { ReduxStore } from '../services/ReduxStore.js'

type Props = {
  account: EdgeAccount,
  context: EdgeContext,
  onComplete(): void,
  otpError: OtpError
}

export function OtpRepairScreen(props: Props): React.Node {
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
