import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useMusicStore } from '../store/useMusicStore';
import {
  generateScale,
  generateTriads,
  generateSevenths,
  generateSecondaryDominants,
  generateDiminishedPassing,
  generateRomanNumeral,
  SCALE_PATTERNS
} from '../utils/musicTheory';

const KeyInfo = () => {
  const { selectedKey, selectedScale, setSelectedScale } = useMusicStore();
  const [chordMode, setChordMode] = useState('triads');
  const [selectedChordIndex, setSelectedChordIndex] = useState(null);

  const scaleNames = {
    major: 'Major',
    minor: 'Natural Minor',
    harmonicMinor: 'Harmonic Minor',
    melodicMinor: 'Melodic Minor',
    majorPentatonic: 'Major Pentatonic',
    minorPentatonic: 'Minor Pentatonic',
    wholeTone: 'Whole Tone',
    halfWholeDiminished: 'Half-Whole Diminished',
    wholeHalfDiminished: 'Whole-Half Diminished',
    majorSixDiminished: 'Major 6 Diminished',
    minorSixDiminished: 'Minor 6 Diminished',
    dorian: 'Dorian',
    phrygian: 'Phrygian',
    lydian: 'Lydian',
    mixolydian: 'Mixolydian',
    locrian: 'Locrian',
  };

  const availableScales = Object.keys(SCALE_PATTERNS);
  const rootNote = selectedKey.replace(/m$/, '').split('/')[0];
  const scaleNotes = generateScale(rootNote, selectedScale);
  const isHomeScale = selectedScale === 'major' || selectedScale === 'minor';

  const getSignature = () => {
    if (selectedScale === 'major' || selectedScale === 'minor') {
      return `${scaleNames[selectedScale]} scale`;
    }
    return `${scaleNames[selectedScale] || selectedScale}`;
  };

  let chords = [];
  let chordModeTitle = '';
  
  switch (chordMode) {
    case 'triads':
      chords = generateTriads(scaleNotes, rootNote);
      chordModeTitle = 'Triads';
      break;
    case 'sevenths':
      chords = generateSevenths(scaleNotes, rootNote);
      chordModeTitle = '7th Chords';
      break;
      case 'secondary':
        chords = generateSecondaryDominants(selectedKey, scaleNotes);
        chordModeTitle = 'Secondary Dominants';
        break;
      case 'diminished':
        chords = generateDiminishedPassing(selectedKey, scaleNotes);
        chordModeTitle = 'Diminished Passing';
        break;
      default:
        chords = [];
    }

    const handleScaleChange = (newScale) => {
      setSelectedScale(newScale);
      setSelectedChordIndex(null);
      const newIsHomeScale = newScale === 'major' || newScale === 'minor';
      if (!newIsHomeScale && (chordMode === 'secondary' || chordMode === 'diminished')) {
        setChordMode('triads');
      }
    };

    const chordModes = [
      { key: 'triads', label: 'Triads' },
      { key: 'sevenths', label: '7th Chords' },
      ...(isHomeScale ? [
        { key: 'secondary', label: 'Secondary' },
        { key: 'diminished', label: 'Diminished' }
      ] : [])
    ];

    const getRomanNumeral = (chord, idx) => {
      if (chordMode === 'secondary' && chord.scaleDegree && chord.target) {
        return (
          <View style={styles.romanNumeralContainer}>
            <Text style={styles.scaleDegreeRoman}>{chord.scaleDegree}</Text>
            <Text style={styles.functionRoman}>V7/{chord.target}</Text>
          </View>
        );
      }
      const roman = chord.romanNumeral || chord.roman || generateRomanNumeral(idx, chordMode, selectedKey);
      return <Text style={styles.romanNumeral}>{roman}</Text>;
    };

    return (
      <ScrollView style={styles.keyInfoContainer}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionHeader}>Key Information</Text>
          <View style={styles.greenUnderline} />
        </View>

        <Text style={styles.keyTitle}>
          {selectedKey} {scaleNames[selectedScale] || selectedScale}
        </Text>

        <View style={styles.signatureRow}>
          <Text style={styles.label}>Scale Type: </Text>
          <Text style={styles.signatureText}>{getSignature()}</Text>
        </View>

        <View style={styles.scaleSelector}>
          <Text style={styles.sectionLabel}>Available Scales:</Text>
          <View style={styles.scaleButtons}>
            {availableScales.map((scale) => (
              <TouchableOpacity
                key={scale}
                style={[styles.scaleBtn, selectedScale === scale && styles.scaleActive]}
                onPress={() => handleScaleChange(scale)}
              >
                <Text style={[styles.scaleBtnText, selectedScale === scale && styles.scaleBtnActiveText]}>
                  {scaleNames[scale] || scale}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.scaleNotesSection}>
          <Text style={styles.sectionLabel}>Scale Notes:</Text>
          <View style={styles.scaleNotes}>
            {scaleNotes.map((note, index) => (
              <View key={index} style={[styles.noteChip, index === 0 && styles.noteChipRoot]}>
                <Text style={styles.noteChipText}>{note}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chordToggle}>
          {chordModes.map((mode, index) => (
            <TouchableOpacity
              key={mode.key}
              style={[
                styles.chordToggleBtn,
                chordMode === mode.key && styles.chordToggleBtnActive,
                index < chordModes.length - 1 && styles.chordToggleBtnDivider
              ]}
              onPress={() => setChordMode(mode.key)}
            >
              <Text style={[styles.chordToggleBtnText, chordMode === mode.key && styles.chordToggleBtnTextActive]}>
                {mode.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.chordModeTitle}>{chordModeTitle}:</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chordScrollContent}>
          <View style={styles.chordAnalysisGrid}>
            {chords.map((chord, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.chordColumn, selectedChordIndex === idx && styles.selectedColumn]}
                onPress={() => setSelectedChordIndex(idx)}
              >
                {getRomanNumeral(chord, idx)}
                <View style={[styles.chordButton, selectedChordIndex === idx && styles.selectedButton]}>
                  <Text style={[styles.chordSymbol, selectedChordIndex === idx && styles.selectedText]}>
                    {chord.symbol}
                  </Text>
                </View>
                <View style={styles.noteMembers}>
                  {chord.notes?.map((note, noteIndex) => (
                    <View key={noteIndex} style={styles.noteMember}>
                      <Text style={styles.degreeSubscript}>{chord.degrees?.[noteIndex]}</Text>
                      <Text style={styles.noteText}>{note}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    );
  };

  const styles = StyleSheet.create({
    keyInfoContainer: { padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginVertical: 10 },
    headerSection: { marginBottom: 15 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', paddingBottom: 10 },
    greenUnderline: { height: 2, backgroundColor: '#4CAF50', width: '100%' },
    keyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginVertical: 10 },
    signatureRow: { flexDirection: 'row', marginVertical: 8 },
    label: { fontWeight: 'bold', color: '#333', fontSize: 14 },
    signatureText: { color: '#666', fontSize: 14 },
    scaleSelector: { marginVertical: 15 },
    sectionLabel: { fontWeight: 'bold', fontSize: 14, color: '#333', marginBottom: 10 },
    scaleButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    scaleBtn: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#90caf9', borderRadius: 4 },
    scaleActive: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
    scaleBtnText: { color: '#1976d2', fontSize: 14 },
    scaleBtnActiveText: { color: 'white', fontWeight: 'bold' },
    scaleNotesSection: { marginVertical: 15 },
    scaleNotes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    noteChip: { paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#42A5F5', borderRadius: 15 },
    noteChipRoot: { backgroundColor: '#f44336' },
    noteChipText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
    chordToggle: { flexDirection: 'row', marginVertical: 15, borderWidth: 2, borderColor: '#333', borderRadius: 5, overflow: 'hidden' },
    chordToggleBtn: { flex: 1, paddingVertical: 6, paddingHorizontal: 8, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' },
    chordToggleBtnDivider: { borderRightWidth: 1, borderRightColor: '#333' },
    chordToggleBtnActive: { backgroundColor: '#4CAF50' },
    chordToggleBtnText: { fontWeight: 'bold', fontSize: 11, color: '#333' },
    chordToggleBtnTextActive: { color: 'white' },
    chordModeTitle: { fontWeight: 'bold', fontSize: 14, color: '#333', marginBottom: 10, marginTop: 5 },
    chordScrollContent: { paddingHorizontal: 5 },
    chordAnalysisGrid: { flexDirection: 'row', gap: 8 },
    chordColumn: { flexDirection: 'column', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 6, backgroundColor: '#f9f9f9', minWidth: 65 },
    selectedColumn: { borderColor: '#ff6b35', backgroundColor: '#fff5f2' },
    romanNumeralContainer: { alignItems: 'center', marginBottom: 4 },
    scaleDegreeRoman: { fontSize: 10, color: '#888', marginBottom: 2 },
    functionRoman: { fontSize: 11, color: '#666' },
    romanNumeral: { fontSize: 11, color: '#666', marginBottom: 4 },
    chordButton: { paddingVertical: 6, paddingHorizontal: 8, borderWidth: 2, borderColor: '#333', borderRadius: 4, backgroundColor: 'white', minWidth: 50, alignItems: 'center' },
    selectedButton: { backgroundColor: '#ff6b35', borderColor: '#e55a2b' },
    chordSymbol: { fontSize: 13, fontWeight: 'bold', color: '#333' },
    selectedText: { color: 'white' },
    noteMembers: { flexDirection: 'column', alignItems: 'center', marginTop: 4 },
    noteMember: { flexDirection: 'row', alignItems: 'center', marginVertical: 1 },
    degreeSubscript: { fontSize: 8, color: '#888', marginRight: 2 },
    noteText: { fontSize: 11, color: '#333' },
  });

  export default KeyInfo;