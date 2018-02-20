import React, { Component } from 'react'
import { View, KeyboardAvoidingView } from 'react-native'
import { Button } from '../../common'
import HeaderConnector from '../../../connectors/componentConnectors/HeaderConnectorChangeApps'
import PasswordConnector from '../../../connectors/componentConnectors/PasswordConnector.js'
import PasswordConfirmConnector from '../../../connectors/componentConnectors/PasswordConfirmConnector'
import ChangePasswordModalConnector from '../../../connectors/abSpecific/ChangePasswordModalConnector'
import PasswordStatusConnector from '../../../connectors/abSpecific/PasswordStatusConnector'

/* type Props = {
  styles: any,
  confirmPasswordErrorMessage: string,
  passwordStatus: any,
  password: string,
  confirmPassword: string
} */

export default class ChangeAccountPasswordScreenComponent extends Component {
  constructor (props) {
    super(props)
    this.onSetNextFocus = () => {
      this.setState({
        focusFirst: false,
        focusSecond: true
      })
    }

    this.onNextPress = () => {
      this.setState({
        isProcessing: true
      })
      if (!this.props.passwordStatus) {
        // TODO Skip component
        this.setState({
          isProcessing: false
        })
        return
      }
      if (this.props.error !== '' || this.props.error2 !== '') {
        this.setState({
          isProcessing: false
        })
        return
      }
      if (
        this.props.password &&
        this.props.password !== this.props.confirmPassword
      ) {
        this.setState({
          isProcessing: false
        })
        this.props.checkTheConfirmPassword()
        return
      }
      this.props.changePassword(this.props.password)
    }
    this.renderHeader = style => {
      if (this.props.showHeader) {
        return <HeaderConnector style={style.header} />
      }
      return null
    }
    this.renderInterior = styles => {
      return (
        <View style={styles.innerView}>
          <PasswordStatusConnector style={styles.status} />
          <PasswordConnector
            style={styles.inputBox}
            autoFocus={this.state.focusFirst}
            label={'New Password'}
            onFinish={this.onSetNextFocus}
          />
          <View style={styles.inputShim} />
          <PasswordConfirmConnector
            style={styles.inputBox}
            label={'Re-enter New Password'}
            autoFocus={this.state.focusSecond}
            onFinish={this.onNextPress}
          />
          <View style={styles.inputShim} />
          <Button
            onPress={this.onNextPress}
            downStyle={styles.nextButton.downStyle}
            downTextStyle={styles.nextButton.downTextStyle}
            upStyle={styles.nextButton.upStyle}
            upTextStyle={styles.nextButton.upTextStyle}
            label={'DONE'}
            isThinking={this.state.isProcessing}
            doesThink
          />
        </View>
      )
    }

    this.renderMain = styles => {
      if (this.state.focusSecond) {
        return (
          <KeyboardAvoidingView
            style={styles.pageContainer}
            contentContainerStyle={styles.pageContainer}
            behavior={'position'}
            keyboardVerticalOffset={-150}
          >
            {this.renderInterior(styles)}
          </KeyboardAvoidingView>
        )
      }
      return (
        <View style={styles.pageContainer}>{this.renderInterior(styles)}</View>
      )
    }

    this.renderModal = style => {
      if (this.props.showModal) {
        return <ChangePasswordModalConnector style={style.modal.skip} />
      }
      return null
    }
  }
  componentWillMount () {
    this.setState({
      isProcessing: false,
      focusFirst: true,
      focusSecond: false
    })
  }

  render () {
    const { NewAccountPasswordScreenStyle } = this.props.styles
    return (
      <View style={NewAccountPasswordScreenStyle.screen}>
        {this.renderHeader(NewAccountPasswordScreenStyle)}
        {this.renderMain(NewAccountPasswordScreenStyle)}
        {this.renderModal(NewAccountPasswordScreenStyle)}
      </View>
    )
  }
}
