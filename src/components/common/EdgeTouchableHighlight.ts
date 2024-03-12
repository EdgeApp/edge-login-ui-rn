import { TouchableHighlight, TouchableHighlightProps } from 'react-native'

import {
  ExtendedProps,
  withExtendedTouchable
} from '../hoc/withExtendedTouchable'

export const EdgeTouchableHighlight: React.FC<
  TouchableHighlightProps & { children?: React.ReactNode } & ExtendedProps
> = withExtendedTouchable(TouchableHighlight)
