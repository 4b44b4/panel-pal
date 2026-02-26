/**
 * Sun Position Calculations
 * 
 * Calculates optimal panel angle for SOLAR NOON
 */

export interface SunPosition {
  azimuth: number;
  elevation: number;
  isDay: boolean;
}

export interface OptimalPanelAngle {
  azimuth: number;
  tilt: number;
  solarNoonElevation: number;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getSolarDeclination(date: Date): number {
  const dayOfYear = getDayOfYear(date);
  const declination = 23.45 * Math.sin(toRadians((360 / 365) * (dayOfYear - 81)));
  return declination;
}

export function calculateSolarNoonElevation(latitude: number, date: Date = new Date()): number {
  const declination = getSolarDeclination(date);
  const elevation = 90 - Math.abs(latitude - declination);
  return Math.max(0, Math.min(90, elevation));
}

export function calculateSunPosition(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): SunPosition {
  const declination = getSolarDeclination(date);
  
  const hours = date.getHours() + date.getMinutes() / 60;
  const solarNoon = 12 - (longitude / 15);
  const hourAngle = (hours - solarNoon) * 15;
  
  const latRad = toRadians(latitude);
  const decRad = toRadians(declination);
  const haRad = toRadians(hourAngle);
  
  const sinElevation = Math.sin(latRad) * Math.sin(decRad) + 
                       Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);
  const elevation = toDegrees(Math.asin(Math.min(1, Math.max(-1, sinElevation))));
  
  const cosAzimuth = (Math.sin(decRad) - Math.sin(latRad) * sinElevation) / 
                     (Math.cos(latRad) * Math.cos(toRadians(elevation)));
  let azimuth = toDegrees(Math.acos(Math.min(1, Math.max(-1, cosAzimuth))));
  
  if (hourAngle > 0) {
    azimuth = 360 - azimuth;
  }
  
  return {
    azimuth,
    elevation: Math.max(0, elevation),
    isDay: elevation > 0,
  };
}

export function calculateOptimalPanelAngle(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): OptimalPanelAngle {
  const azimuth = latitude >= 0 ? 180 : 0;
  const solarNoonElevation = calculateSolarNoonElevation(latitude, date);
  const tilt = 90 - solarNoonElevation;
  
  return {
    azimuth,
    tilt: Math.max(0, Math.min(90, tilt)),
    solarNoonElevation,
  };
}

export function getCardinalDirection(azimuth: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                      'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(azimuth / 22.5) % 16;
  return directions[index];
}

/**
 * Calculate alignment grade (A-E)
 */
export function calculateAlignmentGrade(
  currentAzimuth: number,
  currentTilt: number,
  optimalAzimuth: number,
  optimalTilt: number
): { grade: string; color: string } {
  const tiltDiff = Math.abs(currentTilt - optimalTilt);
  
  let azimuthFromSouth = Math.abs(currentAzimuth - 180);
  if (azimuthFromSouth > 180) {
    azimuthFromSouth = 360 - azimuthFromSouth;
  }
  
  let directionCategory: 'best' | 'good' | 'poor' | 'bad';
  
  if (azimuthFromSouth <= 22.5) {
    directionCategory = 'best';
  } else if (azimuthFromSouth <= 67.5) {
    directionCategory = 'good';
  } else if (azimuthFromSouth <= 112.5) {
    directionCategory = 'poor';
  } else {
    directionCategory = 'bad';
  }
  
  let tiltCategory: 'optimal' | 'close' | 'far';
  
  if (tiltDiff <= 10) {
    tiltCategory = 'optimal';
  } else if (tiltDiff <= 25) {
    tiltCategory = 'close';
  } else {
    tiltCategory = 'far';
  }
  
  const gradeMatrix: Record<string, Record<string, string>> = {
    best: { optimal: 'A', close: 'A', far: 'B' },
    good: { optimal: 'B', close: 'C', far: 'C' },
    poor: { optimal: 'C', close: 'D', far: 'D' },
    bad: { optimal: 'E', close: 'E', far: 'E' },
  };
  
  const grade = gradeMatrix[directionCategory][tiltCategory];
  
  const gradeColors: Record<string, string> = {
    'A': '#22c55e',
    'B': '#84cc16',
    'C': '#eab308',
    'D': '#f97316',
    'E': '#ef4444',
  };
  
  return {
    grade,
    color: gradeColors[grade],
  };
}

export function calculateAlignmentScore(
  currentAzimuth: number,
  currentTilt: number,
  optimalAzimuth: number,
  optimalTilt: number
): number {
  const { grade } = calculateAlignmentGrade(currentAzimuth, currentTilt, optimalAzimuth, optimalTilt);
  
  const gradeToScore: Record<string, number> = {
    'A': 95,
    'B': 80,
    'C': 65,
    'D': 45,
    'E': 25,
  };
  
  return gradeToScore[grade];
}