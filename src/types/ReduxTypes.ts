import { asBoolean, asJSON, asObject } from 'cleaners'
import { EdgeAccount, EdgeAccountOptions, EdgeContext } from 'edge-core-js'
import * as ReactRedux from 'react-redux'

import { InitialRouteName } from '../components/publicApi/types'
import { RootState } from '../reducers/RootReducer'
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

export type OnComplete = () => void
export type OnLogin = (account: EdgeAccount, touchIdInfo?: TouchIdInfo) => void
export type OnNotificationPermit = (
  settings: NotificationPermissionsInfo
) => void

export interface Imports {
  readonly accountOptions: EdgeAccountOptions
  readonly context: EdgeContext
  readonly initialRoute?: InitialRouteName
  readonly onComplete: () => void
  readonly onLogin?: OnLogin
  readonly onNotificationPermit?: OnNotificationPermit
  readonly recoveryKey?: string
  readonly skipSecurityAlerts?: boolean
  readonly username?: string | null
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
