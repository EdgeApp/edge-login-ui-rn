import { connect } from 'react-redux'
import { MyModal } from '../../components/common/'
import * as actions from '../../../common/actions'
import * as Constants from '../../../common/constants'

export const mapStateToProps = (state, ownProps) => {
  const middleText =
    'Delete ' +
    ownProps.username +
    ' on this device? This will disable access via PIN. If 2FA is enabled on this account, this device will not be able to login without a 2FA reset which takes 7 days.'
  return {
    headerText: 'Delete Account?',
    middleText,
    icon: Constants.TRASH_O,
    iconType: Constants.FONT_AWESOME,
    actionLabel: 'DELETE',
    cancelLabel: 'Cancel'
  }
}
export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    cancel: () => dispatch(actions.cancelSkipStep()),
    action: () => dispatch(actions.deleteUserFromDevice(ownProps.username))
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(MyModal)
