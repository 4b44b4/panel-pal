/**
 * useDeviceOrientation Hook
 * 
 * Uses Location heading for compass (like iPhone compass app)
 * Uses DeviceMotion for tilt
 */

import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { DeviceMotion } from 'expo-sensors';

export interface DeviceOrientation {
  azimuth: number;
  pitch: number;
  roll: number;
  tilt: number;
  isAvailable: boolean;
  error: string | null;
}

export function useDeviceOrientation(updateInterval: number = 100): DeviceOrientation {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    azimuth: 0,
    pitch: 0,
    roll: 0,
    tilt: 0,
    isAvailable: false,
    error: null,
  });

  useEffect(() => {
    let headingSubscription: Location.LocationSubscription | null = null;
    let motionSubscription: { remove: () => void } | null = null;
    
    let currentHeading = 0;
    let currentTilt = 0;
    let currentPitch = 0;
    let currentRoll = 0;

    const startSensors = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setOrientation(prev => ({
            ...prev,
            error: 'Location permission required for compass',
            isAvailable: false,
          }));
          return;
        }

        const motionAvailable = await DeviceMotion.isAvailableAsync();

        if (motionAvailable) {
          DeviceMotion.setUpdateInterval(updateInterval);
          
          motionSubscription = DeviceMotion.addListener((data) => {
            if (data.rotation) {
              const { beta, gamma } = data.rotation;
              currentPitch = beta ? beta * (180 / Math.PI) : 0;
              currentRoll = gamma ? gamma * (180 / Math.PI) : 0;
              currentTilt = Math.min(90, Math.abs(currentPitch));
              
              setOrientation({
                azimuth: currentHeading,
                pitch: currentPitch,
                roll: currentRoll,
                tilt: currentTilt,
                isAvailable: true,
                error: null,
              });
            }
          });
        }

        // Use Location heading for compass
        headingSubscription = await Location.watchHeadingAsync((heading) => {
          currentHeading = heading.trueHeading ?? heading.magHeading ?? 0;
          
          setOrientation({
            azimuth: currentHeading,
            pitch: currentPitch,
            roll: currentRoll,
            tilt: currentTilt,
            isAvailable: true,
            error: null,
          });
        });

        setOrientation(prev => ({ ...prev, isAvailable: true, error: null }));

      } catch (error) {
        setOrientation(prev => ({
          ...prev,
          error: `Failed to start sensors: ${error}`,
          isAvailable: false,
        }));
      }
    };

    startSensors();

    return () => {
      if (headingSubscription) headingSubscription.remove();
      if (motionSubscription) motionSubscription.remove();
    };
  }, [updateInterval]);

  return orientation;
}

export function usePanelOrientation(updateInterval: number = 100) {
  const orientation = useDeviceOrientation(updateInterval);

  // Heading shows where TOP of phone points
  // Panel faces opposite direction (screen faces that way when tilted)
  const panelAzimuth = (orientation.azimuth + 180) % 360;

  return {
    azimuth: panelAzimuth,
    tilt: orientation.tilt,
    pitch: orientation.pitch,
    isAvailable: orientation.isAvailable,
    error: orientation.error,
  };
}