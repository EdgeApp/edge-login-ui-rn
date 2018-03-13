// @flow

import React, { Component } from 'react'
import { Text, View } from 'react-native'

import * as Constants from '../../../common/constants'
import * as Assets from '../../assets/'
import { LogoImageHeader } from '../abSpecific'
import { BackgroundImage, Button } from '../common'

type Props = {
  styles: Object,
  startFlow(string): void
}

type State = {}
export default class LandingScreenComponent extends Component<Props, State> {
  render () {
    const { LandingScreenStyle } = this.props.styles
    return (
      <View style={LandingScreenStyle.container}>
        <BackgroundImage
          src={Assets.LOGIN_BACKGROUND}
          style={LandingScreenStyle.backgroundImage}
          content={this.renderOverImage()}
        />
      </View>
    )
  }
  renderOverImage () {
    const { LandingScreenStyle } = this.props.styles
    return (
      <View style={LandingScreenStyle.inner}>
        <View style={LandingScreenStyle.featureBox}>
          <LogoImageHeader style={LandingScreenStyle.logoHeader} />
          <View style={LandingScreenStyle.featureBoxContent}>
            <View style={LandingScreenStyle.featureBoxDescription}>
              <Text style={LandingScreenStyle.tagText}>
                {
                  'The secure and easy to use wallet for your blockchain assets and tokens'
                }
              </Text>
            </View>
          </View>
          <View style={LandingScreenStyle.featureBoxButtons}>
            <Button
              onPress={this.onStartCreate.bind(this)}
              label={'Create account'}
              downStyle={LandingScreenStyle.createButton.downStyle}
              downTextStyle={LandingScreenStyle.createButton.downTextStyle}
              upStyle={LandingScreenStyle.createButton.upStyle}
              upTextStyle={LandingScreenStyle.createButton.upTextStyle}
            />
            <View style={LandingScreenStyle.shim} />
            <Button
              testID={'alreadyHaveAccountButton'}
              onPress={this.onStartLogin.bind(this)}
              label={'Already have an account? Sign in'}
              downStyle={LandingScreenStyle.loginButton.downStyle}
              downTextStyle={LandingScreenStyle.loginButton.downTextStyle}
              upStyle={LandingScreenStyle.loginButton.upStyle}
              upTextStyle={LandingScreenStyle.loginButton.upTextStyle}
            />
          </View>
        </View>
      </View>
    )
  }
  onStartCreate () {
    this.props.startFlow(Constants.WORKFLOW_CREATE)
  }

  onStartLogin () {
    this.props.startFlow(Constants.WORKFLOW_PASSWORD)
  }
}
