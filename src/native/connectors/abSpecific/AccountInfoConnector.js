// @flow

import { connect } from 'react-redux'

import { type RootState } from '../../../types/ReduxTypes'
import type { OwnProps } from '../../components/abSpecific/AccountInfoComponent.js'
import { AccountInfoComponent } from '../../components/abSpecific/AccountInfoComponent.js'

export const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  return {
    style: ownProps.style,
    username: state.create.username,
    password: state.create.password,
    pin: state.create.pin,
    passwordMessage: null
  }
}

export default connect(
  mapStateToProps,
  {}
)(AccountInfoComponent)
