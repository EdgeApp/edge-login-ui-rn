import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { useClearOnUnmount } from '../../hooks/useClearOnUnmount'
import { OnLogEvent } from '../../types/ReduxTypes'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'

interface Props {
  account: EdgeAccount
  context: EdgeContext
  onComplete: () => void
  onLogEvent?: OnLogEvent
}

export function ChangePasswordScreen(props: Props): JSX.Element {
  const { account, context, onComplete, onLogEvent } = props
  useClearOnUnmount()

  return (
    <ReduxStore
      imports={{
        accountOptions: {},
        context,
        onComplete,
        onLogEvent
      }}
      initialAction={{
        type: 'NAVIGATE',
        data: { name: 'changePassword', params: { account } }
      }}
    >
      <Router branding={{}} />
    </ReduxStore>
  )
}
