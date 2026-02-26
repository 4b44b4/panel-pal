/**
 * Simple Alignment Screen
 * 
 * Design: "Solar Observatory"
 * Retro-futuristic NASA control room meets modern glassmorphism
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { usePanelOrientation } from '../hooks/useDeviceOrientation';
import { useSunPosition } from '../hooks/useSunPosition';
import { calculateAlignmentGrade, getCardinalDirection } from '../utils/sunCalculations';

import { styles, sunStyles, dirStyles } from './SimpleAlignmentScreen.styles';

const { width } = Dimensions.get('window');

// ============================================
// SOLAR BODY COMPONENT
// ============================================
function SolarBody({ 
  grade, 
  azimuthDiff, 
  tiltDiff,
  normalizedScore,
}: { 
  grade: string; 
  azimuthDiff: number; 
  tiltDiff: number;
  normalizedScore: number;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const coronaAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotate.start();
    return () => rotate.stop();
  }, []);

  useEffect(() => {
    const flare = Animated.loop(
      Animated.sequence([
        Animated.timing(coronaAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(coronaAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    flare.start();
    return () => flare.stop();
  }, []);

  const baseSize = width * 0.45;
  const sunSize = baseSize * (0.6 + normalizedScore * 0.4);
  const warmth = normalizedScore;
  
  const coreColors: [string, string, string] = [
    `rgb(${255}, ${200 + warmth * 55}, ${150 * warmth})`,
    `rgb(${255}, ${160 + warmth * 60}, ${80 * warmth})`,
    `rgb(${230 + warmth * 25}, ${120 + warmth * 50}, ${50 * warmth})`,
  ];

  const coronaColor = `rgba(255, ${180 + warmth * 75}, ${50 + warmth * 100}, ${0.3 + warmth * 0.4})`;
  
  const horizontalTilt = Math.max(-25, Math.min(25, azimuthDiff * 0.2));
  const verticalTilt = Math.max(-15, Math.min(15, -tiltDiff * 0.3));

  const isHappy = grade === 'A' || grade === 'B';
  const isNeutral = grade === 'C';

  const coronaSpin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const coronaScale = coronaAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  return (
    <View style={sunStyles.container}>
      <Animated.View style={[
        sunStyles.coronaOuter,
        {
          width: sunSize * 2.2,
          height: sunSize * 2.2,
          borderRadius: sunSize * 1.1,
          opacity: 0.15 + normalizedScore * 0.25,
          transform: [{ scale: coronaScale }],
        }
      ]}>
        <LinearGradient
          colors={['transparent', coronaColor, 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>

      <Animated.View style={[
        sunStyles.coronaRays,
        {
          width: sunSize * 1.8,
          height: sunSize * 1.8,
          transform: [{ rotate: coronaSpin }],
        }
      ]}>
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              sunStyles.ray,
              {
                backgroundColor: coronaColor,
                height: sunSize * 0.4,
                width: sunSize * 0.08,
                transform: [
                  { rotate: `${i * 30}deg` },
                  { translateY: -sunSize * 0.7 },
                ],
                opacity: 0.6 + normalizedScore * 0.4,
              }
            ]}
          />
        ))}
      </Animated.View>

      <View style={[
        sunStyles.coronaMiddle,
        {
          width: sunSize * 1.4,
          height: sunSize * 1.4,
          borderRadius: sunSize * 0.7,
          backgroundColor: coronaColor,
        }
      ]} />

      <Animated.View style={[
        sunStyles.sunBody,
        {
          width: sunSize,
          height: sunSize,
          borderRadius: sunSize / 2,
          transform: [
            { scale: pulseAnim },
            { perspective: 800 },
            { rotateY: `${horizontalTilt}deg` },
            { rotateX: `${verticalTilt}deg` },
          ],
        }
      ]}>
        <LinearGradient
          colors={coreColors}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: sunSize / 2 }}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
        />
        
        <View style={[
          sunStyles.highlight,
          {
            width: sunSize * 0.6,
            height: sunSize * 0.4,
            borderRadius: sunSize * 0.3,
            top: sunSize * 0.1,
            left: sunSize * 0.15,
          }
        ]} />

        <View style={sunStyles.face}>
          <View style={sunStyles.eyes}>
            <View style={[sunStyles.eye, { width: sunSize * 0.12, height: sunSize * 0.14 }]}>
              <View style={[
                sunStyles.pupil,
                {
                  width: sunSize * 0.06,
                  height: sunSize * 0.06,
                  transform: [
                    { translateX: horizontalTilt * 0.3 },
                    { translateY: verticalTilt * 0.2 },
                  ],
                }
              ]} />
              <View style={[sunStyles.eyeShine, { width: sunSize * 0.025, height: sunSize * 0.025 }]} />
            </View>
            <View style={[sunStyles.eye, { width: sunSize * 0.12, height: sunSize * 0.14 }]}>
              <View style={[
                sunStyles.pupil,
                {
                  width: sunSize * 0.06,
                  height: sunSize * 0.06,
                  transform: [
                    { translateX: horizontalTilt * 0.3 },
                    { translateY: verticalTilt * 0.2 },
                  ],
                }
              ]} />
              <View style={[sunStyles.eyeShine, { width: sunSize * 0.025, height: sunSize * 0.025 }]} />
            </View>
          </View>

          {isHappy && (
            <View style={[
              sunStyles.mouthHappy,
              {
                width: sunSize * 0.25,
                height: sunSize * 0.13,
                borderBottomLeftRadius: sunSize * 0.15,
                borderBottomRightRadius: sunSize * 0.15,
              }
            ]} />
          )}
          {isNeutral && (
            <View style={[
              sunStyles.mouthNeutral,
              { width: sunSize * 0.15, height: sunSize * 0.02 }
            ]} />
          )}
          {!isHappy && !isNeutral && (
            <View style={[
              sunStyles.mouthSad,
              {
                width: sunSize * 0.2,
                height: sunSize * 0.1,
                borderTopLeftRadius: sunSize * 0.12,
                borderTopRightRadius: sunSize * 0.12,
              }
            ]} />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

// ============================================
// DIRECTION INDICATOR COMPONENT
// ============================================
function DirectionIndicator({ 
  azimuthDiff, 
  tiltDiff, 
  grade,
  pitch,
  isFixedPanel,
}: { 
  azimuthDiff: number; 
  tiltDiff: number; 
  grade: string;
  pitch: number;
  isFixedPanel: boolean;
}) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const tiltAnim = useRef(new Animated.Value(0)).current;
  const rotateOpacity = useRef(new Animated.Value(1)).current;
  const tiltOpacity = useRef(new Animated.Value(1)).current;
  const perfectScale = useRef(new Animated.Value(0)).current;
  
  const azimuthDiffRef = useRef(azimuthDiff);
  const tiltDiffRef = useRef(tiltDiff);
  azimuthDiffRef.current = azimuthDiff;
  tiltDiffRef.current = tiltDiff;
  
  const showRotate = Math.abs(azimuthDiff) > 22.5;
  const showTilt = !isFixedPanel && Math.abs(tiltDiff) > 10;
  const showPerfect = isFixedPanel ? grade === 'A' : (grade === 'A' && Math.abs(tiltDiff) <= 10);

// Rotate animation with fade
  useEffect(() => {
    if (showRotate) {
      rotateAnim.setValue(0);
      rotateOpacity.setValue(0);
      
      let loopRunning = true;
      
      const runAnimation = () => {
        if (!loopRunning) return;
        const direction = azimuthDiffRef.current > 0 ? 1 : -1;
        
        Animated.sequence([
          // Fade in while starting rotation
          Animated.parallel([
            Animated.timing(rotateOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: direction * 0.3,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          // Complete rotation
          Animated.timing(rotateAnim, {
            toValue: direction,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          // Fade out
          Animated.timing(rotateOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          // Reset rotation while invisible
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 1,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (loopRunning) runAnimation();
        });
      };
      
      runAnimation();
      
      return () => {
        loopRunning = false;
        rotateAnim.stopAnimation();
        rotateOpacity.stopAnimation();
      };
    } else {
      rotateOpacity.setValue(0);
    }
  }, [showRotate]);

  // Tilt animation with fade (matches rotate pill timings)
  useEffect(() => {
    if (showTilt) {
      tiltAnim.setValue(0);
      tiltOpacity.setValue(0);
      
      let loopRunning = true;
      
      const runAnimation = () => {
        if (!loopRunning) return;
        const direction = tiltDiffRef.current < 0 ? 1 : -1;
        
        Animated.sequence([
          // Fade in while starting tilt
          Animated.parallel([
            Animated.timing(tiltOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(tiltAnim, {
              toValue: direction * 0.3,
              duration: 400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          // Complete tilt
          Animated.timing(tiltAnim, {
            toValue: direction,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          // Fade out
          Animated.timing(tiltOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          // Reset tilt while invisible
          Animated.timing(tiltAnim, {
            toValue: 0,
            duration: 1,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (loopRunning) runAnimation();
        });
      };
      
      runAnimation();
      
      return () => {
        loopRunning = false;
        tiltAnim.stopAnimation();
        tiltOpacity.stopAnimation();
      };
    } else {
      tiltOpacity.setValue(0);
    }
  }, [showTilt]);

  useEffect(() => {
    if (showPerfect) {
      Animated.spring(perfectScale, {
        toValue: 1,
        friction: 4,
        tension: 100,
        useNativeDriver: true,
      }).start();
    } else {
      perfectScale.setValue(0);
    }
  }, [showPerfect]);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-45deg', '0deg', '45deg'],
  });

  const tiltInterpolate = tiltAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['45deg', '0deg', '-45deg'],
  });

  const pointRight = azimuthDiff > 0;
  const pastVertical = pitch > 90;
  const tiltUp = pastVertical ? false : tiltDiff < 0;

if (showPerfect) {
    return (
      <View style={dirStyles.container}>
        <Animated.View style={[
          dirStyles.perfectPill,
          {
            transform: [
              { scale: perfectScale },
              { perspective: 300 },
            ],
          }
        ]}>
          <Text style={dirStyles.perfectIcon}>✓</Text>
          <Text style={dirStyles.perfectText}>PERFECT</Text>
        </Animated.View>
      </View>
    );
  }
  
  if (!showRotate && !showTilt) {
    return null;
  }
  
  return (
    <View style={dirStyles.container}>
      {/* Tilt indicator at top */}
      {showTilt && (
        <View style={dirStyles.tiltPillWrapper}>
          <Animated.View style={[
            dirStyles.tiltPill,
            {
              opacity: tiltOpacity,
              transform: [
                { perspective: 300 },
                { rotateX: tiltInterpolate },
              ],
            }
          ]}>
            {tiltUp ? (
              <>
                <Text style={dirStyles.arrow}>↑</Text>
                <Text style={dirStyles.text}>TILT</Text>
                <Text style={dirStyles.text}>UP</Text>
              </>
            ) : (
              <>
                <Text style={dirStyles.text}>TILT</Text>
                <Text style={dirStyles.text}>DOWN</Text>
                <Text style={dirStyles.arrow}>↓</Text>
              </>
            )}
          </Animated.View>
        </View>
      )}
      
      {/* Rotate indicator at bottom */}
      {showRotate && (
        <Animated.View style={[
          dirStyles.rotatePill,
          {
            opacity: rotateOpacity,
            transform: [
              { perspective: 300 },
              { rotateY: rotateInterpolate },
            ],
          }
        ]}>
          {pointRight ? (
            <>
              <Text style={dirStyles.text}>ROTATE RIGHT</Text>
              <Text style={dirStyles.arrow}>→</Text>
            </>
          ) : (
            <>
              <Text style={dirStyles.arrow}>←</Text>
              <Text style={dirStyles.text}>ROTATE LEFT</Text>
            </>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// ============================================
// MAIN SCREEN COMPONENT
// ============================================
export function SimpleAlignmentScreen({ navigation, route }: any) {
  const orientation = usePanelOrientation(100);
  const sunData = useSunPosition();
  const isFixedPanel = route?.params?.panelType === 'fixed';
  
  const [grade, setGrade] = useState('E');
  const [gradeColor, setGradeColor] = useState('#ef4444');

  useEffect(() => {
    if (!orientation.isAvailable) return;

    const effectiveOptimalTilt = isFixedPanel ? orientation.tilt : sunData.optimalTilt;

    const gradeResult = calculateAlignmentGrade(
      orientation.azimuth,
      orientation.tilt,
      sunData.optimalAzimuth,
      effectiveOptimalTilt
    );
    
    setGrade(gradeResult.grade);
    setGradeColor(gradeResult.color);
  }, [
    orientation.azimuth,
    orientation.tilt,
    sunData.optimalAzimuth,
    sunData.optimalTilt,
    orientation.isAvailable,
    isFixedPanel,
  ]);

  let azimuthDiff = orientation.azimuth - sunData.optimalAzimuth;
  if (azimuthDiff > 180) azimuthDiff -= 360;
  if (azimuthDiff < -180) azimuthDiff += 360;
  
  const tiltDiff = orientation.tilt - sunData.optimalTilt;

  const gradeScores: Record<string, number> = { 'A': 1, 'B': 0.8, 'C': 0.6, 'D': 0.4, 'E': 0.2 };
  const normalizedScore = gradeScores[grade] || 0.2;

  const skyColors: [string, string, string, string] = normalizedScore > 0.7 
    ? ['#0a0a0f', '#1a1a24', '#e65b24', '#ff9a56']
    : normalizedScore > 0.4
    ? ['#0a0a0f', '#141419', '#2a2a35', '#e65b24']
    : ['#0a0a0f', '#141419', '#1c1c24', '#2a2a35'];

  const getStatusText = () => {
    if (grade === 'A') return 'OPTIMAL ALIGNMENT';
    if (grade === 'B') return 'NEARLY THERE';
    if (grade === 'C') return 'KEEP ADJUSTING';
    return 'NEEDS ALIGNMENT';
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={skyColors}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
          
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: gradeColor }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.sunArea}>
          <SolarBody 
            grade={grade} 
            azimuthDiff={azimuthDiff} 
            tiltDiff={tiltDiff}
            normalizedScore={normalizedScore}
          />
          <DirectionIndicator 
            azimuthDiff={azimuthDiff} 
            tiltDiff={tiltDiff} 
            grade={grade}
            pitch={orientation.pitch}
            isFixedPanel={isFixedPanel}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}