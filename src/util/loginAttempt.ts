import { EdgeAccount, EdgeAccountOptions, EdgeContext } from 'edge-core-js'

import { OnPerfEvent } from '../components/publicApi/publicTypes'

export type LoginAttempt =
  | {
      type: 'password'
      username: string
      password: string
    }
  | {
      type: 'recovery'
      recoveryKey: string
      username: string
      answers: string[]
    }

export async function attemptLogin(
  context: EdgeContext,
  attempt: LoginAttempt,
  opts: EdgeAccountOptions,
  onPerfEvent: OnPerfEvent
): Promise<EdgeAccount> {
  if (attempt.type === 'password') {
    onPerfEvent({ name: 'passwordLoginBegin' })
    return await context.loginWithPassword(
      attempt.username,
      attempt.password,
      opts
    )
  }
  return await context.loginWithRecovery2(
    attempt.recoveryKey,
    attempt.username,
    attempt.answers,
    opts
  )
}
