import type { ViewStyle } from 'react-native'

/**
 * A spreadable absolute-fill style that works on every host React Native.
 *
 * React Native 0.86 removed `StyleSheet.absoluteFillObject`, so spreading it
 * silently yields `{}` and any absolutely positioned background collapses to
 * nothing - blur sheets, button gradients, card backgrounds. Older React
 * Native type definitions declare `StyleSheet.absoluteFill` as a registered
 * style that cannot be spread, so neither export is safe across versions.
 */
export const absoluteFill: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0
}
