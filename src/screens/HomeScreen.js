import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { useMusicStore } from '../store/musicStore';
import CircleOfFifths from '../components/CircleOfFifths';
import Fretboard from '../components/Fretboard';
import InstrumentSelector from '../components/InstrumentSelector';
import KeyInfo from '../components/KeyInfo';
import ProgressionComposer from '../components/ProgressionComposer';
import TuningControls from '../components/TuningControls';
import ChordAnalysis from '../components/ChordAnalysis';
import FretboardPositions from '../components/FretboardPositions';
import Legend from '../components/Legend';

// Debug imports - add this temporarily
console.log('CircleOfFifths:', CircleOfFifths);
console.log('Fretboard:', Fretboard);
console.log('InstrumentSelector:', InstrumentSelector);
console.log('KeyInfo:', KeyInfo);
console.log('TuningControls:', TuningControls);
console.log('ProgressionComposer:', ProgressionComposer);
console.log('ChordAnalysis:', ChordAnalysis);
console.log('FretboardPositions:', FretboardPositions);
console.log('Legend:', Legend);

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const HomeScreen = () => {
  const { progression, selectedKey, selectedScale } = useMusicStore();

  // Roman numeral buttons
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
  const renderRomanNumeralButtons = () => (
    <View style={styles.romanNumeralRow}>
      {romanNumerals.map((num, idx) => (
        <View key={num} style={styles.romanButtonWrapper}>
          <Text style={styles.romanButton}>{num}</Text>
        </View>
      ))}
    </View>
  );

  const renderPhoneLayout = () => (
    <ScrollView 
      style={styles.phoneContainer} 
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} 
      showsVerticalScrollIndicator={true}
    >
      {/* 1. Circle of Fifths */}
      <CircleOfFifths />
      {/* 2. Key Information */}
      <KeyInfo />
      {/* 3. Instruments Section */}
      <InstrumentSelector compact />
      {/* 4. Tuning Controls */}
      <TuningControls />
      {/* 5. Chord Progression Composer */}
      <ProgressionComposer />
      {/* 6. Legend */}
      <Legend />
  {/* 7. Fretboard Positions component directly above Fretboard */}
  <FretboardPositions />
  <Fretboard />
  {/* 8. Chord Analysis */}
  <ChordAnalysis />
    </ScrollView>
  );

  const renderTabletLayout = () => (
    <ScrollView 
      horizontal={false}
      style={styles.tabletContainer} 
      contentContainerStyle={{ flexGrow: 1, padding: 10 }} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.centeredRow}>
        <View style={styles.centeredCircle}>
          <CircleOfFifths />
        </View>
      </View>
      <View style={styles.tabletRow}>
        {/* Left Column */}
        <View style={styles.leftPanel}>
          <KeyInfo />
        </View>
        {/* Right Column */}
        <View style={styles.rightPanel}>
          <InstrumentSelector compact />
          <TuningControls />
          <ProgressionComposer />
        </View>
      </View>
      {/* Full Width Bottom Section */}
      <View style={styles.fullWidthSection}>
        <Legend />
  {/* Fretboard Positions component directly above Fretboard */}
  <FretboardPositions />
  <Fretboard />
  <ChordAnalysis />
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <View style={styles.header}>
        <Text style={styles.title}>Chord Visualizer II</Text>
        <Text style={styles.subtitle}>Interactive Music Theory Explorer</Text>
      </View>
      {isTablet ? renderTabletLayout() : renderPhoneLayout()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  centeredCircle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  phoneContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabletContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabletRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  leftPanel: {
    flex: 1,
    marginRight: 10,
  },
  rightPanel: {
    flex: 1,
    marginLeft: 10,
  },
  fullWidthSection: {
    width: '100%',
    marginTop: 10,
  },
});

export default HomeScreen;