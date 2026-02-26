/**
 * Data Readout Component
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface DataReadoutProps {
  label: string;
  value: string;
  unit: string;
  target?: number;
  targetLabel?: string;
  highlight?: boolean;
}

export function DataReadout({ 
  label, 
  value, 
  unit, 
  target, 
  targetLabel,
  highlight = false 
}: DataReadoutProps) {
  const numericValue = parseFloat(value);
  const diff = target !== undefined ? numericValue - target : 0;
  
  const getValueColor = () => {
    if (highlight) return theme.colors.primary;
    if (target === undefined) return theme.colors.textPrimary;
    
    const absDiff = Math.abs(diff);
    if (absDiff < 2) return theme.colors.alignmentPerfect;
    if (absDiff < 5) return theme.colors.alignmentGood;
    if (absDiff < 10) return theme.colors.alignmentClose;
    return theme.colors.textPrimary;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={[styles.value, { color: getValueColor() }]}>
          {value}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      {target !== undefined && (
        <Text style={styles.target}>
          Target: {targetLabel || `${target.toFixed(1)}${unit}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    minWidth: 80,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 28,
    fontWeight: '300',
    letterSpacing: -1,
  },
  unit: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginLeft: 2,
  },
  target: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});