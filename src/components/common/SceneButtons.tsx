/**
 * IMPORTANT: Changes in this file MUST be synced between edge-react-gui and
 * edge-login-ui-rn!
 */

import * as React from 'react'

import { ButtonsViewUi4, ButtonsViewUi4Props } from '../ui4/ButtonsViewUi4'

interface Props
  extends Omit<Omit<ButtonsViewUi4Props, 'parentType'>, 'layout'> {}

export const SceneButtons = (props: Props) => {
  return <ButtonsViewUi4 {...props} parentType="scene" />
}
