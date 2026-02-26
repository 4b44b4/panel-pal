/**
 * useLocation Hook
 * 
 * MILESTONE 1 - Sensors & Location
 * =================================
 * Provides device GPS location for sun position calculations.
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  permissionStatus: 'undetermined' | 'granted' | 'denied';
}

const DEFAULT_LOCATION: LocationData = {
  latitude: -33.8688,
  longitude: 151.2093,
  altitude: null,
  accuracy: null,
  isLoading: true,
  error: null,
  permissionStatus: 'undetermined',
};

export function useLocation(): LocationData & { refresh: () => Promise<void> } {
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);

  const fetchLocation = useCallback(async () => {
    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setLocation(prev => ({
          ...prev,
          isLoading: false,
          error: 'Location permission denied',
          permissionStatus: 'denied',
        }));
        return;
      }

      setLocation(prev => ({ ...prev, permissionStatus: 'granted' }));

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        isLoading: false,
        error: null,
        permissionStatus: 'granted',
      });

    } catch (error) {
      setLocation(prev => ({
        ...prev,
        isLoading: false,
        error: `Failed to get location: ${error}`,
      }));
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    ...location,
    refresh: fetchLocation,
  };
}

export function useWatchLocation(enabled: boolean = true): LocationData {
  const [location, setLocation] = useState<LocationData>(DEFAULT_LOCATION);

  useEffect(() => {
    if (!enabled) return;

    let subscription: Location.LocationSubscription | null = null;

    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setLocation(prev => ({
            ...prev,
            isLoading: false,
            error: 'Location permission denied',
            permissionStatus: 'denied',
          }));
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000,
            distanceInterval: 10,
          },
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              altitude: position.coords.altitude,
              accuracy: position.coords.accuracy,
              isLoading: false,
              error: null,
              permissionStatus: 'granted',
            });
          }
        );

      } catch (error) {
        setLocation(prev => ({
          ...prev,
          isLoading: false,
          error: `Location watch failed: ${error}`,
        }));
      }
    };

    startWatching();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [enabled]);

  return location;
}