/* eslint-disable react/prop-types */
import {
  LinearGradient as ExpoLinearGradient,
  LinearGradientProps as ExpoLinearGradientProps
} from 'expo-linear-gradient'
import * as React from 'react'

export interface LinearGradientProps
  extends Omit<ExpoLinearGradientProps, 'colors' | 'locations'> {
  colors: string[]
  locations?: number[]
}

export const LinearGradient: React.FC<LinearGradientProps> = props => {
  const { colors, locations, ...rest } = props
  return (
    <ExpoLinearGradient
      {...rest}
      colors={(colors as unknown) as ExpoLinearGradientProps['colors']}
      locations={(locations as unknown) as ExpoLinearGradientProps['locations']}
    />
  )
}

export default LinearGradient
