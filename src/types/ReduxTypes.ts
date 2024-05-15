import { EdgeAccountOptions, EdgeContext, EdgeUserInfo } from 'edge-core-js'
import * as ReactRedux from 'react-redux'

import type {
  ExperimentConfig,
  InitialRouteName,
  OnLogEvent,
  OnLogin,
  OnNotificationPermit,
  OnPerfEvent
} from '../components/publicApi/publicTypes'
import { RootState } from '../reducers/RootReducer'
import { Branding } from './Branding'
import { Action } from './ReduxActions'

export type { Action, RootState }

export interface Imports {
  readonly accountOptions: EdgeAccountOptions
  readonly branding?: Branding
  readonly context: EdgeContext
  readonly fastLogin?: boolean
  readonly initialUserInfo?: EdgeUserInfo
  readonly initialRoute?: InitialRouteName
  readonly onLogEvent?: OnLogEvent
  readonly onComplete?: () => void
  readonly onLogin?: OnLogin
  readonly onPerfEvent: OnPerfEvent
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
