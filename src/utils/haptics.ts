/**
 * Haptic Feedback Utilities
 * 
 * MILESTONE 1 - Sensors & Location
 * =================================
 * Provides haptic feedback as user approaches optimal alignment.
 */

import * as Haptics from 'expo-haptics';

export type HapticIntensity = 'off' | 'light' | 'medium' | 'heavy' | 'success';

export function getHapticIntensity(score: number): HapticIntensity {
  if (score >= 95) return 'success';
  if (score >= 85) return 'heavy';
  if (score >= 70) return 'medium';
  if (score >= 50) return 'light';
  return 'off';
}

export async function triggerAlignmentHaptic(score: number): Promise<void> {
  const intensity = getHapticIntensity(score);
  
  switch (intensity) {
    case 'success':
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'heavy':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'medium':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'light':
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'off':
    default:
      break;
  }
}

export async function triggerSelectionHaptic(): Promise<void> {
  await Haptics.selectionAsync();
}

export async function triggerSuccessHaptic(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export async function triggerWarningHaptic(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export async function triggerErrorHaptic(): Promise<void> {
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
}

let lastHapticScore = 0;
let lastHapticTime = 0;
const HAPTIC_COOLDOWN = 300;

export async function updateAlignmentHaptic(
  score: number,
  enabled: boolean = true
): Promise<void> {
  if (!enabled) return;
  
  const now = Date.now();
  const timeSinceLastHaptic = now - lastHapticTime;
  
  if (timeSinceLastHaptic < HAPTIC_COOLDOWN) return;
  
  const scoreDiff = Math.abs(score - lastHapticScore);
  const crossedThreshold = 
    (lastHapticScore < 95 && score >= 95) ||
    (lastHapticScore < 85 && score >= 85) ||
    (lastHapticScore < 70 && score >= 70);
  
  if (scoreDiff >= 5 || crossedThreshold) {
    await triggerAlignmentHaptic(score);
    lastHapticScore = score;
    lastHapticTime = now;
  }
}

export function resetHapticState(): void {
  lastHapticScore = 0;
  lastHapticTime = 0;
}