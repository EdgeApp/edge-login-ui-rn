// @flow

import type { DiskletFolder } from 'disklet'
import {
  type EdgeAccount,
  type EdgeAccountOptions,
  type EdgeContext
} from 'edge-core-js'

import { type RootState } from '../reducers/RootReducer.js'
import { type Action } from './ReduxActions.js'

export type { Action, RootState }

export type TouchIdInfo = {|
  isTouchSupported: boolean,
  isTouchEnabled: boolean
|}

export type OnLogin = (
  error: string | Error | null,
  account?: EdgeAccount | null,
  touchIdInfo?: TouchIdInfo | null
) => void

export type Imports = {|
  +accountOptions: EdgeAccountOptions,
  +context: EdgeContext,
  +folder: DiskletFolder,
  +onComplete: () => void,
  +onLogin?: OnLogin,
  +recoveryKey?: string,
  +skipSecurityAlerts?: boolean,
  +username?: string | null
|}

export type GetState = () => RootState
export type Dispatch = <Return>(
  action:
    | Action
    | ((dispatch: Dispatch, getState: GetState, i: Imports) => Return)
) => Return
