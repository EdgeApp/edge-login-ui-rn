import { connect } from 'react-redux'
import { MyModal } from '../../components/common/'
import * as Constants from '../../../common/constants'
import * as actions from '../../../common/actions/index'
export const mapStateToProps = (state, ownProps) => {
  return {
    style: ownProps.style,
    headerText: 'PIN Changed',
    headerSubtext: 'PIN Successfully Changed',
    middleText: '',
    icon: Constants.EXCLAMATION,
    iconType: Constants.SIMPLE_ICONS,
    actionLabel: 'OK',
    cancelLabel: 'Cancel',
    singleButton: true
  }
}
export const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    cancel: () => {
      dispatch(actions.dispatchAction(Constants.CLOSE_NOTIFICATION_MODAL))
      dispatch(actions.cancel())
    },
    action: () => {
      dispatch(actions.dispatchAction(Constants.CLOSE_NOTIFICATION_MODAL))
      dispatch(actions.cancel())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MyModal)
