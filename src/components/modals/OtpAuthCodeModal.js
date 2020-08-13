// @flow

import { OTP_SMALL } from '../../assets/'
import s from '../../common/locales/strings.js'
import { type Dispatch, type RootState } from '../../types/ReduxTypes.js'
import { MyModal } from '../common/index.js'
import { connect } from '../services/ReduxStore.js'

type OwnProps = {
  middle: any,
  thinking: boolean,
  cancel(): void,
  action(): void
}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const { otpUserBackupKey } = state.login
  return {
    headerText: s.strings.otp_auth_code_header,
    modalMiddleComponent: ownProps.middle,
    image: OTP_SMALL,
    actionLabel: s.strings.done,
    cancelLabel: s.strings.cancel,
    hideCancelX: true,
    thinking: ownProps.thinking,
    singleCancelButton: !otpUserBackupKey || otpUserBackupKey.length < 16
  }
}
const mapDispatchToProps = (dispatch: Dispatch) => ({})

export const OtpAuthCodeModal = connect<
  $Call<typeof mapStateToProps, RootState, OwnProps>,
  $Call<typeof mapDispatchToProps, Dispatch>,
  OwnProps
>(
  mapStateToProps,
  mapDispatchToProps
)(MyModal)
