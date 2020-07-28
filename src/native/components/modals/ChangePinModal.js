// @flow

import { connect } from 'react-redux'

import { cancel } from '../../../actions/WorkflowActions.js'
import s from '../../../common/locales/strings.js'
import * as Constants from '../../../constants/index.js'
import { type Dispatch, type RootState } from '../../../types/ReduxTypes.js'
import { MyModal } from '../common/index.js'

const mapStateToProps = (state: RootState) => {
  return {
    headerText: s.strings.pin_changed,
    headerSubtext: s.strings.pin_successfully_changed,
    middleText: '',
    icon: Constants.EXCLAMATION,
    iconType: Constants.SIMPLE_ICONS,
    actionLabel: s.strings.ok,
    cancelLabel: s.strings.cancel,
    singleButton: true
  }
}
const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    cancel: () => {
      dispatch({ type: 'CLOSE_NOTIFICATION_MODAL' })
      dispatch(cancel())
    },
    action: () => {
      dispatch({ type: 'CLOSE_NOTIFICATION_MODAL' })
      dispatch(cancel())
    }
  }
}

export const ChangePinModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(MyModal)
