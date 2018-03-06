// @flow
import React, { Component } from 'react'
import { View } from 'react-native'
import { BackgroundImage, Spinner } from '../common'
import * as Assets from '../../assets/'

type Props = {
  styles: Object
}

export default class LoadingScreenComponent extends Component<Props> {
  render () {
    const { LandingScreenStyle } = this.props.styles
    return (
      <View style={LandingScreenStyle.container}>
        <BackgroundImage
          src={Assets.LOGIN_BACKGROUND}
          style={LandingScreenStyle.backgroundImage}
          content={this.renderSpinner()}
        />
      </View>
    )
  }

  renderSpinner = () => {
    const { CenteredSpinnerStyle } = this.props.styles
    return <Spinner style={CenteredSpinnerStyle} />
  }
}
