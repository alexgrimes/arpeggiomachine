import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useMusicStore } from '../store/useMusicStore';
import ChordAnalysis from './ChordAnalysis';

const StoreTest = () => {
  const {
    selectedKey,
    selectedInstrument,
    selectedScale,
    setSelectedKey,
    setSelectedInstrument,
    setSelectedScale,
    getCurrentInstrument,
    getScaleName,
    isChordBuildingMode,
    toggleChordBuildingMode,
    clearCustomChord
  } = useMusicStore();

  const instrument = getCurrentInstrument();

  // Key signature information
  const getKeySignature = (key) => {
    const signatures = {
      'C': 'No sharps or flats',
      'G': '1 sharp (F♯)',
      'D': '2 sharps (F♯, C♯)',
      'A': '3 sharps (F♯, C♯, G♯)',
      'E': '4 sharps (F♯, C♯, G♯, D♯)',
      'B': '5 sharps (F♯, C♯, G♯, D♯, A♯)',
      'F♯/G♭': '6 sharps/6 flats',
      'F': '1 flat (B♭)',
      'B♭': '2 flats (B♭, E♭)',
      'E♭': '3 flats (B♭, E♭, A♭)',
      'A♭': '4 flats (B♭, E♭, A♭, D♭)',
      'D♭': '5 flats (B♭, E♭, A♭, D♭, G♭)',
      // Minor keys
      'Am': 'No sharps or flats',
      'Em': '1 sharp (F♯)',
      'Bm': '2 sharps (F♯, C♯)',
      'F♯m': '3 sharps (F♯, C♯, G♯)',
      'C♯m': '4 sharps (F♯, C♯, G♯, D♯)',
      'G♯m': '5 sharps (F♯, C♯, G♯, D♯, A♯)',
      'D♯m/E♭m': '6 sharps/6 flats',
      'Dm': '1 flat (B♭)',
      'Gm': '2 flats (B♭, E♭)',
      'Cm': '3 flats (B♭, E♭, A♭)',
      'Fm': '4 flats (B♭, E♭, A♭, D♭)',
      'B♭m': '5 flats (B♭, E♭, A♭, D♭, G♭)',
    };
    return signatures[key] || 'Unknown';
  };

  // Scale notes for current key
  const getScaleNotes = () => {
    const scalePatterns = {
      'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
      'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F♯'],
      'D': ['D', 'E', 'F♯', 'G', 'A', 'B', 'C♯'],
      'A': ['A', 'B', 'C♯', 'D', 'E', 'F♯', 'G♯'],
      'E': ['E', 'F♯', 'G♯', 'A', 'B', 'C♯', 'D♯'],
      'F': ['F', 'G', 'A', 'B♭', 'C', 'D', 'E'],
      'B♭': ['B♭', 'C', 'D', 'E♭', 'F', 'G', 'A'],
      'E♭': ['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D'],
      // Minor keys
      'Am': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
      'Em': ['E', 'F♯', 'G', 'A', 'B', 'C', 'D'],
      'Bm': ['B', 'C♯', 'D', 'E', 'F♯', 'G', 'A'],
      'Dm': ['D', 'E', 'F', 'G', 'A', 'B♭', 'C'],
      'Gm': ['G', 'A', 'B♭', 'C', 'D', 'E♭', 'F'],
      'Cm': ['C', 'D', 'E♭', 'F', 'G', 'A♭', 'B♭'],
    };
    return scalePatterns[selectedKey] || ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  };

  const scales = ['major', 'minor', 'harmonicMinor', 'melodicMinor', 'majorPentatonic', 'minorPentatonic'];
  const scaleDisplayNames = {
    major: 'Major',
    minor: 'Natural Minor',
    harmonicMinor: 'Harmonic Minor',
    melodicMinor: 'Melodic Minor',
    majorPentatonic: 'Major Pentatonic',
    minorPentatonic: 'Minor Pentatonic',
  };

  const scaleNotes = getScaleNotes();

  return (
    <ScrollView style={styles.container} nestedScrollEnabled={true}>
      {/* Current Key Display */}
      <View style={styles.currentKeySection}>
        <Text style={styles.currentKeyText}>
          {selectedKey} {scaleDisplayNames[selectedScale] || selectedScale}
        </Text>
        <Text style={styles.signatureText}>
          {getKeySignature(selectedKey)}
        </Text>
      </View>

      {/* Scale Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Scale Notes:</Text>
        <View style={styles.scaleNotes}>
          {scaleNotes.map((note, index) => (
            <View key={index} style={[styles.noteChip, index === 0 && styles.rootNote]}>
              <Text style={[styles.noteText, index === 0 && styles.rootNoteText]}>
                {note}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Scale Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Available Scales:</Text>
        <View style={styles.buttonGrid}>
          {scales.map((scale) => (
            <TouchableOpacity
              key={scale}
              style={[styles.scaleButton, selectedScale === scale && styles.scaleButtonActive]}
              onPress={() => setSelectedScale(scale)}
            >
              <Text style={[styles.scaleButtonText, selectedScale === scale && styles.scaleButtonTextActive]}>
                {scaleDisplayNames[scale] || scale}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chord Mode Toggle (placeholder) */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Triads:</Text>
        <View style={styles.chordToggle}>
          <TouchableOpacity style={[styles.chordToggleButton, styles.chordToggleButtonActive]}>
            <Text style={[styles.chordToggleText, styles.chordToggleTextActive]}>Triads</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chordToggleButton}>
            <Text style={styles.chordToggleText}>7th Chords</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chordToggleButton}>
            <Text style={styles.chordToggleText}>Secondary</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.chordToggleButton}>
            <Text style={styles.chordToggleText}>Diminished</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chord Builder Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Chord Builder:</Text>
        <TouchableOpacity 
          style={[styles.chordBuilderToggle, isChordBuildingMode && styles.chordBuilderToggleActive]}
          onPress={() => {
            toggleChordBuildingMode();
            if (isChordBuildingMode) {
              clearCustomChord();
            }
          }}
        >
          <Text style={[styles.chordBuilderText, isChordBuildingMode && styles.chordBuilderTextActive]}>
            {isChordBuildingMode ? '🎵 Builder Mode ON' : '🎸 Enable Builder Mode'}
          </Text>
        </TouchableOpacity>
        {isChordBuildingMode && (
          <Text style={styles.chordBuilderHint}>
            Tap fretboard notes to build custom chords
          </Text>
        )}
      </View>

      {/* Interactive Chord Analysis Grid */}
      <View style={styles.section}>
        <ChordAnalysis />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  currentKeySection: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  currentKeyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  signatureText: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  scaleNotes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noteChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#42A5F5',
    borderRadius: 15,
    marginBottom: 8,
  },
  rootNote: {
    backgroundColor: '#f44336',
  },
  noteText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  rootNoteText: {
    color: 'white',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scaleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#00D4AA',
    borderRadius: 8,
    marginBottom: 8,
  },
  scaleButtonActive: {
    backgroundColor: '#00D4AA',
  },
  scaleButtonText: {
    color: '#00D4AA',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scaleButtonTextActive: {
    color: 'white',
  },
  chordToggle: {
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  chordToggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    backgroundColor: 'white',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  chordToggleButtonActive: {
    backgroundColor: '#4CAF50',
  },
  chordToggleText: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#333',
  },
  chordToggleTextActive: {
    color: 'white',
  },
  
  // Chord Builder Toggle
  chordBuilderToggle: {
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    marginBottom: 5,
  },
  chordBuilderToggleActive: {
    backgroundColor: '#8B5CF6',
  },
  chordBuilderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  chordBuilderTextActive: {
    color: 'white',
  },
  chordBuilderHint: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default StoreTest;