import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { initializeChangeRecovery } from '../../actions/PasswordRecoveryActions'
import { useClearOnUnmount } from '../../hooks/useClearOnUnmount'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'

interface Props {
  account: EdgeAccount
  context: EdgeContext
  showHeader?: boolean
  onComplete: () => void
}

export function PasswordRecoveryScreen(props: Props): JSX.Element {
  const { account, context, onComplete, showHeader = false } = props
  useClearOnUnmount()

  return (
    <ReduxStore
      imports={{
        accountOptions: {},
        context,
        onComplete
      }}
      initialAction={initializeChangeRecovery(account)}
    >
      <Router branding={{}} showHeader={showHeader} />
    </ReduxStore>
  )
}
