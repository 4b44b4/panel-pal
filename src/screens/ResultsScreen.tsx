/**
 * Results Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

export function ResultsScreen({ navigation, route }: any) {
  const { score, azimuth, elevation, optimalAzimuth, optimalElevation } = route.params;

  const getScoreLabel = (score: number) => {
    if (score >= 95) return 'Perfect!';
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Work';
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return theme.colors.alignmentPerfect;
    if (score >= 85) return theme.colors.alignmentGood;
    if (score >= 70) return theme.colors.alignmentClose;
    if (score >= 50) return theme.colors.alignmentFar;
    return theme.colors.alignmentOff;
  };

  const azimuthDiff = azimuth - optimalAzimuth;
  const elevationDiff = elevation - optimalElevation;

  return (
    <SafeAreaView style={styles.container}>
      {/* Score Display */}
      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
          <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>{score}</Text>
          <Text style={styles.scorePercent}>%</Text>
        </View>
        <Text style={[styles.scoreLabel, { color: getScoreColor(score) }]}>
          {getScoreLabel(score)}
        </Text>
        <Text style={styles.scoreSubtext}>
          Solar Efficiency Rating
        </Text>
      </View>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>YOUR POSITION</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{azimuth.toFixed(1)}°</Text>
              <Text style={styles.detailName}>Azimuth</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{elevation.toFixed(1)}°</Text>
              <Text style={styles.detailName}>Elevation</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailCard}>
          <Text style={styles.detailLabel}>OPTIMAL POSITION</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{optimalAzimuth.toFixed(1)}°</Text>
              <Text style={styles.detailName}>Azimuth</Text>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailItem}>
              <Text style={styles.detailValue}>{optimalElevation.toFixed(1)}°</Text>
              <Text style={styles.detailName}>Elevation</Text>
            </View>
          </View>
        </View>

        {/* Adjustment Tips */}
        {score < 95 && (
          <View style={styles.tipCard}>
            <Text style={styles.tipLabel}>TO IMPROVE</Text>
            <Text style={styles.tipText}>
              {Math.abs(azimuthDiff) > 2 && 
                `Rotate ${azimuthDiff > 0 ? 'left' : 'right'} ${Math.abs(azimuthDiff).toFixed(0)}°`}
              {Math.abs(azimuthDiff) > 2 && Math.abs(elevationDiff) > 2 && ' and '}
              {Math.abs(elevationDiff) > 2 && 
                `tilt ${elevationDiff > 0 ? 'down' : 'up'} ${Math.abs(elevationDiff).toFixed(0)}°`}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.navigate('Alignment')}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>Done</Text>
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
  scoreContainer: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 32,
  },
  scoreCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: '200',
  },
  scorePercent: {
    fontSize: 24,
    color: theme.colors.textMuted,
    marginTop: 20,
  },
  scoreLabel: {
    fontSize: 32,
    fontWeight: '600',
    marginTop: 24,
  },
  scoreSubtext: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 16,
  },
  detailCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.surfaceBorder,
  },
  detailValue: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  detailName: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  tipCard: {
    backgroundColor: theme.colors.primaryMuted,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  tipLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  retryButton: {
    backgroundColor: theme.colors.surface,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  homeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});