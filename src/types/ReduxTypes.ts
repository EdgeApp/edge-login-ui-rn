import { asBoolean, asJSON, asObject, asOptional, asValue } from 'cleaners'
import {
  EdgeAccount,
  EdgeAccountOptions,
  EdgeContext,
  EdgeUserInfo
} from 'edge-core-js'
import * as ReactRedux from 'react-redux'

import { InitialRouteName } from '../components/publicApi/types'
import { RootState } from '../reducers/RootReducer'
import { TrackingEventName, TrackingValues } from '../util/analytics'
import { Action } from './ReduxActions'

export type { Action, RootState }

export interface NotificationPermissionsInfo {
  isNotificationBlocked: boolean
  notificationOptIns: NotificationOptIns
}
export interface NotificationOptIns {
  ignoreMarketing: boolean
  ignorePriceChanges: boolean
}
export const asNotificationPermissionsInfo = asJSON(
  asObject<NotificationPermissionsInfo>({
    isNotificationBlocked: asBoolean,
    notificationOptIns: asObject({
      ignoreMarketing: asBoolean,
      ignorePriceChanges: asBoolean
    })
  })
)

export interface TouchIdInfo {
  isTouchSupported: boolean
  isTouchEnabled: boolean
}

export interface ExperimentConfig {
  createAccountType: 'light' | 'full'
  createAccountText: 'signUp' | 'getStarted' | 'createAccount'
  signupCaptcha: 'withCaptcha' | 'withoutCaptcha'
}

export const asExperimentConfig = asObject<ExperimentConfig>({
  createAccountType: asOptional(asValue('light', 'full'), 'full'),
  createAccountText: asOptional(
    asValue('signUp', 'getStarted', 'createAccount'),
    'createAccount'
  ),
  signupCaptcha: asOptional(
    asValue('withCaptcha', 'withoutCaptcha'),
    'withoutCaptcha'
  )
})

export type OnComplete = () => void
export type OnLogin = (account: EdgeAccount, touchIdInfo?: TouchIdInfo) => void
export type OnNotificationPermit = (
  settings: NotificationPermissionsInfo
) => void
export type OnLogEvent = (
  event: TrackingEventName,
  values?: TrackingValues
) => void

export interface Imports {
  readonly accountOptions: EdgeAccountOptions
  readonly context: EdgeContext
  readonly initialUserInfo?: EdgeUserInfo
  readonly initialRoute?: InitialRouteName
  readonly onLogEvent?: OnLogEvent
  readonly onComplete?: () => void
  readonly onLogin?: OnLogin
  readonly onNotificationPermit?: OnNotificationPermit
  readonly recoveryKey?: string
  readonly skipSecurityAlerts?: boolean
  readonly experimentConfig: ExperimentConfig
  readonly customPermissionsFunction?: () => void
}

export type GetState = () => RootState
export type Dispatch = <Return>(
  action:
    | Action
    | ((dispatch: Dispatch, getState: GetState, i: Imports) => Return)
) => Return

type UseDispatch = () => Dispatch

type UseSelector = <T>(select: (state: RootState) => T) => T

export const useDispatch: UseDispatch = ReactRedux.useDispatch

export const useSelector: UseSelector = ReactRedux.useSelector
