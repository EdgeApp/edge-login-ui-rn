import { EdgeAccount } from 'edge-core-js'
import * as React from 'react'

import { useHandler } from '../../../hooks/useHandler'
import { useImports } from '../../../hooks/useImports'
import { Branding } from '../../../types/Branding'
import { SceneProps } from '../../../types/routerTypes'
import { ChangeUsernameComponent } from '../newAccount/NewAccountUsernameScene'

export interface ChangeUsernameParams {
  account: EdgeAccount
  username?: string
}

interface ChangeUsernameProps extends SceneProps<'changeUsername'> {
  branding: Branding
}

/**
 * The standalone username change scene that completes immediately.
 */
export const ChangeUsernameScene = (props: ChangeUsernameProps) => {
  const { branding, route } = props
  const { onComplete = () => {} } = useImports()
  const account: EdgeAccount = route.params.account

  const handleNext = useHandler((newUsername: string) => {
    onComplete({ username: newUsername })
  })

  return (
    <ChangeUsernameComponent
      initUsername={account.username ?? ''}
      branding={branding}
      onNext={handleNext}
      onBack={() => null}
    />
  )
}
