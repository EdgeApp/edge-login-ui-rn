// @flow

import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { connect } from 'react-redux'

import {
  resetOtpReset,
  retryWithOtp
} from '../../../../common/actions/LoginAction.js'
import * as Constants from '../../../../common/constants'
import s from '../../../../common/locales/strings'
import OtpBackupKeyConnector from '../../../../native/connectors/componentConnectors/OtpBackupKeyConnector'
import { type Dispatch, type RootState } from '../../../../types/ReduxTypes.js'
import * as Styles from '../../../styles/index.js'
import { EdgeLoginQr } from '../../abSpecific/EdgeLoginQrComponent.js'
import { OtpHeroComponent } from '../../abSpecific/OtpHeroComponent'
import { Button, Header, StaticModal } from '../../common'
import SafeAreaView from '../../common/SafeAreaViewGradient.js'
import { DisableOtpModal } from '../../modals/DisableOtpModal.js'
import { OtpAuthCodeModal } from '../../modals/OtpAuthCodeModal.js'

type OwnProps = {}
type StateProps = {
  backupKeyError?: string,
  loginSuccess: boolean,
  otpResetDate: Date | null,
  screen: string
}
type DispatchProps = {
  goBack(): void,
  resetOtpToken(): void,
  setbackupKey(): void
}
type Props = OwnProps & StateProps & DispatchProps

type State = {
  showDisableModal: boolean,
  showBackupCodeModal: boolean,
  showDisableModal: boolean,
  showstaticModal: boolean,
  screen: string,
  backupKeyEntered: boolean
}

class OtpErrorScreenComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      showDisableModal: false,
      showBackupCodeModal: false,
      showstaticModal: false,
      screen: this.props.screen,
      backupKeyEntered: false
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.loginSuccess) {
      this.closeModals()
    }
    if (nextProps.backupKeyError) {
      this.setState({
        backupKeyEntered: false
      })
    }
  }

  componentWillUnMount() {
    this.closeModals()
  }

  closeModals() {
    this.setState({
      showDisableModal: false,
      showBackupCodeModal: false,
      showstaticModal: false,
      backupKeyEntered: false
    })
  }

  closeStaticModal() {
    this.setState({
      showstaticModal: false,
      screen: Constants.OTP_SCREEN_TWO
    })
  }

  sendCode() {
    this.setState({
      backupKeyEntered: true
    })
    this.props.setbackupKey()
  }

  disableOtp() {
    this.setState({
      showDisableModal: false,
      showstaticModal: true
    })
    this.props.resetOtpToken()
  }

  showBackupModal() {
    this.setState({
      showBackupCodeModal: true
    })
  }

  showDisableModal() {
    this.setState({
      showDisableModal: true
    })
  }

  getStaticBody(style: typeof OtpErrorScreenStyle) {
    return (
      <Text style={style.staticModalText}>
        {s.strings.otp_dispable_req_sent}
      </Text>
    )
  }

  renderModal(style: typeof OtpErrorScreenStyle) {
    if (this.state.showBackupCodeModal) {
      const middle = (
        <View style={style.modalMiddle}>
          <Text style={style.staticModalText}>
            {s.strings.otp_instructions}
          </Text>
          <OtpBackupKeyConnector
            style={style.modalInput}
            onSubmitEditing={this.sendCode.bind(this)}
          />
          <View style={style.shim} />
        </View>
      )
      return (
        <OtpAuthCodeModal
          cancel={this.closeModals.bind(this)}
          action={this.sendCode.bind(this)}
          middle={middle}
          thinking={this.state.backupKeyEntered}
        />
      )
    }
    if (this.state.showDisableModal) {
      return (
        <DisableOtpModal
          cancel={this.closeModals.bind(this)}
          action={this.disableOtp.bind(this)}
        />
      )
    }
    if (this.state.showstaticModal) {
      return (
        <StaticModal
          cancel={this.closeStaticModal.bind(this)}
          body={this.getStaticBody(style)}
          modalDismissTimerSeconds={8}
        />
      )
    }
    return null
  }

  renderDisableButton(style: typeof OtpErrorScreenStyle) {
    if (this.state.screen === Constants.OTP_SCREEN_ONE) {
      return (
        <Button
          onPress={this.showDisableModal.bind(this)}
          downStyle={style.exitButton.downStyle}
          downTextStyle={style.exitButton.downTextStyle}
          upStyle={style.exitButton.upStyle}
          upTextStyle={style.exitButton.upTextStyle}
          label={s.strings.disable_otp_button_two}
        />
      )
    }
    return null
  }

  render() {
    return (
      <SafeAreaView>
        <View style={OtpErrorScreenStyle.screen}>
          <Header
            goBack={this.props.goBack}
            showBackButton
            showSkipButton={false}
            style={OtpErrorScreenStyle.header}
            subTitle=""
            title={s.strings.otp_header}
          />
          <View style={OtpErrorScreenStyle.pageContainer}>
            <OtpHeroComponent
              style={OtpErrorScreenStyle.hero}
              screen={this.state.screen}
              otpResetDate={this.props.otpResetDate}
            />
            <View style={OtpErrorScreenStyle.qrRow}>
              <EdgeLoginQr />
            </View>
            <View style={OtpErrorScreenStyle.shim} />
            <Button
              onPress={this.showBackupModal.bind(this)}
              downStyle={OtpErrorScreenStyle.exitButton.downStyle}
              downTextStyle={OtpErrorScreenStyle.exitButton.downTextStyle}
              upStyle={OtpErrorScreenStyle.exitButton.upStyle}
              upTextStyle={OtpErrorScreenStyle.exitButton.upTextStyle}
              label={s.strings.type_auth_button}
            />
            {this.renderDisableButton(OtpErrorScreenStyle)}
          </View>
          {this.renderModal(OtpErrorScreenStyle)}
        </View>
      </SafeAreaView>
    )
  }
}

