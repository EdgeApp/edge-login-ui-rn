// @flow

import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { connect } from 'react-redux'

import { loginWithRecovery } from '../../../../common/actions/LoginAction.js'
import { getRecoveryQuestions } from '../../../../common/actions/PasswordRecoveryActions.js'
import s from '../../../../common/locales/strings'
import SetRecoveryUsernameModalConnector from '../../../../native/connectors/abSpecific/SetRecoveryUsernameModalConnector'
import RecoverPasswordUsernameModalConnector from '../../../../native/connectors/componentConnectors/RecoverPasswordUsernameModalConnector'
import { type Dispatch, type RootState } from '../../../../types/ReduxTypes.js'
import HeaderConnector from '../../../connectors/componentConnectors/HeaderRecoverPasswordLogin.js'
import { Button, FormField, StaticModal } from '../../common/'
import SafeAreaViewGradient from '../../common/SafeAreaViewGradient.js'

type OwnProps = {
  styles: Object,
  showHeader: boolean
}
type StateProps = {
  loginError: string,
  question1: string,
  question2: string,
  showRecoverSuccessDialog: boolean,
  submitButton: string
}
type DispatchProps = {
  changePassword(): void,
  getQuestions(): void,
  onCancel(): void,
  submit(Array<string>): void,
  updateUsername(string): void
}
type Props = OwnProps & StateProps & DispatchProps

type State = {
  question1: string,
  question2: string,
  answer1: string,
  answer2: string,
  showQuestionPicker: boolean,
  focusFirst: boolean,
  focusSecond: boolean,
  errorOne: boolean,
  errorTwo: boolean,
  errorQuestionOne: boolean,
  errorQuestionTwo: boolean,
  disableConfirmationModal: boolean,
  showUsernameModal: boolean
}

class LoginWithRecoveryQuestionsScreenComponent extends Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props)
    this.state = {
      question1: this.props.question1,
      question2: this.props.question2,
      answer1: '',
      answer2: '',
      showQuestionPicker: false,
      focusFirst: false,
      focusSecond: false,
      errorOne: false,
      errorTwo: false,
      errorQuestionOne: false,
      errorQuestionTwo: false,
      disableConfirmationModal: false,
      showUsernameModal: true
    }
    this.props.updateUsername('')
  }

  renderHeader = (style: Object) => {
    if (this.props.showHeader) {
      return <HeaderConnector style={style.header} />
    }
    return null
  }

  onSubmit = () => {
    const errorOne = this.state.answer1.length < 1 || false
    const errorTwo = this.state.answer2.length < 1 || false

    this.setState({
      errorOne,
      errorTwo
    })
    if (errorOne || errorTwo) {
      return
    }
    const answers = [this.state.answer1, this.state.answer2]
    this.props.submit(answers)
  }

  setAnswer1 = (arg: string) => {
    this.setState({
      answer1: arg
    })
  }

  setAnswer2 = (arg: string) => {
    this.setState({
      answer2: arg
    })
  }

  renderModal = (styles: Object) => {
    if (this.props.showRecoverSuccessDialog) {
      // render static modal
      const body = (
        <Text style={styles.staticModalText}>
          {s.strings.recovery_successful}
        </Text>
      )
      return (
        <StaticModal
          cancel={this.props.changePassword}
          body={body}
          modalDismissTimerSeconds={8}
        />
      )
    }
    if (!this.state.showUsernameModal) return null
    const middle = (
      <View style={styles.modalMiddle}>
        <Text style={styles.staticModalText}>
          {s.strings.recover_by_username}
        </Text>
        <RecoverPasswordUsernameModalConnector
          style={styles.inputModal}
          onSubmitEditing={this.props.getQuestions}
        />
      </View>
    )
    return (
      <SetRecoveryUsernameModalConnector
        modalMiddleComponent={middle}
        cancel={this.props.onCancel}
        action={this.props.getQuestions}
      />
    )
  }

  renderError(styles: Object) {
    if (this.props.loginError) {
      return (
        <View>
          <View style={styles.shim} />
          <Text style={styles.errorText}>{this.props.loginError}</Text>
          <View style={styles.shim} />
        </View>
      )
    }
    return <View style={styles.shim} />
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.question1 !== this.props.question1) {
      this.setState({
        question1: nextProps.question1,
        question2: nextProps.question2,
        showUsernameModal: false
      })
    }
  }

  render() {
    const { LoginWithRecoveryStyles } = this.props.styles
    // const middle = this.renderForm(RecoverPasswordSceneStyles)
    const styles = LoginWithRecoveryStyles
    const form1Style = this.state.errorOne ? styles.inputError : styles.input
    const form2Style = this.state.errorTwo ? styles.inputError : styles.input

    return (
      <SafeAreaViewGradient>
        <View style={styles.screen}>
          {this.renderHeader(styles)}
          <View style={styles.body}>
            <View style={styles.questionRow}>
              <Text style={styles.questionText}>{this.props.question1}</Text>
            </View>
            <View style={styles.answerRow}>
              <FormField
                style={form1Style}
                autoFocus={this.state.focusFirst}
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={this.setAnswer1}
                value={this.state.answer1}
                label={s.strings.your_answer_label}
                error={s.strings.answer_case_sensitive}
              />
            </View>
            <View style={styles.shim} />
            <View style={styles.questionRow}>
              <Text style={styles.questionText}>{this.props.question2}</Text>
            </View>
            <View style={styles.answerRow}>
              <FormField
                style={form2Style}
                autoFocus={this.state.focusSecond}
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={this.setAnswer2}
                value={this.state.answer2}
                label={s.strings.your_answer_label}
                error={s.strings.answer_case_sensitive}
              />
            </View>
            <View style={styles.buttonContainer}>
              {this.renderError(styles)}
              <Button
                onPress={this.onSubmit}
                downStyle={styles.submitButton.downStyle}
                downTextStyle={styles.submitButton.downTextStyle}
                upStyle={styles.submitButton.upStyle}
                upTextStyle={styles.submitButton.upTextStyle}
                label={this.props.submitButton}
              />
            </View>
          </View>
          {this.renderModal(styles)}
        </View>
      </SafeAreaViewGradient>
    )
  }
}

export const LoginWithRecoveryQuestionsScreen = connect(
  (state: RootState): StateProps => ({
    loginError: state.login.errorMessage || '',
    question1:
      state.passwordRecovery.userQuestions.length > 0
        ? state.passwordRecovery.userQuestions[0]
        : s.strings.choose_recovery_question,
    question2:
      state.passwordRecovery.userQuestions.length > 1
        ? state.passwordRecovery.userQuestions[1]
        : s.strings.choose_recovery_question,
    showHeader: true,
    showRecoverSuccessDialog: state.login.showRecoverSuccessDialog,
    submitButton: s.strings.submit
  }),
  (dispatch: Dispatch): DispatchProps => ({
    changePassword() {
      dispatch({ type: 'WORKFLOW_NEXT' })
    },
    getQuestions() {
      dispatch(getRecoveryQuestions())
    },
    onCancel() {
      dispatch({ type: 'CANCEL_RECOVERY_KEY' })
    },
    submit(answers: Array<string>) {
      dispatch(loginWithRecovery(answers))
    },
    updateUsername(username: string) {
      dispatch({ type: 'AUTH_UPDATE_USERNAME', data: username })
    }
  })
)(LoginWithRecoveryQuestionsScreenComponent)
