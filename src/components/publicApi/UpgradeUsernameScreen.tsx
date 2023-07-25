import { EdgeAccount, EdgeContext } from 'edge-core-js'
import * as React from 'react'

import { Router } from '../navigation/Router'
import { ReduxStore } from '../services/ReduxStore'

interface Props {
  account: EdgeAccount
  context: EdgeContext
  onComplete: () => void
}

export function UpgradeUsernameScreen(props: Props): JSX.Element {
  const { account, context, onComplete } = props

  return (
    <ReduxStore
      imports={{
        accountOptions: {},
        context,
        onComplete
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
