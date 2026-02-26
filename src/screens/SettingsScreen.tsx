/**
 * Settings Screen
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';
import { useOnboarding } from '../hooks/useOnboarding';
import { useSettings } from '../hooks/useSettings';

export function SettingsScreen({ navigation }: any) {
  const { resetOnboarding } = useOnboarding();
  const { settings, toggleSimpleMode, toggleHaptic, toggleAutoLocation } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Interface Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INTERFACE</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Simple Mode</Text>
              <Text style={styles.settingDescription}>
                Show friendly sun animation instead of detailed readings
              </Text>
            </View>
            <Switch
              value={settings.simpleMode}
              onValueChange={toggleSimpleMode}
              trackColor={{ 
                false: theme.colors.surfaceBorder, 
                true: theme.colors.primaryMuted 
              }}
              thumbColor={settings.simpleMode ? theme.colors.primary : theme.colors.textMuted}
            />
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>LOCATION</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto-detect location</Text>
              <Text style={styles.settingDescription}>
                Use GPS for accurate sun position
              </Text>
            </View>
            <Switch
              value={settings.autoLocation}
              onValueChange={toggleAutoLocation}
              trackColor={{ 
                false: theme.colors.surfaceBorder, 
                true: theme.colors.primaryMuted 
              }}
              thumbColor={settings.autoLocation ? theme.colors.primary : theme.colors.textMuted}
            />
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FEEDBACK</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Haptic feedback</Text>
              <Text style={styles.settingDescription}>
                Vibrate when approaching optimal alignment
              </Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={toggleHaptic}
              trackColor={{ 
                false: theme.colors.surfaceBorder, 
                true: theme.colors.primaryMuted 
              }}
              thumbColor={settings.hapticEnabled ? theme.colors.primary : theme.colors.textMuted}
            />
          </View>
        </View>

        {/* Developer Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DEVELOPER</Text>
          
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={resetOnboarding}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Reset Onboarding</Text>
              <Text style={styles.settingDescription}>
                Show the tutorial again on next launch
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
          
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>Panel Pal</Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            <Text style={styles.aboutDescription}>
              Optimize your solar panel alignment using your phone's sensors 
              and location-based sun position calculations.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  backButtonText: {
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    color: theme.colors.textMuted,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  aboutCard: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  aboutVersion: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  aboutDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 16,
    lineHeight: 22,
  },
});