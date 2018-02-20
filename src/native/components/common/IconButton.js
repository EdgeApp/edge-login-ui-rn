import React, { Component } from 'react'
import { View, TouchableHighlight } from 'react-native'
import { Icon } from './'
// import * as Constants from '../../../../constants/indexConstants'

/* type Props = {
  icon: string,
  style: any,
  onPress: Function,
  iconType: string
}
type State = {
  pressed: boolean
}
 */
class IconButton extends Component {
  /*   static defaultProps = {
    iconType: Constants.MATERIAL_ICONS
  }
  static propsTypes = {
    icon: PropTypes.string.isRequired,
    style: PropTypes.object.isRequired,
    onPress: PropTypes.func.isRequired,
    iconType: PropTypes.string.isRequired
  } */
  componentWillMount () {
    this.setState({
      pressed: false
    })
  }

  _onPressButton () {
    this.props.onPress()
  }
  _onShowUnderlay () {
    this.setState({
      pressed: true
    })
  }
  _onHideUnderlay () {
    this.setState({
      pressed: false
    })
  }
  renderIcon (icon, iconPressed, iconSize) {
    let style = icon
    if (this.state.pressed) {
      style = iconPressed
    }
    return (
      <Icon
        style={style}
        name={this.props.icon}
        size={iconSize}
        type={this.props.iconType}
      />
    )
  }

  render () {
    const {
      container,
      icon,
      iconPressed,
      iconSize,
      underlayColor
    } = this.props.style
    return (
      <TouchableHighlight
        style={container}
        onPress={this._onPressButton.bind(this)}
        onShowUnderlay={this._onShowUnderlay.bind(this)}
        onHideUnderlay={this._onHideUnderlay.bind(this)}
        underlayColor={underlayColor}
      >
        <View>{this.renderIcon(icon, iconPressed, iconSize)}</View>
      </TouchableHighlight>
    )
  }
}

export { IconButton }
