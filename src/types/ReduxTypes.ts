import { asObject, asOptional, asValue } from 'cleaners'
import {
  EdgeAccount,
  EdgeAccountOptions,
  EdgeContext,
  EdgeUserInfo
} from 'edge-core-js'
import * as ReactRedux from 'react-redux'

import { InitialRouteName } from '../components/publicApi/publicTypes'
import { RootState } from '../reducers/RootReducer'
import { TrackingEventName, TrackingValues } from '../util/analytics'
import { Branding } from './Branding'
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

export interface TouchIdInfo {
  isTouchSupported: boolean
  isTouchEnabled: boolean
}

export interface ExperimentConfig {
  createAccountType: 'light' | 'full'
  signupCaptcha: 'withCaptcha' | 'withoutCaptcha'
}

export const asExperimentConfig = asObject<ExperimentConfig>({
  createAccountType: asOptional(asValue('light', 'full'), 'full'),
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
  readonly branding?: Branding
  readonly context: EdgeContext
  readonly initialUserInfo?: EdgeUserInfo
  readonly initialRoute?: InitialRouteName
  readonly onLogEvent?: OnLogEvent
  readonly onComplete?: () => void
  readonly onLogin?: OnLogin
  readonly onNotificationPermit?: OnNotificationPermit
  readonly recoveryKey?: string
  readonly skipOtpReminder?: boolean
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
