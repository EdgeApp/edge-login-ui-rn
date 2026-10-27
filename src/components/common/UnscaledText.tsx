import * as React from 'react'
import { Platform, Text, TextProps } from 'react-native'

export const UnscaledText: React.FC<TextProps> = props => {
  return (
    <Text
      allowFontScaling={false}
      {...props}
      // Android's new architecture ignores `minimumFontScale` when it shrinks
      // text to fit and floors at an illegible 4dp, so let labels truncate
      // there instead of shrinking, the same way `EdgeText` does:
      {...(Platform.OS === 'android' ? { adjustsFontSizeToFit: false } : null)}
    />
  )
}
