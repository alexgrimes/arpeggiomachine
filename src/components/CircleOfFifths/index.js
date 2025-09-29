import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions } from 'react-native';
import Svg, { Circle, Text as SvgText, G, Path, Line } from 'react-native-svg';
import { useMusicStore } from '../../store/useMusicStore';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Circle of fifths data with key signatures
const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯/G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'];
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'D♯m/E♭m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm'];

// Key signature data (number of sharps/flats)
const KEY_SIGNATURES = {
  'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F♯/G♭': 6,
  'D♭': -5, 'A♭': -4, 'E♭': -3, 'B♭': -2, 'F': -1,
  'Am': 0, 'Em': 1, 'Bm': 2, 'F♯m': 3, 'C♯m': 4, 'G♯m': 5, 'D♯m/E♭m': 6,
  'B♭m': -5, 'Fm': -4, 'Cm': -3, 'Gm': -2, 'Dm': -1
};

const CircleOfFifths = () => {
  const { selectedKey, selectedScale, setSelectedKey, setSelectedScale } = useMusicStore();
  
  // Responsive sizing - larger and more dramatic
  const containerSize = isTablet ? 420 : 300;
  const majorRadius = containerSize * 0.42;
  const minorRadius = containerSize * 0.28;
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;
  const majorButtonSize = isTablet ? 70 : 58;
  const minorButtonSize = isTablet ? 50 : 42;
  
  // Key selection handlers
  const handleKeyPress = (key, isMinor = false) => {
    setSelectedKey(key);
    setSelectedScale(isMinor ? 'minor' : 'major');
  };
  
  // Calculate position for keys on the circle
  const getKeyPosition = (index, radius, buttonSize) => {
    const angle = (index * 30 - 90) * Math.PI / 180;
    return {
      x: centerX + radius * Math.cos(angle) - buttonSize / 2,
      y: centerY + radius * Math.sin(angle) - buttonSize / 2,
    };
  };
  
  // Check if a key is currently selected
  const isSelected = (key) => {
    return selectedKey === key || 
           (selectedKey.includes('/') && key.includes('/') && 
            (selectedKey.includes(key.split('/')[0]) || selectedKey.includes(key.split('/')[1])));
  };
  
  // Render mini staff with key signature
  const renderKeySignature = (key, x, y, size) => {
    const accidentals = KEY_SIGNATURES[key] || 0;
    const staffHeight = size * 0.3;
    const staffY = y + size * 0.7;
    
    return (
      <G key={`staff-${key}`}>
        {/* Mini staff lines */}
        {[0, 1, 2, 3, 4].map(line => (
          <Line
            key={line}
            x1={x + size * 0.1}
            y1={staffY + line * staffHeight / 4}
            x2={x + size * 0.9}
            y2={staffY + line * staffHeight / 4}
            stroke="#444"
            strokeWidth={0.5}
          />
        ))}
        
        {/* Treble clef (simplified) */}
        <SvgText
          x={x + size * 0.15}
          y={staffY + staffHeight * 0.6}
          fontSize={size * 0.25}
          fill="#444"
          fontFamily="serif"
        >
          𝄞
        </SvgText>
        
        {/* Key signature symbols */}
        {accidentals !== 0 && (
          <SvgText
            x={x + size * 0.4}
            y={staffY + staffHeight * 0.5}
            fontSize={size * 0.2}
            fill="#444"
            textAnchor="middle"
          >
            {accidentals > 0 ? '♯'.repeat(Math.min(accidentals, 3)) : '♭'.repeat(Math.min(-accidentals, 3))}
          </SvgText>
        )}
      </G>
    );
  };
  
  // Render a key button with enhanced styling
  const renderKeyButton = (key, index, isMinor = false) => {
    const radius = isMinor ? minorRadius : majorRadius;
    const buttonSize = isMinor ? minorButtonSize : majorButtonSize;
    const position = getKeyPosition(index, radius, buttonSize);
    const selected = isSelected(key);
    
    // Charlotte Hornets color scheme - teal and purple
    const colors = isMinor ? {
      normal: { bg: '#1D1160', border: '#2D1B69', text: '#E8E2FF' },
      selected: { bg: '#8B5CF6', border: '#7C3AED', text: '#FFFFFF' },
      hover: { bg: '#6D28D9', border: '#5B21B6', text: '#FFFFFF' }
    } : {
      normal: { bg: '#0D7377', border: '#14A085', text: '#E0F7FA' },
      selected: { bg: '#00D4AA', border: '#00BFA5', text: '#FFFFFF' },
      hover: { bg: '#26A69A', border: '#00897B', text: '#FFFFFF' }
    };
    
    const currentColors = selected ? colors.selected : colors.normal;
    
    return (
      <TouchableOpacity
        key={`${key}-${isMinor ? 'minor' : 'major'}`}
        style={[
          styles.keyButton,
          {
            left: position.x,
            top: position.y,
            width: buttonSize,
            height: buttonSize,
            borderRadius: buttonSize / 2,
            backgroundColor: currentColors.bg,
            borderColor: currentColors.border,
            borderWidth: 3,
            shadowColor: selected ? currentColors.border : '#000',
            shadowOpacity: selected ? 0.4 : 0.2,
            shadowRadius: selected ? 8 : 4,
            shadowOffset: { width: 0, height: selected ? 4 : 2 },
            elevation: selected ? 8 : 4,
            transform: selected ? [{ scale: 1.1 }] : [{ scale: 1 }],
          }
        ]}
        onPress={() => handleKeyPress(key, isMinor)}
      >
        <Text style={[
          styles.keyText,
          { 
            fontSize: isTablet ? (isMinor ? 14 : 18) : (isMinor ? 12 : 16),
            color: currentColors.text,
            fontWeight: selected ? '800' : '600'
          }
        ]}>
          {key}
        </Text>
        
        {/* Mini staff notation overlay */}
        {!isMinor && (
          <View style={styles.staffContainer}>
            <Svg width={buttonSize * 0.8} height={buttonSize * 0.4}>
              {renderKeySignature(key, 0, 0, buttonSize * 0.8)}
            </Svg>
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      {/* Enhanced background with gradient effect */}
      <View style={[styles.backgroundGradient, { width: containerSize, height: containerSize }]} />
      
      {/* Background SVG with enhanced design */}
      <Svg 
        width={containerSize} 
        height={containerSize} 
        style={StyleSheet.absoluteFill}
      >
        {/* Outer glow ring */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={majorRadius + 15}
          fill="none"
          stroke="rgba(0, 212, 170, 0.3)"
          strokeWidth={4}
        />
        
        {/* Major circle guide */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={majorRadius}
          fill="none"
          stroke="rgba(0, 212, 170, 0.6)"
          strokeWidth={2}
          strokeDasharray="8,4"
        />
        
        {/* Minor circle guide */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={minorRadius}
          fill="none"
          stroke="rgba(139, 92, 246, 0.6)"
          strokeWidth={2}
          strokeDasharray="6,3"
        />
        
        {/* Center circle with gradient effect */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={minorRadius - 30}
          fill="rgba(255, 255, 255, 0.95)"
          stroke="rgba(0, 212, 170, 0.4)"
          strokeWidth={3}
        />
      </Svg>
      
      {/* Major keys (outer circle) */}
      {MAJOR_KEYS.map((key, index) => renderKeyButton(key, index, false))}
      
      {/* Minor keys (inner circle) */}
      {MINOR_KEYS.map((key, index) => renderKeyButton(key, index, true))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderRadius: 20,
    overflow: 'visible',
    marginVertical: 10,
    marginHorizontal: 0,
    zIndex: 10,
  },
  backgroundGradient: {
    position: 'absolute',
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  keyButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  staffContainer: {
    position: 'absolute',
    bottom: 2,
    left: '10%',
    right: '10%',
    height: '40%',
    opacity: 0.7,
  },
});

export default CircleOfFifths;