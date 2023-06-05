import * as React from 'react'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore, Store } from 'redux'
import thunk from 'redux-thunk'

import { launchPasswordRecovery } from '../../actions/LoginAction'
import { rootReducer, RootState } from '../../reducers/RootReducer'
import { Action, Dispatch, GetState, Imports } from '../../types/ReduxTypes'
import { showError } from './AirshipInstance'

interface Props {
  children?: React.ReactNode
  initialAction:
    | Action
    | ((dispatch: Dispatch, getState: GetState, i: Imports) => unknown)
  imports: Imports
}

/**
 * Consolidates our Redux setup logic into one place.
 */
export class ReduxStore extends React.Component<Props> {
  store: Store<RootState>

  constructor(props: Props) {
    super(props)
    const { imports } = this.props

    this.store = createStore(
      rootReducer,
      applyMiddleware(thunk.withExtraArgument(imports))
    )

    new Promise(resolve => {
      // @ts-expect-error Flow doesn't know about thunks at this point.
      resolve(this.store.dispatch(this.props.initialAction))
    }).catch(showError)
  }

  componentDidUpdate(prev: Props) {
    const { recoveryKey } = this.props.imports
    if (recoveryKey && recoveryKey !== prev.imports.recoveryKey) {
      this.store.dispatch(launchPasswordRecovery(recoveryKey))
    }
  }

  render() {
    const { children } = this.props
    // @ts-expect-error: mismatching redux versions.
    return <Provider store={this.store}>{children}</Provider>
  }
}
