/**
 * Alignment Indicator Component - Simplified
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { theme } from '../theme/theme';

const { width } = Dimensions.get('window');
const INDICATOR_SIZE = width - 80;
const CENTER = INDICATOR_SIZE / 2;
const MAX_OFFSET = CENTER - 30;

interface AlignmentIndicatorProps {
  currentAzimuth: number;
  currentElevation: number;
  optimalAzimuth: number;
  optimalElevation: number;
  score: number;
}

export function AlignmentIndicator({
  currentAzimuth,
  currentElevation,
  optimalAzimuth,
  optimalElevation,
  score,
}: AlignmentIndicatorProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const azimuthDiff = currentAzimuth - optimalAzimuth;
  const elevationDiff = currentElevation - optimalElevation;

  const normalizeOffset = (diff: number, maxDegrees: number = 30) => {
    const normalized = (diff / maxDegrees) * MAX_OFFSET;
    return Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, normalized));
  };

  const dotX = CENTER + normalizeOffset(azimuthDiff);
  const dotY = CENTER - normalizeOffset(elevationDiff);

  const getDotColor = () => {
    if (score >= 95) return theme.colors.alignmentPerfect;
    if (score >= 85) return theme.colors.alignmentGood;
    if (score >= 70) return theme.colors.alignmentClose;
    if (score >= 50) return theme.colors.alignmentFar;
    return theme.colors.alignmentOff;
  };

  const isCloseToTarget = score >= 85;

  useEffect(() => {
    if (isCloseToTarget) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();

      return () => {
        animation.stop();
      };
    } else {
      pulseAnim.setValue(1);
    }
  }, [isCloseToTarget, pulseAnim]);

  const dotColor = getDotColor();

  return (
    <View style={styles.container}>
      {/* Background rings using View */}
      {[0.9, 0.7, 0.5, 0.3, 0.15].map((scale, index) => (
        <View
          key={index}
          style={[
            styles.ring,
            {
              width: MAX_OFFSET * 2 * scale,
              height: MAX_OFFSET * 2 * scale,
              borderRadius: MAX_OFFSET * scale,
              opacity: 0.1 + index * 0.05,
            },
          ]}
        />
      ))}

      {/* Crosshairs */}
      <View style={styles.crosshairVertical} />
      <View style={styles.crosshairHorizontal} />

      {/* Target center */}
      <View style={styles.targetOuter} />
      <View style={styles.targetInner} />

      {/* Current position dot */}
      <Animated.View
        style={[
          styles.dot,
          {
            backgroundColor: dotColor,
            left: dotX - 15,
            top: dotY - 15,
            transform: [{ scale: pulseAnim }],
            shadowColor: dotColor,
          },
        ]}
      >
        <View style={[styles.dotInner, { backgroundColor: dotColor }]} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  crosshairVertical: {
    position: 'absolute',
    width: 1,
    height: MAX_OFFSET * 2,
    backgroundColor: theme.colors.surfaceBorder,
    opacity: 0.3,
  },
  crosshairHorizontal: {
    position: 'absolute',
    width: MAX_OFFSET * 2,
    height: 1,
    backgroundColor: theme.colors.surfaceBorder,
    opacity: 0.3,
  },
  targetOuter: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    opacity: 0.8,
  },
  targetInner: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    opacity: 0.8,
  },
  dot: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  dotInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
});