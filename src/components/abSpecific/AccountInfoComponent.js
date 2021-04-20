// @flow

import * as React from 'react'
import { Text, View } from 'react-native'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'

import s from '../../common/locales/strings.js'
import * as Constants from '../../constants/index.js'
import { type Dispatch, type RootState } from '../../types/ReduxTypes.js'
import { TextAndIconButton } from '../common/TextAndIconButton.js'
import { connect } from '../services/ReduxStore.js'

type OwnProps = {
  style: Object,
  testID?: string
}
type StateProps = {
  username?: string,
  password?: string,
  pin: string
}
type Props = OwnProps & StateProps

type State = {
  collapsed: boolean
}

class AccountInfoComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      collapsed: true
    }
  }

  renderPasswordWarning(style: Object) {
    if (!this.props.password) {
      return (
        <View style={style.bottomWarning}>
          <Text style={style.bottomWarningText}>
            {s.strings.account_info_warning}
          </Text>
          <View style={style.shim} />
        </View>
      )
    }
    return null
  }

  renderAccountInfo(style: Object) {
    if (!this.props.password) {
      return (
        <View
          style={[
            style.bottomInfo,
            !this.props.password && {
              ...style.bottomInfo,
              borderBottomColor: Constants.TRANSPARENT
            }
          ]}
        >
          <View style={style.shim} />
          <View style={style.bRow}>
            <View style={style.bInfoLeft} />
            <View style={style.bInfoCenter}>
              <Text style={style.accountText}>{s.strings.username}:</Text>
            </View>
            <View style={style.bInforRight}>
              <Text style={style.accountText}>{this.props.username}</Text>
            </View>
          </View>
          <View style={style.bRow}>
            <View style={style.bInfoLeft} />
            <View style={style.bInfoCenter}>
              <Text style={style.accountText}>{s.strings.pin}:</Text>
            </View>
            <View style={style.bInforRight}>
              <Text style={style.accountText}>{this.props.pin}</Text>
            </View>
          </View>
          <View style={style.shim} />
        </View>
      )
    }
    return (
      <View style={style.bottomInfo}>
        <View style={style.shim} />
        <View style={style.bRow}>
          <View style={style.bInfoLeft} />
          <View style={style.bInfoCenter}>
            <Text style={style.accountText}>{s.strings.username}:</Text>
          </View>
          <View style={style.bInforRight}>
            <Text style={style.accountText}>{this.props.username}</Text>
          </View>
        </View>
        <View style={style.bRow}>
          <View style={style.bInfoLeft} />
          <View style={style.bInfoCenter}>
            <Text style={style.accountText}>{s.strings.password}:</Text>
          </View>
          <View style={style.bInforRight}>
            <Text style={style.accountText}>{this.props.password}</Text>
          </View>
        </View>
        <View style={style.bRow}>
          <View style={style.bInfoLeft} />
          <View style={style.bInfoCenter}>
            <Text style={style.accountText}>{s.strings.pin}:</Text>
          </View>
          <View style={style.bInforRight}>
            <Text style={style.accountText}>{this.props.pin}</Text>
          </View>
        </View>
        <View style={style.shim} />
      </View>
    )
  }

  renderBottom(style: Object) {
    if (!this.state.collapsed) {
      return (
        <View style={style.bottom}>
          {this.renderAccountInfo(style)}
          {this.renderPasswordWarning(style)}
        </View>
      )
    }
    return <View style={style.bottom} />
  }

  renderTop(style: Object) {
    const msg = this.state.collapsed
      ? s.strings.show_account_info
      : s.strings.hide_account_info
    const icon = this.state.collapsed ? (
      <MaterialIcon
        style={style.textIconButton.icon}
        name="keyboard-arrow-down"
        size={style.textIconButton.iconSize}
      />
    ) : (
      <MaterialIcon
        style={style.textIconButton.icon}
        name="keyboard-arrow-up"
        size={style.textIconButton.iconSize}
      />
    )

    return (
      <View style={style.top}>
        <TextAndIconButton
          testID={this.props.testID}
          style={style.textIconButton}
          icon={icon}
          onPress={this.handlePress}
          title={msg}
        />
      </View>
    )
  }

  handlePress = () => {
    this.setState({
      collapsed: !this.state.collapsed
    })
  }

  render() {
    const Style = this.props.style
    return (
      <View
        style={[
          Style.container,
          !this.state.collapsed && {
            ...Style.container,
            borderWidth: 0,
            borderColor: Constants.GRAY_3
          }
        ]}
      >
        {this.renderTop(Style)}
        {this.renderBottom(Style)}
      </View>
    )
  }
}

export const AccountInfo = connect<StateProps, {}, OwnProps>(
  (state: RootState) => ({
    username: state.create.username || '',
    password: state.create.password || '',
    pin: state.create.pin
  }),
  (dispatch: Dispatch) => ({})
)(AccountInfoComponent)
