import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { useClearOnUnmount } from '../../hooks/useClearOnUnmount'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'

interface Props {
  account: EdgeAccount
  context: EdgeContext
  onComplete: () => void
}

export function ChangePasswordScreen(props: Props): JSX.Element {
  const { account, context, onComplete } = props
  useClearOnUnmount()

  return (
    <ReduxStore
      imports={{
        accountOptions: {},
        context,
        onComplete
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
