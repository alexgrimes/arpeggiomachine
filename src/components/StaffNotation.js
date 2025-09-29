// StaffNotation.js
// SVG-based staff notation system for React Native
// Placeholder for multi-measure, multi-row staff with chord symbols and time signatures

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated as RNAnimated } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import * as Font from 'expo-font';
import { useFonts, Roboto_700Bold, Roboto_400Regular } from '@expo-google-fonts/roboto';


const STAFF_HEIGHT = 60;
const STAFF_WIDTH = 320;
const MEASURES_PER_ROW = 4;
const STAFF_LINES = 5;
const ROW_GAP = 30;

function getRomanNumeral(index) {
  // Simple I-VII mapping for demo
  const numerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  return numerals[index % 7] || '?';
}

const StaffNotation = ({
  progression = [],
  timeSignature = '4/4',
  keySignature = 'C',
  selectedMeasure = null,
  onSelectMeasure = () => {},
  beat = null, // Current beat for playback indication
}) => {
  // Animated opacity for SVG text
  const [fadeAnim] = useState(() => new RNAnimated.Value(0));
  const prevProgressionRef = useRef(progression);

  // Font loading
  const [fontsLoaded] = useFonts({
    Roboto_700Bold,
    Roboto_400Regular,
  });

  // Animate on progression change
  useEffect(() => {
    if (prevProgressionRef.current !== progression) {
      fadeAnim.setValue(0);
      RNAnimated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      prevProgressionRef.current = progression;
    }
  }, [progression]);

  // Initial fade-in
  useEffect(() => {
    RNAnimated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);
  // Split progression into rows
  const rows = [];
  for (let i = 0; i < progression.length; i += MEASURES_PER_ROW) {
    rows.push(progression.slice(i, i + MEASURES_PER_ROW));
  }
  // Pad last row if needed
  if (rows.length === 0) rows.push([]);
  if (rows[rows.length - 1].length < MEASURES_PER_ROW) {
    while (rows[rows.length - 1].length < MEASURES_PER_ROW) {
      rows[rows.length - 1].push(null);
    }
  }

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      <RNAnimated.View style={{ opacity: fadeAnim }}>
        {rows.map((row, rowIdx) => (
          <Svg
            key={rowIdx}
            width={STAFF_WIDTH}
            height={STAFF_HEIGHT + ROW_GAP}
            style={{ marginBottom: rowIdx < rows.length - 1 ? ROW_GAP : 0 }}
          >
            {/* Staff lines */}
            {[...Array(STAFF_LINES)].map((_, i) => (
              <Line
                key={i}
                x1={0}
                y1={15 + i * 8}
                x2={STAFF_WIDTH}
                y2={15 + i * 8}
                stroke="#333"
                strokeWidth={1}
              />
            ))}
            {/* Measure bars */}
            {[...Array(MEASURES_PER_ROW + 1)].map((_, i) => (
              <Line
                key={i}
                x1={i * (STAFF_WIDTH / MEASURES_PER_ROW)}
                y1={15}
                x2={i * (STAFF_WIDTH / MEASURES_PER_ROW)}
                y2={15 + 8 * (STAFF_LINES - 1)}
                stroke="#333"
                strokeWidth={i === 0 ? 2 : 1}
              />
            ))}
            {/* Chord symbols and Roman numerals */}
            {row.map((chord, i) => (
              chord ? (
                <React.Fragment key={i}>
                  {/* Chord symbol */}
                  <SvgText
                    x={i * (STAFF_WIDTH / MEASURES_PER_ROW) + (STAFF_WIDTH / MEASURES_PER_ROW) / 2}
                    y={10}
                    fontSize="14"
                    fontWeight="bold"
                    fill="#4CAF50"
                    textAnchor="middle"
                    fontFamily="Roboto_700Bold"
                  >
                    {chord.symbol || '?'}
                  </SvgText>
                  {/* Roman numeral */}
                  <SvgText
                    x={i * (STAFF_WIDTH / MEASURES_PER_ROW) + (STAFF_WIDTH / MEASURES_PER_ROW) / 2}
                    y={STAFF_HEIGHT - 10}
                    fontSize="12"
                    fill="#333"
                    textAnchor="middle"
                    fontFamily="Roboto_400Regular"
                  >
                    {chord.romanNumeral || getRomanNumeral(i)}
                  </SvgText>
                </React.Fragment>
              ) : null
            ))}
            {/* Measure selection highlight */}
            {row.map((_, i) => (
              selectedMeasure === rowIdx * MEASURES_PER_ROW + i ? (
                <Rect
                  key={i}
                  x={i * (STAFF_WIDTH / MEASURES_PER_ROW) + 2}
                  y={16}
                  width={(STAFF_WIDTH / MEASURES_PER_ROW) - 4}
                  height={8 * (STAFF_LINES - 1) - 2}
                  fill="#FFEB3B33"
                  stroke="#FFEB3B"
                  strokeWidth={2}
                  rx={6}
                />
              ) : null
            ))}
            {/* Beat indication (circle) */}
            {beat !== null && beat >= rowIdx * MEASURES_PER_ROW && beat < (rowIdx + 1) * MEASURES_PER_ROW ? (
              <Circle
                cx={(beat % MEASURES_PER_ROW) * (STAFF_WIDTH / MEASURES_PER_ROW) + (STAFF_WIDTH / MEASURES_PER_ROW) / 2}
                cy={STAFF_HEIGHT - 25}
                r={7}
                fill="#FF6B6B"
                opacity={0.7}
              />
            ) : null}
            {/* Time signature and key signature (first row only) */}
            {rowIdx === 0 && (
              <>
                <SvgText x={10} y={40} fontSize="12" fontWeight="bold" fill="#333" fontFamily="Roboto_700Bold">{timeSignature}</SvgText>
                <SvgText x={10} y={20} fontSize="12" fill="#333" fontFamily="Roboto_400Regular">{keySignature}</SvgText>
              </>
            )}
          </Svg>
        ))}
      </RNAnimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default StaffNotation;
