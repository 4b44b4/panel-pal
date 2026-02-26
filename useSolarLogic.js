import { useState, useEffect, useRef, useMemo } from 'react';
import { Magnetometer, Accelerometer, DeviceMotion } from 'expo-sensors';
import * as Location from 'expo-location';

export const useSolarLogic = (latitude, isYearRound, azimOffset) => {
  const [bearing, setBearing] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [currentLat, setCurrentLat] = useState(latitude);

  const smoothedP = useRef(0);
  const smoothedA = useRef(0);
  const accelData = useRef({ x: 0, y: 0, z: 0 });

  // --- Verified Solar Goal Logic ---
  const targetTilt = useMemo(() => {
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const declination = 23.45 * Math.sin((Math.PI / 180) * (360 / 365) * (day - 81));
    return isYearRound ? Math.round((currentLat * 0.76) + 3.1) : Math.round(Math.abs(currentLat - declination));
  }, [currentLat, isYearRound]);

  // --- Initialization ---
  useEffect(() => {
    (async () => {
      const { status: mag } = await Magnetometer.requestPermissionsAsync();
      const { status: acc } = await Accelerometer.requestPermissionsAsync();
      const { status: mot } = await DeviceMotion.requestPermissionsAsync();
      const { status: loc } = await Location.requestForegroundPermissionsAsync();

      if (mag === 'granted' && acc === 'granted' && mot === 'granted') {
        setHasPermissions(true);
        Magnetometer.setUpdateInterval(40);
        Accelerometer.setUpdateInterval(40);
        DeviceMotion.setUpdateInterval(40);
      }
      if (loc === 'granted') {
        const locData = await Location.getCurrentPositionAsync({});
        setCurrentLat(locData.coords.latitude);
      }
    })();
  }, []);

  // --- The Core Sensor Engine (DO NOT MODIFY) ---
  useEffect(() => {
    if (!hasPermissions) return;

    const accSub = Accelerometer.addListener(data => { accelData.current = data; });

    const magSub = Magnetometer.addListener(data => {
      const { x: ax, y: ay, z: az } = accelData.current;
      const { x: mx, y: my, z: mz } = data;

      const roll = Math.atan2(ay, az);
      const pitchRad = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));

      const mXh = mx * Math.cos(pitchRad) + mz * Math.sin(pitchRad);
      const mYh = mx * Math.sin(roll) * Math.sin(pitchRad) + my * Math.cos(roll) - mz * Math.sin(roll) * Math.cos(pitchRad);

      let heading = Math.atan2(mYh, mXh) * (180 / Math.PI);
      heading = (heading + 360) % 360;

      smoothedA.current = (smoothedA.current * 0.9) + (heading * 0.1);
      setBearing(Math.round(smoothedA.current));
    });

    const motSub = DeviceMotion.addListener(m => {
      if (!m.rotation) return;
      const rawP = Math.abs(m.rotation.beta * (180 / Math.PI));
      smoothedP.current = (smoothedP.current * 0.85) + (rawP * 0.15);
      setPitch(Math.round(smoothedP.current));
    });

    return () => { accSub.remove(); magSub.remove(); motSub.remove(); };
  }, [hasPermissions, azimOffset]);

  const aErr = (bearing - azimOffset - 180);
  const pErr = targetTilt - pitch;
  const score = Math.max(0, Math.round(100 - (Math.abs(pErr) * 2.5) - (Math.abs(aErr) * 1.5)));

  return { bearing, pitch, targetTilt, score, aErr, pErr, hasPermissions };
};