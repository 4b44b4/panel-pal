/**
 * Home Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme/theme';

const FIXED_PANEL_EXAMPLE = {
  title: 'Fixed Panel Example',
  emoji: '🔦',
  description: 'Solar garden lights with integrated panels. The panel is built into the light fixture at a fixed angle—common in path lights, stake lights, and decorative solar lamps.',
};

const REMOTE_PANEL_EXAMPLE = {
  title: 'Remote Panel Example',
  emoji: '💡',
  description: 'Solar lights with a separate panel connected by cable. The panel can be angled for optimal sun exposure while the light sits in shade—common in spot lights and security lights.',
};

type UIStyle = 'sun' | 'starlink';

export function HomeScreen({ navigation }: any) {
  const [exampleModal, setExampleModal] = useState<'fixed' | 'remote' | null>(null);
  const [uiStyle, setUIStyle] = useState<UIStyle>('starlink');

  const alignmentRoute = uiStyle === 'starlink' ? 'StarlinkAlignment' : 'SimpleAlignment';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.settingsIcon}>
            <View style={styles.settingsDot} />
            <View style={styles.settingsDot} />
            <View style={styles.settingsDot} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.brandContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>☀️</Text>
          </View>
          <Text style={styles.appName}>Panel Pal</Text>
          <Text style={styles.tagline}>Optimize your solar gain</Text>
        </View>

        {/* ── UI Style toggle (temporary dev option) ─────────────── */}
        <View style={styles.toggleWrap}>
          <Text style={styles.toggleLabel}>Interface</Text>
          <View style={styles.togglePill}>
            <TouchableOpacity
              style={[styles.toggleOption, uiStyle === 'sun' && styles.toggleOptionActive]}
              onPress={() => setUIStyle('sun')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleOptionText, uiStyle === 'sun' && styles.toggleOptionTextActive]}>
                ☀️  Classic
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleOption, uiStyle === 'starlink' && styles.toggleOptionActive]}
              onPress={() => setUIStyle('starlink')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleOptionText, uiStyle === 'starlink' && styles.toggleOptionTextActive]}>
                🛰  Starlink
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.optionButton}>
            <TouchableOpacity
              style={styles.optionButtonContent}
              onPress={() => navigation.navigate(alignmentRoute, { panelType: 'fixed' })}
              activeOpacity={0.8}
            >
              <Text style={styles.optionButtonText}>Fixed Panel</Text>
              <Text style={styles.optionButtonSubtext}>Panel is mounted at a fixed angle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tooltipButton}
              onPress={() => setExampleModal('fixed')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.tooltipIcon}>?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionButton}>
            <TouchableOpacity
              style={styles.optionButtonContent}
              onPress={() => navigation.navigate(alignmentRoute, { panelType: 'remote' })}
              activeOpacity={0.8}
            >
              <Text style={styles.optionButtonText}>Remote Panel</Text>
              <Text style={styles.optionButtonSubtext}>Adjust tilt and direction</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tooltipButton}
              onPress={() => setExampleModal('remote')}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.tooltipIcon}>?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <Modal
        visible={exampleModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setExampleModal(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setExampleModal(null)}
        >
          <Pressable
            style={styles.exampleModal}
            onPress={(e) => e.stopPropagation()}
          >
            {exampleModal && (
              <>
                <Text style={styles.exampleEmoji}>
                  {exampleModal === 'fixed' ? FIXED_PANEL_EXAMPLE.emoji : REMOTE_PANEL_EXAMPLE.emoji}
                </Text>
                <Text style={styles.exampleTitle}>
                  {exampleModal === 'fixed' ? FIXED_PANEL_EXAMPLE.title : REMOTE_PANEL_EXAMPLE.title}
                </Text>
                <Text style={styles.exampleDescription}>
                  {exampleModal === 'fixed' ? FIXED_PANEL_EXAMPLE.description : REMOTE_PANEL_EXAMPLE.description}
                </Text>
                <TouchableOpacity
                  style={styles.exampleCloseButton}
                  onPress={() => setExampleModal(null)}
                >
                  <Text style={styles.exampleCloseText}>Got it</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  settingsIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  settingsDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  toggleWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 4,
  },
  toggleOption: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 9,
  },
  toggleOptionActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  toggleOptionTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
  },
  optionButtonContent: {
    flex: 1,
  },
  tooltipButton: {
    width: 36,
    height: 36,
    marginLeft: 16,
    backgroundColor: theme.colors.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipIcon: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  optionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  optionButtonSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  exampleModal: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.surfaceBorder,
    padding: 24,
    maxWidth: 340,
    alignItems: 'center',
  },
  exampleEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  exampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  exampleDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  exampleCloseButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  exampleCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
});
