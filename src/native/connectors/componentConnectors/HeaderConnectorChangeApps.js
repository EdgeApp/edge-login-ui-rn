// @flow

import { connect } from 'react-redux'

import { cancel } from '../../../common/actions/WorkflowActions.js'
import { type Dispatch, type RootState } from '../../../types/ReduxTypes'
import { Header } from '../../components/common/'

export const mapStateToProps = (state: RootState) => {
  const workflow = state.workflow
  const currentWorkflow = workflow[state.workflow.currentKey]
  const currentScene = currentWorkflow.details[state.workflow.currentSceneIndex]
  return {
    showBackButton: currentScene.back,
    showSkipButton: currentScene.skip,
    title: currentScene.title,
    subTitle: currentScene.subTitle,
    useCancel: true
  }
}

export const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    goBack: () => dispatch(cancel())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)
