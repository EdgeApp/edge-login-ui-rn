import {
  TouchableWithoutFeedback,
  TouchableWithoutFeedbackProps
} from 'react-native'

import {
  ExtendedProps,
  withExtendedTouchable
} from '../hoc/withExtendedTouchable'

export const EdgeTouchableWithoutFeedback: React.FC<
  TouchableWithoutFeedbackProps & { children?: React.ReactNode } & ExtendedProps
> = withExtendedTouchable(TouchableWithoutFeedback)
