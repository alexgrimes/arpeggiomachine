// StaffNotation.js - Full width, no white space
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Svg, { Line, Rect, Text as SvgText, G } from 'react-native-svg';
import { useMusicStore } from '../store/useMusicStore';

const MEASURE_HEIGHT = 80;
const MEASURES_PER_ROW = 4;

const StaffNotation = () => {
  const [containerWidth, setContainerWidth] = React.useState(0);
  
  const {
    progressionMeasures = [],
    selectedMeasureIndex,
    setSelectedMeasureIndex,
  } = useMusicStore();

  if (progressionMeasures.length === 0) return null;

  const rows = [];
  for (let i = 0; i < progressionMeasures.length; i += MEASURES_PER_ROW) {
    rows.push(progressionMeasures.slice(i, i + MEASURES_PER_ROW));
  }

  // Calculate measure width to fill container perfectly
  const TIME_SIG_WIDTH = 30;
  const measureWidth = containerWidth > 0 
    ? (containerWidth - TIME_SIG_WIDTH - 20) / MEASURES_PER_ROW  // -20 for container padding
    : 100;

  const handleMeasureTap = (index) => {
    setSelectedMeasureIndex(index);
  };

  return (
    <View 
      style={styles.container}
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
    >
      <Text style={styles.title}>Chord Progression Staff</Text>
      
      {containerWidth > 0 && rows.map((row, rowIdx) => {
        const isFirstRow = rowIdx === 0;
        const svgWidth = containerWidth - 20; // Match container padding
        
        return (
          <View key={rowIdx} style={styles.rowContainer}>
            <Svg width={svgWidth} height={MEASURE_HEIGHT + 30}>
              {/* Time signature - first row only */}
              {isFirstRow && (
                <>
                  <SvgText x={10} y={28} fontSize="20" fontWeight="bold" fill="#000">4</SvgText>
                  <SvgText x={10} y={52} fontSize="20" fontWeight="bold" fill="#000">4</SvgText>
                </>
              )}
              
              {row.map((chord, colIdx) => {
                const measureIdx = rowIdx * MEASURES_PER_ROW + colIdx;
                const xOffset = isFirstRow ? TIME_SIG_WIDTH : 0;
                const x = xOffset + colIdx * measureWidth;
                const isSelected = selectedMeasureIndex === measureIdx;
                const isFirstInRow = colIdx === 0;
                const isLastMeasure = measureIdx === progressionMeasures.length - 1;
                
                return (
                  <G key={colIdx}>
                    {/* Selection highlight */}
                    {isSelected && (
                      <Rect
                        x={x + 1}
                        y={1}
                        width={measureWidth - 1}
                        height={MEASURE_HEIGHT - 2}
                        fill="#C8E6C9"
                        stroke="#4CAF50"
                        strokeWidth={3}
                        rx={0}
                      />
                    )}
                    
                    {/* Left bar */}
                    <Line
                      x1={x}
                      y1={0}
                      x2={x}
                      y2={MEASURE_HEIGHT}
                      stroke="#333"
                      strokeWidth={isFirstInRow ? 3 : 1}
                    />
                    
                    {/* Chord symbol or dash */}
                    {chord ? (
                      <SvgText
                        x={x + measureWidth / 2}
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
                        x={x + measureWidth / 2}
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
                        x={x + measureWidth / 2}
                        y={MEASURE_HEIGHT + 22}
                        fontSize="14"
                        fill="#666"
                        textAnchor="middle"
                      >
                        {chord.romanNumeral}
                      </SvgText>
                    )}
                    
                    {/* Right bar - thick only on last measure of entire progression */}
                    {colIdx === row.length - 1 && (
                      <Line
                        x1={x + measureWidth}
                        y1={0}
                        x2={x + measureWidth}
                        y2={MEASURE_HEIGHT}
                        stroke="#333"
                        strokeWidth={isLastMeasure ? 4 : 1}
                      />
                    )}
                  </G>
                );
              })}
            </Svg>
            
            {/* Touchable overlay */}
            <View style={[styles.touchableContainer, { left: isFirstRow ? TIME_SIG_WIDTH : 0 }]}> 
              {row.map((_, colIdx) => {
                const measureIdx = rowIdx * MEASURES_PER_ROW + colIdx;
                return (
                  <TouchableOpacity
                    key={colIdx}
                    style={[styles.measureTouch, { width: measureWidth }]}
                    onPress={() => handleMeasureTap(measureIdx)}
                  />
                );
              })}
            </View>
          </View>
        );
      })}
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
    alignItems: 'center',
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
  touchableContainer: {
    position: 'absolute',
    top: 0,
    height: 80,
    flexDirection: 'row',
  },
  measureTouch: {
    height: '100%',
  },
});

export default StaffNotation;

