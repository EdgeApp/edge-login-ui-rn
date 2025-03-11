import { EdgeAccount } from 'edge-core-js'
import { EmailException, openComposer } from 'react-native-email-link'
import Share from 'react-native-share'
import { sprintf } from 'sprintf-js'

import { lstrings } from '../common/locales/strings'
import { showError } from '../components/services/AirshipInstance'
import { questionsList } from '../constants/recoveryQuestions'
import { Branding } from '../types/Branding'
import { Dispatch, GetState, Imports } from '../types/ReduxTypes'

/**
 * Prepares what is needed for the change recovery scene.
 */
export const initializeChangeRecovery = (account: EdgeAccount) => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { context } = imports

  // Get the user's questions:
  let userQuestions: string[] = []
  const { recoveryKey, username } = account
  if (recoveryKey != null && username != null) {
    try {
      userQuestions = await context.fetchRecovery2Questions(
        recoveryKey,
        username
      )
    } catch (error) {
      showError(error)
    }
  }

  dispatch({
    type: 'NAVIGATE',
    data: {
      name: 'changeRecovery',
      params: { account, questionsList, userQuestions }
    }
  })
}

function truncateUsername(username: string): string {
  return username.slice(0, 2) + '***'
}

export async function sendRecoveryEmail(
  emailAddress: string,
  username: string,
  recoveryKey: string,
  branding: Branding
): Promise<void> {
  const body = `${sprintf(lstrings.otp_email_body_branded, branding.appName)}
${truncateUsername(username)}

iOS
${encodeURIComponent(`edge://recovery?token=${recoveryKey}`)}

Android
https://deep.edge.app/recovery#${recoveryKey}

${lstrings.otp_email_body2}

${lstrings.recovery_token}: ${recoveryKey}

${sprintf(lstrings.otp_email_body3_branded, branding.appName)}`

  return await new Promise((resolve, reject) => {
    openComposer({
      to: emailAddress,
      subject: sprintf(lstrings.otp_email_subject_branded, branding.appName),
      body: body
    })
      .then(value => {
        resolve()
      })
      .catch((error: EmailException) => {
        reject(error.message)
      })
  })
}
export async function shareRecovery(
  username: string,
  recoveryKey: string,
  branding: Branding
): Promise<void> {
  const body =
    sprintf(lstrings.otp_email_body_branded, branding.appName) +
    '\n' +
    truncateUsername(username) +
    `\n iOS: edge://recovery?token=${recoveryKey}` +
    `\n Android: https://deep.edge.app/recovery#${recoveryKey}\n` +
    lstrings.otp_email_body2 +
    `\n ${lstrings.recovery_token}: ${recoveryKey}\n` +
    sprintf(lstrings.otp_email_body3_branded, branding.appName)

  const title = sprintf(lstrings.otp_email_subject_branded, branding.appName)

  await Share.open({ title, message: body }).catch(error => {
    if (!/User did not/.test(error?.message)) throw error
  })
}
