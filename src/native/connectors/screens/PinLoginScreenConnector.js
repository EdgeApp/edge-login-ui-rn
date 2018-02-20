import { connect } from 'react-redux'
import LinkedComponent from '../../components/screens/PinLogInScreenComponent'
import * as actions from '../../../common/actions'
import * as Constants from '../../../common/constants'

export const mapStateToProps = (state, ownProps) => {
  return {
    styles: ownProps.styles,
    username: state.login.username,
    loginSuccess: state.login.loginSuccess,
    previousUsers: state.previousUsers.userList,
    usersWithPin: state.previousUsers.usersWithPinList,
    workflow: state.workflow,
    showModal: state.workflow.showModal
  }
}

export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeUser: data =>
      dispatch(
        actions.dispatchActionWithData(Constants.AUTH_UPDATE_USERNAME, data)
      ),
    userLogin: data => dispatch(actions.userLoginWithPin(data)),
    launchUserLoginWithTouchId: data =>
      dispatch(actions.userLoginWithTouchId(data)),
    deleteUserFromDevice: data => dispatch(actions.deleteUserFromDevice(data)),
    launchDeleteModal: () =>
      dispatch(actions.dispatchAction(Constants.WORKFLOW_LAUNCH_MODAL)),
    gotoLoginPage: () =>
      dispatch(actions.startWorkflow(Constants.WORKFLOW_PASSWORD))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkedComponent)
