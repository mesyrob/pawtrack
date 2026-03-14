import * as Haptics from 'expo-haptics'

export const hapticTap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
export const hapticSelect = () => Haptics.selectionAsync()
export const hapticSuccess = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
export const hapticError = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
