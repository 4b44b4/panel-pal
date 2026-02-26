/**
 * Alignment Screen - With DataReadout
 */

import { AlignmentIndicator } from '../components/AlignmentIndicator';
import { AlignmentGuide } from '../components/AlignmentGuide';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { DataReadout } from '../components/DataReadout';

import { usePanelOrientation } from '../hooks/useDeviceOrientation';
import { useSunPosition } from '../hooks/useSunPosition';

import { calculateAlignmentScore, calculateAlignmentGrade, getCardinalDirection } from '../utils/sunCalculations';
import { updateAlignmentHaptic, resetHapticState, triggerSuccessHaptic } from '../utils/haptics';

function getAlignmentHint(azimuthDiff: number, tiltDiff: number): string {
  let azDiff = azimuthDiff;
  if (azDiff > 180) azDiff -= 360;
  if (azDiff < -180) azDiff += 360;

  const hints: string[] = [];

  if (Math.abs(azDiff) > 3) {
    hints.push(`Rotate ${azDiff > 0 ? 'left' : 'right'}`);
  }
  
  if (Math.abs(tiltDiff) > 3) {
    hints.push(`Tilt ${tiltDiff > 0 ? 'down' : 'up'}`);
  }

  if (hints.length === 0) {
    return 'Fine-tune your position...';
  }

  return hints.join(' and ');
}

export function AlignmentScreen({ navigation }: any) {
  const orientation = usePanelOrientation(100);
  const sunData = useSunPosition();
  
  const [score, setScore] = useState(0);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [isCalibrating, setIsCalibrating] = useState(true);
  const [showNightWarning, setShowNightWarning] = useState(true);
  const [grade, setGrade] = useState('E');
  const [gradeColor, setGradeColor] = useState(theme.colors.error);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCalibrating(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      resetHapticState();
    };
  }, []);

  useEffect(() => {
    if (isCalibrating || !orientation.isAvailable) return;

const newScore = calculateAlignmentScore(
      orientation.azimuth,
      orientation.tilt,
      sunData.optimalAzimuth,
      sunData.optimalTilt
    );
    
    const gradeResult = calculateAlignmentGrade(
      orientation.azimuth,
      orientation.tilt,
      sunData.optimalAzimuth,
      sunData.optimalTilt
    );
    
    setScore(newScore);
    setGrade(gradeResult.grade);
    setGradeColor(gradeResult.color);
    updateAlignmentHaptic(newScore, hapticEnabled);
  }, [
    orientation.azimuth,
    orientation.tilt,
    sunData.optimalAzimuth,
    sunData.optimalTilt,
    isCalibrating,
    hapticEnabled,
    orientation.isAvailable,
  ]);

  const handleLockPosition = useCallback(async () => {
    if (score >= 85) {
      await triggerSuccessHaptic();
    }
    
    navigation.navigate('Results', {
      score,
      azimuth: orientation.azimuth,
      elevation: orientation.tilt,
      optimalAzimuth: sunData.optimalAzimuth,
      optimalElevation: sunData.optimalTilt,
    });
  }, [score, orientation.azimuth, orientation.tilt, sunData.optimalAzimuth, sunData.optimalTilt, navigation]);

  const handleContinueAnyway = useCallback(() => {
    setShowNightWarning(false);
  }, []);

  if (sunData.isLoading || isCalibrating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            {sunData.isLoading ? 'Getting location...' : 'Calibrating sensors...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            Place phone flat on your panel
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (orientation.error || sunData.error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>
            {orientation.error || sunData.error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!sunData.isDay && showNightWarning) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.nightContainer}>
          <Text style={styles.nightIcon}>🌙</Text>
          <Text style={styles.nightTitle}>Sun Below Horizon</Text>
          <Text style={styles.nightText}>
            The sun is currently not visible at your location. 
            For best results, align your panel during daylight hours.
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinueAnyway}
          >
            <Text style={styles.continueButtonText}>Continue Anyway</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButtonSmall}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonSmallText}>← Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  

  const getScoreColor = () => {
    if (score >= 95) return theme.colors.alignmentPerfect;
    if (score >= 85) return theme.colors.alignmentGood;
    if (score >= 70) return theme.colors.alignmentClose;
    if (score >= 50) return theme.colors.alignmentFar;
    return theme.colors.alignmentOff;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Align Panel</Text>
          <Text style={styles.headerSubtitle}>
            {getCardinalDirection(sunData.optimalAzimuth)} • Sun at {sunData.sunElevation.toFixed(0)}°
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.headerButton, hapticEnabled && styles.headerButtonActive]}
          onPress={() => setHapticEnabled(!hapticEnabled)}
        >
          <Text style={styles.headerButtonText}>📳</Text>
        </TouchableOpacity>
      </View>
      {/* Animated Guide */}
      <AlignmentGuide
        currentTilt={orientation.tilt}
        targetTilt={sunData.optimalTilt}
        currentAzimuth={orientation.azimuth}
        targetAzimuth={sunData.optimalAzimuth}
      />
      {/* Alignment Indicator */}
      <View style={styles.alignmentContainer}>
        <AlignmentIndicator
          currentAzimuth={orientation.azimuth}
          currentElevation={orientation.tilt}
          optimalAzimuth={sunData.optimalAzimuth}
          optimalElevation={sunData.optimalTilt}
          score={score}
        />
      </View>

      {/* DataReadout components */}
      <View style={styles.dataContainer}>

<DataReadout
  label="Direction"
  value={getCardinalDirection(orientation.azimuth)}
  unit=""
  target={sunData.optimalAzimuth}
  targetLabel={getCardinalDirection(sunData.optimalAzimuth)}
/>
        <DataReadout
          label="Tilt"
          value={orientation.tilt.toFixed(1)}
          unit="°"
          target={sunData.optimalTilt}
        />
<DataReadout
  label="Grade"
  value={grade}
  unit=""
  highlight
/>
      </View>

      <View style={styles.hintContainer}>
        {score < 95 ? (
          <Text style={styles.hintText}>
            {getAlignmentHint(
              orientation.azimuth - sunData.optimalAzimuth,
              orientation.tilt - sunData.optimalTilt
            )}
          </Text>
        ) : (
          <Text style={[styles.hintText, styles.hintPerfect]}>
            ✓ Perfect alignment!
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.lockButton,
            score >= 90 && styles.lockButtonReady,
          ]}
          onPress={handleLockPosition}
          activeOpacity={0.8}
        >
          <Text style={styles.lockButtonText}>
            {score >= 90 ? 'Lock Position ✓' : 'Lock Position'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginTop: 24,
  },
  loadingSubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  retryButtonText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  nightContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  nightIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  nightTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  nightText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  continueButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  backButtonSmall: {
    padding: 16,
  },
  backButtonSmallText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  headerButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  headerButtonText: {
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  alignmentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  dataContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: theme.colors.surface,
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  hintContainer: {
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 50,
  },
  hintText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  hintPerfect: {
    color: theme.colors.alignmentPerfect,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  lockButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.surfaceBorder,
  },
  lockButtonReady: {
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.successMuted,
  },
  lockButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});