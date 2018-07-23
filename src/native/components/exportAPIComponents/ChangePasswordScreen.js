// @flow

import { makeReactNativeFolder } from 'disklet'
import type { AbcAccount, AbcContext } from 'edge-core-js'
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import type { Store } from 'redux'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import reducers from '../../../common/reducers'
import type { Imports } from '../../../types/ReduxTypes.js'
import ChangePasswordAppConnector from '../../connectors/ChangePasswordAppConnector'
import * as Styles from '../../styles'

type Props = {
  account: AbcAccount,
  context: AbcContext,
  showHeader: boolean,
  onComplete(): void,
  onCancel(): void
}
type State = {}
type Action = { type: string }

class ChangePasswordScreen extends Component<Props> {
  store: Store<State, Action>
  static defaultProps = {
    accountObject: null,
    showHeader: true
  }

  componentWillMount () {
    const imports: Imports = {
      accountOptions: {},
      folder: makeReactNativeFolder(),
      accountObject: this.props.account,
      context: this.props.context,
      onComplete: this.props.onComplete,
      onCancel: this.props.onComplete,
      callback: () => {}
    }
    this.store = createStore(
      reducers,
      {},
      applyMiddleware(thunk.withExtraArgument(imports))
    )
  }
  componentWillReceiveProps (props: Props) {}

  render () {
    return (
      <Provider store={this.store}>
        <ChangePasswordAppConnector
          styles={Styles}
          showHeader={this.props.showHeader}
        />
      </Provider>
    )
  }
}

export { ChangePasswordScreen }
