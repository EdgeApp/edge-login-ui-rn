import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { useClearOnUnmount } from '../../hooks/useClearOnUnmount'
import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'

interface Props {
  account: EdgeAccount
  context: EdgeContext
  showHeader?: boolean
  onComplete: () => void
}

export function ChangePasswordScreen(props: Props): JSX.Element {
  const { account, context, onComplete, showHeader = true } = props
  useClearOnUnmount()

  return (
    <ReduxStore
      imports={{
        accountOptions: {},
        context,
        onComplete
      }}
      initialAction={{
        type: 'START_CHANGE_PASSWORD',
        data: account
      }}
    >
      <Router branding={{}} showHeader={showHeader} />
    </ReduxStore>
  )
}
