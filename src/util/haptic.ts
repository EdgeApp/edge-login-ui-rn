export type HapticTriggerType = 'impactLight' | 'impactMedium' | 'impactHeavy'

export const triggerHaptic = (type: HapticTriggerType) => {
  try {
    const ReactNativeHapticFeedback = require('react-native-haptic-feedback')
    ReactNativeHapticFeedback.trigger(type)
  } catch (_) {}
}
