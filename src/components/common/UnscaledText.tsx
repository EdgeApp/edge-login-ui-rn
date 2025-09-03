import * as React from 'react'
import { Text, TextProps } from 'react-native'

export const UnscaledText: React.FC<TextProps> = props => {
  return <Text allowFontScaling={false} {...props} />
}
