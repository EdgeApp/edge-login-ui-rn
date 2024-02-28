import { EdgeLoginMessage } from 'edge-core-js'
import * as React from 'react'

import { SecurityAlertsModal } from '../components/modals/SecurityAlertsModal'
import { Airship } from '../components/services/AirshipInstance'
import { arrangeUsers, upgradeUser } from '../hooks/useLocalUsers'
import { scene as sceneReducer } from '../reducers/SceneReducer'
import {
  Action,
  Dispatch,
  GetState,
  Imports,
  RootState
} from '../types/ReduxTypes'
import { launchPasswordRecovery } from './LoginAction'
import { loadTouchState } from './TouchActions'

/**
 * Fires off all the things we need to do to get the login scene up & running.
 */
export const initializeLogin = () => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const touchPromise = dispatch(loadTouchState())
  dispatch(checkSecurityMessages()).catch(error => console.log(error))

  await touchPromise

  const state = getState()

  // Handle routing using given initialRoute:
  dispatch(routeInitialization(state, imports))

  // Show password recovery if recoveryKey is given:
  const { recoveryKey } = imports
  if (
    (imports.initialRoute == null || imports.initialRoute === 'login') &&
    recoveryKey
  ) {
    dispatch(launchPasswordRecovery(recoveryKey))
  }
}

export const maybeRouteComplete = (fallbackAction: Action) => (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  if (imports.initialRoute == null) {
    dispatch(fallbackAction)
    return
  }

  const state = getState()
  const sceneState = state.scene
  const initialRouteSceneName = sceneReducer(
    sceneState,
    routeInitialization(state, imports)
  ).name

  if (
    imports.onComplete != null &&
    (initialRouteSceneName === sceneState.name ||
      (imports.initialRoute === 'login' && sceneState.name === 'passwordLogin'))
  ) {
    imports.onComplete()
    return
  }

  dispatch(fallbackAction)
}

/**
 * Loading is done, so send the user to the initial route.
 */
function routeInitialization(state: RootState, imports: Imports): Action {
  const {
    context,
    initialUserInfo = arrangeUsers(context.localUsers)[0]
  } = imports
  const { touch } = state

  // Try to find the user requested by the LoginScene props:
  const startupUser =
    initialUserInfo != null ? upgradeUser(initialUserInfo, touch) : undefined

  const defaultInitialRoute = (): Action => {
    const { recoveryKey } = imports
    if (recoveryKey) {
      return {
        type: 'NAVIGATE',
        data: { name: 'landing', params: {} }
      }
    } else if (startupUser == null) {
      return {
        type: 'NAVIGATE',
        data: { name: 'landing', params: {} }
      }
    } else if (startupUser.pinLoginEnabled || startupUser.touchLoginEnabled) {
      return {
        type: 'NAVIGATE',
        data: {
          name: 'pinLogin',
          params: { loginId: startupUser.loginId }
        }
      }
    } else {
      return {
        type: 'NAVIGATE',
        data: {
          name: 'passwordLogin',
          params: { username: startupUser.username ?? '' }
        }
      }
    }
  }

  switch (imports.initialRoute) {
    case 'login':
      return defaultInitialRoute()
    case 'login-password':
      return {
        type: 'NAVIGATE',
        data: {
          name: 'passwordLogin',
          params: { username: startupUser?.username ?? '' }
        }
      }
    case 'login-password-light':
      return {
        type: 'NAVIGATE',
        data: {
          name: 'passwordLogin',
          params: {
            username: startupUser?.username ?? '',
            createAccountType: 'light'
          }
        }
      }
    case 'new-account':
      return {
        type: 'NAVIGATE',
        data: { name: 'newAccountUsername', params: {} }
      }
    case 'new-light-account': // Set pin, modified TOS
      return {
        type: 'NAVIGATE',
        data: { name: 'newAccountPin', params: {} }
      }
    default:
      return defaultInitialRoute()
  }
}

const checkSecurityMessages = () => async (
  dispatch: Dispatch,
  getState: GetState,
  imports: Imports
) => {
  const { context } = imports
  const messages = await context.fetchLoginMessages()

  const relevantMessages: EdgeLoginMessage[] = []
  for (const message of messages) {
    if (message.username == null) continue

    // Skip users who haven't fully logged in:
    const info = context.localUsers.find(
      info => info.username === message.username
    )
    if (info == null || !info.keyLoginEnabled) continue

    const { otpResetPending, pendingVouchers = [] } = message
    if (otpResetPending || pendingVouchers.length > 0) {
      relevantMessages.push(message)
    }
  }

  if (relevantMessages.length > 0) {
    const username = await Airship.show<string | undefined>(bridge => (
      <SecurityAlertsModal bridge={bridge} messages={relevantMessages} />
    ))
    if (username != null) {
      dispatch({
        type: 'NAVIGATE',
        data: { name: 'passwordLogin', params: { username } }
      })
    }
  }
}
