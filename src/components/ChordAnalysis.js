import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useMusicStore } from '../store/useMusicStore';
import { analyzeChord, calculateScaleDegree } from '../utils/chordAnalysis';
import { playChord, initializeAudio } from '../utils/audioEngine';

const ChordAnalysis = () => {
  const {
    customChordNotes,
    selectedKey,
    setSelectedChord,
    removeCustomChordNote,
    clearCustomChordNotes,
    progressionActive,
    selectedMeasureIndex,
    addChordToMeasure
  } = useMusicStore();

  // Debug logging
  useEffect(() => {
    console.log('ChordAnalysis - customChordNotes:', customChordNotes);
    console.log('ChordAnalysis - selectedKey:', selectedKey);
  }, [customChordNotes, selectedKey]);

  // Analyze chords and get all possible interpretations (including inversions)
  const possibleChords = customChordNotes?.length >= 2 
    ? analyzeChord(customChordNotes)
    : [];

  console.log('ChordAnalysis - possibleChords:', possibleChords);

  const handleChordSelect = async (chord) => {
    setSelectedChord({
      symbol: chord.symbol,
      notes: chord.notes,
      root: chord.root,
      type: chord.type
    });
    // Play the chord's actual notes
    if (chord.notes && chord.notes.length > 0) {
      await playChord(chord.notes, { duration: 1.5, arpeggiate: false });
    }
  };

  // Assign chord to selected measure in progression mode
  const handleAssignToMeasure = (chord) => {
    if (progressionActive && selectedMeasureIndex !== null) {
      addChordToMeasure(selectedMeasureIndex, {
        symbol: chord.symbol,
        romanNumeral: chord.romanNumeral || '?',
        notes: chord.notes
      });
    }
  };

  // Create the note display with scale degrees (like "C₁ E_M3 G_P5 A_M6")
  const renderNoteHeader = () => {
    if (!customChordNotes || customChordNotes.length === 0) {
      return <Text style={styles.noteHeader}>Chord Analysis</Text>;
    }

    return (
      <View style={styles.noteHeaderContainer}>
        {customChordNotes.map((note, idx) => {
          const degree = idx === 0 ? '₁' : getScaleDegreeSubscript(note, customChordNotes[0]);
          return (
            <Text key={idx} style={styles.noteWithDegree}>
              {note}
              <Text style={styles.degreeSubscript}>{degree}</Text>
              {idx < customChordNotes.length - 1 && ' '}
            </Text>
          );
        })}
      </View>
    );
  };

  const getScaleDegreeSubscript = (note, root) => {
    const degree = calculateScaleDegree(note, root);
    const subscriptMap = {
      '1': '₁', '♭2': '♭₂', '2': '₂', '♭3': 'ₘ₃', '3': 'M₃', '4': '₄',
      '♭5': '♭₅', '5': '₅', '♯5': '♯₅', '6': 'M₆', '♭7': '♭₇', '7': 'M₇'
    };
    return subscriptMap[degree] || degree;
  };

  useEffect(() => {
    initializeAudio();
  }, []);

  // Check if top chord is a perfect match
  const hasPerfectMatch = possibleChords.length > 0 && possibleChords[0].score >= 0.95;
  // Create custom chord label from entered notes
  const customChordLabel = customChordNotes?.join(' ') || 'Custom';

  return (
    <View style={styles.container}>
      {/* Note Header - shows selected notes with degrees */}
      {renderNoteHeader()}

      {/* Possible Chords Section */}
      <View style={styles.chordsSection}>
        <Text style={styles.sectionLabel}>Possible chords:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chordButtonsContainer}
        >
          {possibleChords && possibleChords.length > 0 ? (
            <>
              {/* Primary (green) button */}
              <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <TouchableOpacity
                  style={[styles.chordButton, styles.primaryChordButton]}
                  onPress={() => handleChordSelect(possibleChords[0])}
                >
                  <Text style={[styles.chordButtonText, styles.primaryChordButtonText]}>
                    {possibleChords[0].symbol}
                  </Text>
                </TouchableOpacity>
                {progressionActive && selectedMeasureIndex !== null && (
                  <TouchableOpacity
                    style={styles.assignButton}
                    onPress={() => handleAssignToMeasure(possibleChords[0])}
                  >
                    <Text style={styles.assignButtonText}>Assign to Measure</Text>
                  </TouchableOpacity>
                )}
              </View>
              {/* Secondary chord suggestions */}
              {possibleChords.slice(1).map((chord, idx) => (
                <View key={idx + 1} style={{ flexDirection: 'column', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.chordButton}
                    onPress={() => handleChordSelect(chord)}
                  >
                    <Text style={styles.chordButtonText}>
                      {chord.symbol}
                    </Text>
                  </TouchableOpacity>
                  {progressionActive && selectedMeasureIndex !== null && (
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssignToMeasure(chord)}
                    >
                      <Text style={styles.assignButtonText}>Assign to Measure</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.clearButton} onPress={clearCustomChordNotes}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
            </>
          ) : customChordNotes?.length >= 2 ? (
            <Text style={styles.emptyText}>No chord matches found</Text>
          ) : (
            <Text style={styles.emptyText}>Select notes on fretboard</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  assignButton: {
    backgroundColor: '#FFD600',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 4,
    alignItems: 'center',
  },
  assignButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Note Header Styles
  noteHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  noteHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  noteWithDegree: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 2,
  },
  degreeSubscript: {
    fontSize: 10,
    color: '#666',
  },
  // Chords Section
  chordsSection: {
    // No additional styling needed
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  chordButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 5,
  },
  chordButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#90CAF9',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  primaryChordButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
  },
  chordButtonText: {
    color: '#1976D2',
    fontWeight: 'bold',
    fontSize: 14,
  },
  primaryChordButtonText: {
    color: 'white',
  },
  clearButton: {
    backgroundColor: '#EF5350',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 10,
  },
  scoreText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  scoreTextWhite: {
    color: 'rgba(255, 255, 255, 0.8)',  // White score text for green button
  },
});

export default ChordAnalysis;
