import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics'

export type HapticTriggerType = 'impactLight' | 'impactMedium' | 'impactHeavy'

const styles: Record<HapticTriggerType, ImpactFeedbackStyle> = {
  impactLight: ImpactFeedbackStyle.Light,
  impactMedium: ImpactFeedbackStyle.Medium,
  impactHeavy: ImpactFeedbackStyle.Heavy
}

export const triggerHaptic = (type: HapticTriggerType): void => {
  impactAsync(styles[type]).catch(() => {})
}
