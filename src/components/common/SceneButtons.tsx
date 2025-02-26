/**
 * IMPORTANT: Changes in this file MUST be synced between edge-react-gui and
 * edge-login-ui-rn!
 */

import * as React from 'react'

import { ButtonsView, ButtonsViewProps } from '../buttons/ButtonsView'

interface Props extends Omit<Omit<ButtonsViewProps, 'parentType'>, 'layout'> {}

export const SceneButtons = (props: Props) => {
  return <ButtonsView {...props} parentType="scene" />
}
