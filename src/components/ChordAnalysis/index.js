import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useMusicStore } from '../../store/useMusicStore';
import { generateScale, generateTriads, generateSevenths, generateSecondaryDominants } from '../../utils/musicTheory';

const ChordAnalysis = () => {
  const {
    selectedKey,
    selectedScale,
    chordMode,
    selectedChord,
    isAudioInitialized,
    isPlayingChord,
    setChordMode,
    setSelectedChord,
    addToProgression,
    initializeAudio: initStoreAudio,
    playChordAudio,
  } = useMusicStore();

  // Generate current chords based on key, scale, and mode
  const getCurrentChords = () => {
    const root = selectedKey.replace('m', ''); // Remove 'm' for minor keys
    const scaleNotes = generateScale(root, selectedScale);
    
    switch (chordMode) {
      case 'triads':
        return generateTriads(scaleNotes, selectedKey);
      case 'sevenths':
        return generateSevenths(scaleNotes, selectedKey);
      case 'secondary':
        return generateSecondaryDominants(selectedKey, scaleNotes);
      default:
        return generateTriads(scaleNotes, selectedKey);
    }
  };

  const chords = getCurrentChords();

  // Handle chord selection with audio playback
  const handleChordPress = async (chord) => {
    // Initialize audio if not already done
    if (!isAudioInitialized) {
      await initStoreAudio();
    }

    // If same chord is pressed, deselect it
    if (selectedChord && selectedChord.symbol === chord.symbol) {
      setSelectedChord(null);
    } else {
      setSelectedChord(chord);
      // Play the chord audio
      await playChordAudio(chord.notes, { strummed: true });
    }
  };

  // Handle chord addition to progression
  const handleChordLongPress = async (chord) => {
    // Initialize audio if not already done
    if (!isAudioInitialized) {
      await initStoreAudio();
    }

    // Play chord audio first
    await playChordAudio(chord.notes, { strummed: true, duration: 1.0 });
    
    addToProgression({
      symbol: chord.symbol,
      romanNumeral: chord.romanNumeral,
      notes: chord.notes
    });
    
    Alert.alert(
      'Chord Added',
      `${chord.symbol} added to progression`,
      [{ text: 'OK' }],
      { duration: 1500 }
    );
  };

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <Text style={styles.instructions}>
        Tap to select • Long press to add to progression
      </Text>
      
      {/* Chord Mode Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Chord Analysis:</Text>
        <View style={styles.chordToggle}>
          <TouchableOpacity 
            style={[styles.chordToggleButton, chordMode === 'triads' && styles.chordToggleButtonActive]}
            onPress={() => setChordMode('triads')}
          >
            <Text style={[styles.chordToggleText, chordMode === 'triads' && styles.chordToggleTextActive]}>
              Triads
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chordToggleButton, chordMode === 'sevenths' && styles.chordToggleButtonActive]}
            onPress={() => setChordMode('sevenths')}
          >
            <Text style={[styles.chordToggleText, chordMode === 'sevenths' && styles.chordToggleTextActive]}>
              7th Chords
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.chordToggleButton, chordMode === 'secondary' && styles.chordToggleButtonActive]}
            onPress={() => setChordMode('secondary')}
          >
            <Text style={[styles.chordToggleText, chordMode === 'secondary' && styles.chordToggleTextActive]}>
              Secondary
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chord Analysis Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollContainer}>
        <View style={styles.chordAnalysisGrid}>
          {chords.map((chord, index) => (
            <View key={index} style={[
              styles.chordColumn,
              selectedChord && selectedChord.symbol === chord.symbol && styles.chordColumnSelected
            ]}>
              {/* Roman Numeral */}
              <Text style={styles.romanNumeral}>{chord.romanNumeral}</Text>
              
              {/* Chord Button */}
              <TouchableOpacity 
                style={[
                  styles.chordButton,
                  selectedChord && selectedChord.symbol === chord.symbol && styles.chordButtonSelected,
                  isPlayingChord && styles.chordButtonPlaying
                ]}
                onPress={() => handleChordPress(chord)}
                onLongPress={() => handleChordLongPress(chord)}
                disabled={isPlayingChord}
              >
                <Text style={[
                  styles.chordButtonText,
                  selectedChord && selectedChord.symbol === chord.symbol && styles.chordButtonTextSelected
                ]}>
                  {chord.symbol}
                </Text>
              </TouchableOpacity>
              
              {/* Note Members */}
              <View style={styles.noteMembers}>
                {chord.notes.map((note, noteIndex) => (
                  <Text key={noteIndex} style={styles.noteMember}>
                    <Text style={styles.degreeSubscript}>{chord.degrees[noteIndex]}</Text>
                    {note}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Selected Chord Info */}
      {selectedChord && (
        <View style={styles.selectedChordInfo}>
          <Text style={styles.selectedChordTitle}>Selected: {selectedChord.symbol}</Text>
          <Text style={styles.selectedChordNotes}>
            Notes: {selectedChord.notes.join(' - ')}
          </Text>
          <Text style={styles.selectedChordRoman}>
            Roman Numeral: {selectedChord.romanNumeral}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  instructions: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
  scrollContainer: {
    maxHeight: 200,
  },
  chordAnalysisGrid: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  chordColumn: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    backgroundColor: '#f9f9f9',
    minWidth: 65,
    maxWidth: 80,
  },
  chordColumnSelected: {
    borderColor: '#ff6b35',
    backgroundColor: '#fff5f2',
    borderWidth: 2,
  },
  romanNumeral: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: 'normal',
  },
  chordButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    margin: 4,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: 'white',
    borderRadius: 4,
    width: '100%',
    alignItems: 'center',
  },
  chordButtonSelected: {
    backgroundColor: '#ff6b35',
    borderColor: '#e55a2b',
  },
  chordButtonPlaying: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
  },
  chordButtonText: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
  },
  chordButtonTextSelected: {
    color: 'white',
  },
  noteMembers: {
    alignItems: 'center',
    width: '100%',
  },
  noteMember: {
    fontSize: 11,
    lineHeight: 14,
    margin: 1,
    textAlign: 'center',
    width: '100%',
    color: '#333',
  },
  degreeSubscript: {
    fontSize: 8,
    color: '#888',
    marginRight: 2,
  },
  selectedChordInfo: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#E8F5E8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  selectedChordTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 5,
  },
  selectedChordNotes: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 3,
  },
  selectedChordRoman: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
});

export default ChordAnalysis;