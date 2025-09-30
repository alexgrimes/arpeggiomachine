
// StaffNotation.js - Simplified to match web app exactly
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import Svg, { Line, Rect, Text as SvgText, G } from 'react-native-svg';
import { useMusicStore } from '../store/useMusicStore';

const MEASURE_WIDTH = 130;
const MEASURE_HEIGHT = 80;
const MEASURES_PER_ROW = 4;
const ROW_SPACING = 40;

const StaffNotation = () => {
  const { 
    progressionMeasures = [], 
    selectedMeasureIndex, 
    setSelectedMeasureIndex,
  } = useMusicStore();

  if (progressionMeasures.length === 0) return null;

  // Split measures into rows of 4
  const rows = [];
  for (let i = 0; i < progressionMeasures.length; i += MEASURES_PER_ROW) {
    rows.push(progressionMeasures.slice(i, i + MEASURES_PER_ROW));
  }

  const rowWidth = MEASURES_PER_ROW * MEASURE_WIDTH;
  const TIME_SIG_WIDTH = 32;

  const handleMeasureTap = (index) => {
    setSelectedMeasureIndex(index);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chord Progression Staff</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {rows.map((row, rowIdx) => {
          const rowHeight = MEASURE_HEIGHT + 30;
          // For the first row, add extra width for the time signature
          const svgWidth = rowIdx === 0 ? rowWidth + TIME_SIG_WIDTH : rowWidth;
          return (
            <View key={rowIdx} style={styles.rowContainer}>
              <Svg width={svgWidth} height={rowHeight}>
                {/* Time signature before first bar line of first row */}
                {rowIdx === 0 && (
                  <>
                    <SvgText
                      x={8}
                      y={28}
                      fontSize="20"
                      fontWeight="bold"
                      fill="#333"
                    >
                      4
                    </SvgText>
                    <SvgText
                      x={8}
                      y={52}
                      fontSize="20"
                      fontWeight="bold"
                      fill="#333"
                    >
                      4
                    </SvgText>
                  </>
                )}
                {row.map((chord, colIdx) => {
                  const measureIdx = rowIdx * MEASURES_PER_ROW + colIdx;
                  // For first row, offset all measures to the right by TIME_SIG_WIDTH
                  const x = (rowIdx === 0 ? TIME_SIG_WIDTH : 0) + colIdx * MEASURE_WIDTH;
                  const isSelected = selectedMeasureIndex === measureIdx;
                  const isFirstInRow = colIdx === 0;
                  // Only the last barline of the entire progression is thick
                  const isLastBarline = (rowIdx === rows.length - 1) && (colIdx === row.length - 1);
                  return (
                    <G key={colIdx}>
                      {/* Selection highlight - fill and outline, both green */}
                      {isSelected && (
                        <Rect
                          x={x + 1}
                          y={1}
                          width={MEASURE_WIDTH - 1}
                          height={MEASURE_HEIGHT - 2}
                          fill="#C8E6C9"
                          stroke="#388E3C"
                          strokeWidth={2}
                          rx={0}
                        />
                      )}
                      {/* Left measure bar */}
                      <Line
                        x1={x}
                        y1={0}
                        x2={x}
                        y2={MEASURE_HEIGHT}
                        stroke="#333"
                        strokeWidth={isFirstInRow ? 2 : 1}
                      />
                      {/* Chord symbol */}
                      {chord ? (
                        <SvgText
                          x={x + MEASURE_WIDTH / 2}
                          y={MEASURE_HEIGHT / 2 + 6}
                          fontSize="20"
                          fontWeight="bold"
                          fill="#2E7D32"
                          textAnchor="middle"
                        >
                          {chord.symbol}
                        </SvgText>
                      ) : (
                        <SvgText
                          x={x + MEASURE_WIDTH / 2}
                          y={MEASURE_HEIGHT / 2 + 8}
                          fontSize="28"
                          fill="#ccc"
                          textAnchor="middle"
                        >
                          —
                        </SvgText>
                      )}
                      {/* Roman numeral */}
                      {chord && chord.romanNumeral && (
                        <SvgText
                          x={x + MEASURE_WIDTH / 2}
                          y={MEASURE_HEIGHT + 22}
                          fontSize="14"
                          fill="#666"
                          textAnchor="middle"
                        >
                          {chord.romanNumeral}
                        </SvgText>
                      )}
                      {/* Final right bar for this row - only thick if last barline of progression */}
                      {colIdx === row.length - 1 && (
                        <Line
                          x1={x + MEASURE_WIDTH}
                          y1={0}
                          x2={x + MEASURE_WIDTH}
                          y2={MEASURE_HEIGHT}
                          stroke="#333"
                          strokeWidth={isLastBarline ? 4 : 1}
                        />
                      )}
                    </G>
                  );
                })}
              </Svg>
              {/* Touchable overlay for this row */}
              <View style={[styles.touchableContainer, { width: svgWidth }]}> 
                {row.map((_, colIdx) => {
                  const measureIdx = rowIdx * MEASURES_PER_ROW + colIdx;
                  return (
                    <TouchableOpacity
                      key={colIdx}
                      style={[styles.measureTouch, { width: MEASURE_WIDTH }]}
                      onPress={() => handleMeasureTap(measureIdx)}
                    />
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#90CAF9',
    marginTop: 5,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 12,
  },
  rowContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  staffContainer: {},
  touchableContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 80,
    flexDirection: 'row',
  },
  measureTouch: {
    height: '100%',
  },
});

export default StaffNotation;

