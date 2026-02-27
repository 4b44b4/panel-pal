/**
 * Starlink-Inspired Alignment Screen
 *
 * Visual style inspired by the Starlink satellite dish alignment UI.
 * Same alignment logic as SimpleAlignmentScreen with a
 * Starlink-themed presentation: isometric 3D panel, compass ring,
 * target outline, and rotation arrow.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Text as SvgText, Path, Polygon } from 'react-native-svg';

import { usePanelOrientation } from '../hooks/useDeviceOrientation';
import { useSunPosition } from '../hooks/useSunPosition';
import { calculateAlignmentGrade } from '../utils/sunCalculations';

const { width: SCREEN_W } = Dimensions.get('window');

// Layout constants
const COMPASS_SIZE = SCREEN_W * 0.88;
const CX = COMPASS_SIZE / 2;
const CY = COMPASS_SIZE / 2;
const DOT_R = COMPASS_SIZE * 0.39;
const LABEL_R = COMPASS_SIZE * 0.47;
const PANEL_W = COMPASS_SIZE * 0.45;
const PANEL_H = COMPASS_SIZE * 0.32;
// Target is slightly larger than panel so both are visible simultaneously
const TARGET_W = PANEL_W * 1.18;
const TARGET_H = PANEL_H * 1.18;
const ARROW_R = DOT_R * 1.08; // sits between dot ring and label ring
const BASE_TILT = 58; // isometric view angle

// ============================================
// Convert compass heading to screen SVG coords
// Display: S at top, N at bottom, E at left, W at right
// ============================================
function toXY(heading: number, r: number) {
  const rad = ((heading - 180) * Math.PI) / 180;
  return {
    x: CX + r * Math.sin(rad),
    y: CY - r * Math.cos(rad),
  };
}

// ============================================
// COMPASS RING - dots and cardinal labels
// ============================================
function CompassRing() {
  const dots = useMemo(() => {
    const els: React.ReactElement[] = [];
    const N = 72; // tick every 5 degrees

    for (let i = 0; i < N; i++) {
      const h = i * (360 / N);
      const { x, y } = toXY(h, DOT_R);
      const cardinal = Math.round(h) % 90 === 0;
      const ordinal = Math.round(h) % 45 === 0 && !cardinal;

      els.push(
        <Circle
          key={i}
          cx={x}
          cy={y}
          r={cardinal ? 2.8 : ordinal ? 1.8 : 1.2}
          fill={`rgba(255,255,255,${cardinal ? 0.9 : ordinal ? 0.55 : 0.3})`}
        />,
      );
    }
    return els;
  }, []);

  const labels = useMemo(() => {
    const cards = [
      { l: 'N', h: 0 },
      { l: 'E', h: 90 },
      { l: 'S', h: 180 },
      { l: 'W', h: 270 },
    ];
    return cards.map(({ l, h }) => {
      const { x, y } = toXY(h, LABEL_R);
      return (
        <SvgText
          key={l}
          x={x}
          y={y + 7}
          fill="white"
          fontSize={21}
          fontWeight="bold"
          textAnchor="middle"
          opacity={0.88}
        >
          {l}
        </SvgText>
      );
    });
  }, []);

  return (
    <Svg
      width={COMPASS_SIZE}
      height={COMPASS_SIZE}
      style={StyleSheet.absoluteFill}
    >
      {dots}
      {labels}
    </Svg>
  );
}

// ============================================
// ROTATION ARROW - curved arc with arrowhead
//
// Uses direct screen coordinates (θ measured clockwise from right,
// y-down SVG space) so the arc shape is always predictable.
//
// Both arrows sweep a ~130° arc through the BOTTOM of the compass
// (near the N label). The arrowhead sits at the end of the arc and
// points in the direction of intended rotation.
//
//   CW  (rotate right): arc bottom-left → bottom-right, tip points right+up
//   CCW (rotate left) : arc bottom-right → bottom-left, tip points left+up
// ============================================
function RotationArrow({
  direction,
  visible,
}: {
  direction: 'cw' | 'ccw';
  visible: boolean;
}) {
  if (!visible) return null;

  const isCW = direction === 'cw';
  const r = ARROW_R;

  // Screen angles (θ, clockwise from right, SVG y-down)
  // θ=90°  → directly below centre  (compass bottom / N label)
  // θ=155° → bottom-left of compass
  // θ=25°  → bottom-right of compass
  const θ_start = isCW ? 155 : 25;
  const θ_end   = isCW ? 25  : 155;

  const toSVG = (deg: number) => ({
    x: CX + r * Math.cos((deg * Math.PI) / 180),
    y: CY + r * Math.sin((deg * Math.PI) / 180),
  });

  const start = toSVG(θ_start);
  const end   = toSVG(θ_end);

  // CW:  travel from 155→25 by DECREASING θ (screen CCW, sweep=0)
  //       → arc passes through θ=90 (bottom) ✓
  // CCW: travel from 25→155 by INCREASING θ (screen CW, sweep=1)
  //       → arc passes through θ=90 (bottom) ✓
  const sweep = isCW ? 0 : 1;

  const arcD = [
    `M ${start.x.toFixed(1)} ${start.y.toFixed(1)}`,
    `A ${r.toFixed(1)} ${r.toFixed(1)} 0 0 ${sweep}`,
    `${end.x.toFixed(1)} ${end.y.toFixed(1)}`,
  ].join(' ');

  // Tangent direction at the end point (the direction of travel along the arc)
  // CW (decreasing θ):  tangent = ( sin θ_end, -cos θ_end)  → right+up at θ=25°
  // CCW (increasing θ): tangent = (-sin θ_end,  cos θ_end)  → left+up  at θ=155°
  const endRad = (θ_end * Math.PI) / 180;
  const tx = isCW ?  Math.sin(endRad) : -Math.sin(endRad);
  const ty = isCW ? -Math.cos(endRad) :  Math.cos(endRad);
  const px = -ty;
  const py =  tx;
  const aLen = 15;
  const aW   = 8;

  const pts = [
    `${end.x.toFixed(1)},${end.y.toFixed(1)}`,
    `${(end.x - tx * aLen + px * aW).toFixed(1)},${(end.y - ty * aLen + py * aW).toFixed(1)}`,
    `${(end.x - tx * aLen - px * aW).toFixed(1)},${(end.y - ty * aLen - py * aW).toFixed(1)}`,
  ].join(' ');

  // Amber/orange colour so the arrow stands out from the white compass dots
  const arrowColor = 'rgba(255, 200, 60, 0.95)';

  return (
    <Svg
      width={COMPASS_SIZE}
      height={COMPASS_SIZE}
      style={StyleSheet.absoluteFill}
    >
      <Path
        d={arcD}
        stroke={arrowColor}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
      <Polygon points={pts} fill={arrowColor} />
    </Svg>
  );
}

// ============================================
// MAIN SCREEN
// ============================================
export function StarlinkAlignmentScreen({ navigation, route }: any) {
  // ---- Identical logic from SimpleAlignmentScreen ----
  const orientation = usePanelOrientation(100);
  const sunData = useSunPosition();
  const isFixedPanel = route?.params?.panelType === 'fixed';

  const [grade, setGrade] = useState('E');
  const [gradeColor, setGradeColor] = useState('#ef4444');

  useEffect(() => {
    if (!orientation.isAvailable) return;

    const effectiveOptimalTilt = isFixedPanel
      ? orientation.tilt
      : sunData.optimalTilt;

    const gradeResult = calculateAlignmentGrade(
      orientation.azimuth,
      orientation.tilt,
      sunData.optimalAzimuth,
      effectiveOptimalTilt,
    );

    setGrade(gradeResult.grade);
    setGradeColor(gradeResult.color);
  }, [
    orientation.azimuth,
    orientation.tilt,
    sunData.optimalAzimuth,
    sunData.optimalTilt,
    orientation.isAvailable,
    isFixedPanel,
  ]);

  let azimuthDiff = orientation.azimuth - sunData.optimalAzimuth;
  if (azimuthDiff > 180) azimuthDiff -= 360;
  if (azimuthDiff < -180) azimuthDiff += 360;

  const tiltDiff = orientation.tilt - sunData.optimalTilt;
  // ---- End shared logic ----

  const isAligned = grade === 'A';
  const needsRotation = Math.abs(azimuthDiff) > 22.5;
  const needsTilt = !isFixedPanel && Math.abs(tiltDiff) > 10;

  // Map deviations to visual transforms (clamped)
  const tiltOffset = Math.max(-30, Math.min(30, tiltDiff * 1.2));
  const rotOffset  = Math.max(-25, Math.min(25, azimuthDiff * 0.3));

  // azimuthDiff > 0 → panel points too far clockwise → user must rotate LEFT (CCW)
  // azimuthDiff < 0 → panel points too far counter-clockwise → user must rotate RIGHT (CW)
  const arrowDirection = azimuthDiff > 0 ? 'ccw' : 'cw';
  const rotateLabel    = azimuthDiff > 0 ? 'Rotate your panel to the left' : 'Rotate your panel to the right';

  const title = isAligned
    ? 'Panel is aligned'
    : needsTilt
      ? 'Panel tilt is incorrect'
      : needsRotation
        ? 'Panel direction is incorrect'
        : 'Panel needs adjustment';

  const subtitle = isAligned
    ? 'Your solar panel is pointed in the correct direction.'
    : needsTilt
      ? 'Make sure the panel is mounted correctly or is set up on flat ground.'
      : needsRotation
        ? rotateLabel
        : 'Almost there — make small adjustments.';

  return (
    <View style={s.root}>
      <SafeAreaView style={s.safe}>
        {/* Back */}
        <TouchableOpacity
          style={s.back}
          onPress={() => navigation.goBack()}
        >
          <Text style={s.backIcon}>{'‹'}</Text>
        </TouchableOpacity>

        {/* Status */}
        <View style={s.statusArea}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
        </View>

        {/* Visualization */}
        <View style={s.vizWrap}>
          <View style={s.vizBox}>
            {/* Compass dots & labels */}
            <CompassRing />

            {/* ── TARGET OUTLINE (fixed at optimal orientation) ──────────
                Larger than the panel so both are visible simultaneously.
                Blue when not aligned, white glow when aligned. */}
            <View style={s.anchor}>
              <View
                style={[
                  s.target,
                  {
                    width:  TARGET_W,
                    height: TARGET_H,
                    borderColor: isAligned
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(80, 180, 255, 0.85)',
                    shadowColor: isAligned ? '#fff' : '#50b4ff',
                    shadowOpacity: 0.6,
                  },
                ]}
              />
            </View>

            {/* ── PANEL (moves with device orientation) ──────────────── */}
            <View style={s.anchor}>
              <View
                style={[
                  s.panel,
                  {
                    width:  PANEL_W,
                    height: PANEL_H,
                    shadowOpacity: isAligned ? 0.7 : 0,
                    transform: [
                      { perspective: 800 },
                      { rotateX: `${BASE_TILT + tiltOffset}deg` },
                      { rotateZ: `${rotOffset}deg` },
                    ],
                  },
                ]}
              />
            </View>

            {/* ── ROTATION ARROW ─────────────────────────────────────── */}
            <RotationArrow
              direction={arrowDirection}
              visible={needsRotation && !isAligned}
            />
          </View>
        </View>

        {/* Bottom button */}
        <View style={s.bottomWrap}>
          <TouchableOpacity style={s.bottomBtn} activeOpacity={0.7}>
            <Text style={s.bottomBtnText}>View obstructions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// ============================================
// STYLES
// ============================================
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  safe: {
    flex: 1,
  },
  back: {
    marginLeft: 12,
    marginTop: 4,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '300',
    marginTop: -4,
  },
  statusArea: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 4,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  vizWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vizBox: {
    width:  COMPASS_SIZE,
    height: COMPASS_SIZE,
  },
  anchor: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  target: {
    borderWidth: 2.5,
    borderRadius: 3,
    backgroundColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 4,
    transform: [{ perspective: 800 }, { rotateX: `${BASE_TILT}deg` }],
  },
  panel: {
    backgroundColor: 'rgba(215,215,220,0.93)',
    borderWidth: 0,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
  bottomWrap: {
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  bottomBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  bottomBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
