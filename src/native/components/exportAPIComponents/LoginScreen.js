// @flow

import React, { Component } from 'react'
import { Provider } from 'react-redux'
import type { Store } from 'redux'
import { applyMiddleware, compose, createStore } from 'redux'
import thunk from 'redux-thunk'

import { updateFontStyles } from '../../../common/constants/Fonts'
import { setLocal } from '../../../common/locale'
import reducers from '../../../common/reducers'
import LoginAppConnector from '../../connectors/LogInAppConnector'
import * as Styles from '../../styles'

type Props = {
  context: any,
  locale: string,
  language: string,
  username: string,
  recoveryLogin: boolean,
  accountOptions: any,
  fontDescription: any,
  onLogin(): void
}

type State = {}
type Action = { type: string }

class LoginScreen extends Component<Props> {
  store: Store<State, Action>

  static defaultProps = {
    locale: 'US',
    language: 'en_us',
    username: null,
    recoveryLogin: false,
    accountOptions: null
  }

  componentWillMount () {
    updateFontStyles(this.props)
    setLocal(this.props.locale, this.props.language)
    const composeEnhancers =
      typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
        ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: 'core-ui' })
        : compose
    this.store = createStore(
      reducers,
      {},
      composeEnhancers(
        applyMiddleware(
          thunk.withExtraArgument({
            context: this.props.context,
            callback: this.props.onLogin,
            accountOptions: this.props.accountOptions,
            username: this.props.username,
            recoveryKey: this.props.recoveryLogin,
            locale: this.props.locale,
            language: this.props.language
          })
        )
      )
    )
  }
  componentWillReceiveProps (props: Props) {}

  render () {
    return (
      <Provider store={this.store}>
        <LoginAppConnector
          context={this.props.context}
          onLogin={this.props.onLogin}
          recoveryLogin={this.props.recoveryLogin}
          styles={Styles}
        />
      </Provider>
    )
  }
}

export { LoginScreen }
