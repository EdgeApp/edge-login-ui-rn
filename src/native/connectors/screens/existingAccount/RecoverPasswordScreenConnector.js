import { connect } from 'react-redux'
import LinkedComponent from '../../../components/screens/existingAccout/RecoverPasswordScreenComponent.js'

import * as actions from '../../../../common/actions'
import * as Constants from '../../../../common/constants'
export const mapStateToProps = (state, ownProps) => {
  const isEnabled = state.passwordRecovery.userQuestions.length > 0 || false
  const question1 =
    state.passwordRecovery.userQuestions.length > 0
      ? state.passwordRecovery.userQuestions[0]
      : 'Choose recovery question'
  const question2 =
    state.passwordRecovery.userQuestions.length > 1
      ? state.passwordRecovery.userQuestions[1]
      : 'Choose recovery question'
  const username = returnTrunatedUsername(state.login.username)
  return {
    styles: ownProps.styles,
    showHeader: ownProps.showHeader,
    questionsList: state.passwordRecovery.questionsList,
    userQuestions: state.passwordRecovery.userQuestions,
    question1,
    question2,
    submitButton: 'Submit',
    disableButton: 'Disable',
    isEnabled,
    username,
    backupKey: state.passwordRecovery.recoveryKey,
    showEmailDialog: state.passwordRecovery.showRecoveryEmailDialog
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    submit: (questions, answers) =>
      dispatch(actions.changeRecoveryAnswers(questions, answers)),
    deleteRecovery: () => dispatch(actions.deleteRecovery()),
    cancel: () => {
      dispatch(actions.deleteRecovery())
      dispatch(actions.cancelRecoverySettingsScene())
      dispatch(actions.dispatchAction(Constants.DISMISS_EMAIL_MODAL))
    },
    returnToSettings: () => dispatch(actions.cancelRecoverySettingsScene())
  }
}

function returnTrunatedUsername (arg) {
  if (arg) {
    return arg.charAt(0) + arg.charAt(1) + '***'
  }
  return arg
}
export default connect(mapStateToProps, mapDispatchToProps)(LinkedComponent)

/*
// @flow
import {connect} from 'react-redux'
import * as SETTINGS_SELECTORS from '../../modules/UI/Settings/selectors.js'
import type {Dispatch, State} from '../../modules/ReduxTypes'
import PasswordRecoveryComponent from '../../modules/UI/scenes/PasswordRecovery/PasswordRecoveryComponent.ui'
// import * as Constants from '../../constants/indexConstants.js'

export const mapStateToProps = (state: State) => {
  return {
    recoveryQuestions: SETTINGS_SELECTORS.getRecoveryQuestionChoices(state)
  }
}

export const mapDispatchToProps = (dispatch: Dispatch) => ({
  setAnswers: (obj: Object) => dispatch()
})

export default connect(mapStateToProps, mapDispatchToProps)(PasswordRecoveryComponent) */
