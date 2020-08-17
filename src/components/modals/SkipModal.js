// @flow

import s from '../../common/locales/strings.js'
import * as Constants from '../../constants/index.js'
import { type Dispatch, type RootState } from '../../types/ReduxTypes.js'
import { MyModal } from '../common/index.js'
import { connect } from '../services/ReduxStore.js'

const mapStateToProps = (state: RootState) => ({
  headerText: s.strings.skip_modal_header,
  middleText: s.strings.skip_modal_body,
  icon: Constants.EXCLAMATION,
  iconType: Constants.SIMPLE_ICONS,
  actionLabel: s.strings.skip,
  cancelLabel: s.strings.cancel
})
const mapDispatchToProps = (dispatch: Dispatch) => ({
  cancel: () => dispatch({ type: 'WORKFLOW_CANCEL_MODAL' }),
  action: () => dispatch({ type: 'WORKFLOW_NEXT' })
})

export const SkipModal = connect<
  $Call<typeof mapStateToProps, RootState>,
  $Call<typeof mapDispatchToProps, Dispatch>,
  {}
>(
  mapStateToProps,
  mapDispatchToProps
)(MyModal)
