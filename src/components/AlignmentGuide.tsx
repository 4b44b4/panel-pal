/**
 * Alignment Guide Component
 * 
 * Animated hand moving phone/panel to guide user
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { theme } from '../theme/theme';

interface AlignmentGuideProps {
  currentTilt: number;
  targetTilt: number;
  currentAzimuth: number;
  targetAzimuth: number;
}

export function AlignmentGuide({ 
  currentTilt, 
  targetTilt, 
  currentAzimuth, 
  targetAzimuth 
}: AlignmentGuideProps) {
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Animate the guide continuously
  useEffect(() => {
    const tiltAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(tiltAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const rotateAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    tiltAnimation.start();
    rotateAnimation.start();

    return () => {
      tiltAnimation.stop();
      rotateAnimation.stop();
    };
  }, [tiltAnim, rotateAnim]);

  // Calculate what guidance to show
  const tiltDiff = currentTilt - targetTilt;
  const azimuthDiff = Math.abs(currentAzimuth - targetAzimuth);
  const normalizedAzimuthDiff = azimuthDiff > 180 ? 360 - azimuthDiff : azimuthDiff;

  const needsTiltAdjust = Math.abs(tiltDiff) > 5;
  const needsRotateAdjust = normalizedAzimuthDiff > 10;

  // Animated rotation for the hand/phone
  const tiltTransform = tiltAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', tiltDiff > 0 ? '-20deg' : '20deg'],
  });

  const rotateTransform = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'],
  });

  // If well aligned, show checkmark
  if (!needsTiltAdjust && !needsRotateAdjust) {
    return (
      <View style={styles.container}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.alignedText}>Hold steady!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.phoneContainer,
          {
            transform: [
              { rotateX: needsTiltAdjust ? tiltTransform : '0deg' },
              { rotateZ: needsRotateAdjust ? rotateTransform : '0deg' },
            ],
          },
        ]}
      >
        {/* Hand */}
        <View style={styles.hand}>
          <Text style={styles.handEmoji}>🤚</Text>
        </View>
        
        {/* Phone/Panel */}
        <View style={styles.phone}>
          <View style={styles.phoneScreen}>
            <View style={styles.phoneSun} />
          </View>
        </View>
      </Animated.View>

      <Text style={styles.instruction}>
        {needsRotateAdjust && needsTiltAdjust
          ? 'Rotate and tilt panel'
          : needsRotateAdjust
          ? 'Rotate panel'
          : 'Tilt panel'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hand: {
    marginRight: -10,
    zIndex: 1,
  },
  handEmoji: {
    fontSize: 36,
    transform: [{ scaleX: -1 }],
  },
  phone: {
    width: 50,
    height: 70,
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.surfaceBorder,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneScreen: {
    width: 42,
    height: 58,
    backgroundColor: theme.colors.background,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneSun: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
  },
  instruction: {
    marginTop: 12,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  checkmark: {
    fontSize: 48,
    color: theme.colors.alignmentPerfect,
  },
  alignedText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.alignmentPerfect,
    fontWeight: '600',
  },
});