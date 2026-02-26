/**
 * Panel Pal Theme System
 * 
 * MILESTONE 0 - LOCKED
 * ====================
 * Brand color: #e65b24 (Solar Orange)
 * Design: Minimal, dark, utilitarian
 */

export const theme = {
  colors: {
    // Brand
    primary: '#e65b24',
    primaryLight: '#ff7a47',
    primaryDark: '#c44a1a',
    primaryMuted: 'rgba(230, 91, 36, 0.15)',
    
    // Backgrounds
    background: '#0a0a0f',
    surface: '#141419',
    surfaceElevated: '#1c1c24',
    surfaceBorder: '#2a2a35',
    
    // Text
    textPrimary: '#ffffff',
    textSecondary: '#a0a0b0',
    textMuted: '#606070',
    
    // Status
    success: '#22c55e',
    successMuted: 'rgba(34, 197, 94, 0.15)',
    warning: '#eab308',
    warningMuted: 'rgba(234, 179, 8, 0.15)',
    error: '#ef4444',
    errorMuted: 'rgba(239, 68, 68, 0.15)',
    
    // Alignment Indicator Colors
    alignmentPerfect: '#22c55e',
    alignmentGood: '#84cc16',
    alignmentClose: '#eab308',
    alignmentFar: '#e65b24',
    alignmentOff: '#ef4444',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(255, 255, 255, 0.05)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  typography: {
    display: {
      fontSize: 72,
      fontWeight: '200' as const,
      letterSpacing: -2,
    },
    h1: {
      fontSize: 32,
      fontWeight: '600' as const,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      letterSpacing: 0,
      lineHeight: 20,
    },
    label: {
      fontSize: 12,
      fontWeight: '600' as const,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
    mono: {
      fontSize: 14,
      fontWeight: '500' as const,
      letterSpacing: 0.5,
      fontFamily: 'monospace',
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    glow: {
      shadowColor: '#e65b24',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = keyof typeof theme.colors;
export type ThemeSpacing = keyof typeof theme.spacing;