const OtpErrorScreenStyle = {
  screen: { ...Styles.ScreenStyle },
  header: {
    ...Styles.HeaderContainerScaledStyle
  },
  pageContainer: {
    ...Styles.PageContainerWithHeaderStyle,
    alignItems: 'center'
  },
  hero: {
    container: {
      position: 'relative',
      width: '100%'
    },
    colorField: {
      position: 'relative',
      width: '100%',
      height: 100,
      backgroundColor: Constants.GRAY_3,
      flexDirection: 'row',
      paddingTop: 20
    },
    leftField: {
      flex: 2,
      paddingRight: 10,
      paddingTop: 2,
      alignItems: 'flex-end'
    },
    rightField: {
      flex: 8
    },
    heroTitleText: {
      color: Constants.PRIMARY,
      fontSize: 17
    },
    heroText: {
      color: Constants.GRAY_1,
      fontSize: 14,
      marginTop: 7
    },
    orOption: {
      position: 'relative',
      height: 100,
      width: '100%',
      backgroundColor: Constants.WHITE
    },
    orRow: {
      height: 48,
      alignItems: 'center',
      justifyContent: 'space-around'
    },
    instructionsRow: {
      height: 52
    },
    instructionsText: {
      width: '90%',
      textAlign: 'center',
      marginLeft: '5%',
      marginRight: '5%',
      color: Constants.GRAY_1
    },
    shim: { ...Styles.Shim, height: 20 }
  },
  shim: { ...Styles.Shim, height: 20 },
  qrRow: {
    position: 'relative',
    width: '100%',
    height: 150
  },
  exitButton: {
    upStyle: Styles.TextOnlyButtonUpStyle,
    upTextStyle: { ...Styles.TextOnlyButtonTextUpStyle, width: 'auto' },
    downTextStyle: { ...Styles.TextOnlyButtonTextDownStyle, width: 'auto' },
    downStyle: Styles.TextOnlyButtonDownStyle
  },
  staticModalText: {
    color: Constants.GRAY_1,
    width: '100%',
    fontSize: 15,
    textAlign: 'center'
  },
  modalMiddle: {
    position: 'relative',
    width: '100%'
  },
  modalInput: {
    ...Styles.MaterialInputOnWhite,
    container: {
      ...Styles.MaterialInputOnWhite.container,
      width: '100%'
    }
  }
}

export const OtpErrorScreen = connect(
  (state: RootState): StateProps => {
    const otpResetDate = state.login.otpResetDate
    const screen = otpResetDate
      ? Constants.OTP_SCREEN_TWO
      : Constants.OTP_SCREEN_ONE
    return {
      backupKeyError: state.login.otpErrorMessage || '',
      loginSuccess: state.login.loginSuccess,
      otpResetDate,
      screen
    }
  },
  (dispatch: Dispatch): DispatchProps => ({
    goBack() {
      dispatch({ type: 'WORKFLOW_START', data: Constants.WORKFLOW_PASSWORD })
    },
    resetOtpToken() {
      dispatch(resetOtpReset())
    },
    setbackupKey() {
      dispatch(retryWithOtp())
    }
  })
)(OtpErrorScreenComponent)
