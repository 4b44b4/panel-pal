/**
 * useSunPosition Hook
 * 
 * Provides optimal panel angle for SOLAR NOON (peak sun)
 */

import { useState, useEffect, useMemo } from 'react';
import { useLocation } from './useLocation';
import {
  calculateSunPosition,
  calculateOptimalPanelAngle,
  calculateSolarNoonElevation,
} from '../utils/sunCalculations';

export interface SunPositionData {
  sunAzimuth: number;
  sunElevation: number;
  isDay: boolean;
  optimalAzimuth: number;
  optimalTilt: number;
  solarNoonElevation: number;
  latitude: number;
  longitude: number;
  isLoading: boolean;
  error: string | null;
}

export function useSunPosition(
  manualLatitude?: number,
  manualLongitude?: number
): SunPositionData {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const latitude = manualLatitude ?? location.latitude;
  const longitude = manualLongitude ?? location.longitude;

  // Current sun position (for display)
  const sunPosition = useMemo(() => {
    return calculateSunPosition(latitude, longitude, currentTime);
  }, [latitude, longitude, currentTime]);

  // Optimal panel angle for SOLAR NOON
  const optimalAngle = useMemo(() => {
    return calculateOptimalPanelAngle(latitude, longitude, currentTime);
  }, [latitude, longitude, currentTime]);

  return {
    sunAzimuth: sunPosition.azimuth,
    sunElevation: sunPosition.elevation,
    isDay: sunPosition.isDay,
    optimalAzimuth: optimalAngle.azimuth,
    optimalTilt: optimalAngle.tilt,
    solarNoonElevation: optimalAngle.solarNoonElevation,
    latitude,
    longitude,
    isLoading: manualLatitude === undefined && location.isLoading,
    error: manualLatitude === undefined ? location.error : null,
  };
}