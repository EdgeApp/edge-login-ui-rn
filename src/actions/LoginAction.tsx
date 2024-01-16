import { asMaybeUsernameError } from 'edge-core-js'
import * as React from 'react'

import { lstrings } from '../common/locales/strings'
import { TextInputModal } from '../components/modals/TextInputModal'
import { Airship, showError } from '../components/services/AirshipInstance'
import { Dispatch, GetState, Imports } from '../types/ReduxTypes'

/**
 * Ask the user for the username that goes with a recovery key,
 * then launches the questions scene.
 */
export const launchPasswordRecovery = (recoveryKey: string) => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { context, onLogEvent = () => {} } = imports

  async function handleSubmit(username: string): Promise<boolean | string> {
    try {
      const questions = await context.fetchRecovery2Questions(
        recoveryKey,
        username
      )
      dispatch({
        type: 'NAVIGATE',
        data: {
          name: 'recoveryLogin',
          params: { recoveryKey, userQuestions: questions, username }
        }
      })
      onLogEvent('Recovery_Username_Success')
      return true
    } catch (error: unknown) {
      onLogEvent('Recovery_Username_Failure')

      const usernameError = asMaybeUsernameError(error)
      if (usernameError != null) {
        showError(lstrings.recovery_by_username_error)
        return false
      }

      showError(error)
      return false
    }
  }

  Airship.show(bridge => (
    <TextInputModal
      bridge={bridge}
      onSubmit={handleSubmit}
      title={lstrings.password_recovery}
      message={lstrings.recover_by_username}
      inputLabel={lstrings.username}
      autoCapitalize="none"
      autoCorrect={false}
      autoFocus
    />
  ))
}
