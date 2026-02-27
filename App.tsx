import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HomeScreen } from './src/screens/HomeScreen';
import { AlignmentScreen } from './src/screens/AlignmentScreen';
import { SimpleAlignmentScreen } from './src/screens/SimpleAlignmentScreen';
import { StarlinkAlignmentScreen } from './src/screens/StarlinkAlignmentScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { SplashScreen } from './src/screens/SplashScreen';

import { useOnboarding } from './src/hooks/useOnboarding';
import { useSettings } from './src/hooks/useSettings';
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator();

// Set to true to enable splash screen, onboarding, and home screen
const SHOW_FULL_FLOW = true;

export default function App() {
  const [showSplash, setShowSplash] = useState(SHOW_FULL_FLOW);
  const { isLoading: onboardingLoading, hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const { settings, isLoading: settingsLoading } = useSettings();

  // Show splash screen first (if enabled)
  if (showSplash) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  // Show loading if checking onboarding status (if enabled)
  if (SHOW_FULL_FLOW && (onboardingLoading || settingsLoading)) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Show onboarding if not completed (if enabled)
  if (SHOW_FULL_FLOW && !hasCompletedOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={completeOnboarding} />
      </SafeAreaProvider>
    );
  }

  const initialScreen = "Home";

  // Main app
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName={initialScreen}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Alignment" component={AlignmentScreen} />
          <Stack.Screen name="SimpleAlignment" component={SimpleAlignmentScreen} />
          <Stack.Screen name="StarlinkAlignment" component={StarlinkAlignmentScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});