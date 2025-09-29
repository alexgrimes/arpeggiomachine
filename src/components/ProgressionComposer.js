import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMusicStore } from '../store/useMusicStore';

const ProgressionComposer = () => {
  const { 
    selectedKey,
    progressionKey,
    setProgressionKey,
    progressionActive,
    setProgressionActive,
    progressionMeasures,
    setProgressionMeasures,
    isPlaying,
    setIsPlaying,
  } = useMusicStore();

  const [timeSignature, setTimeSignature] = useState('4/4');
  const [measureCount, setMeasureCount] = useState('4');
  const [tempo, setTempo] = useState('120');
  const [loopEnabled, setLoopEnabled] = useState(true);

  // Available keys for dropdown
  const availableKeys = [
    'C', 'G', 'D', 'A', 'E', 'B', 'F♯/G♭',
    'F', 'B♭', 'E♭', 'A♭', 'D♭',
    'Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'D♯m/E♭m',
    'Dm', 'Gm', 'Cm', 'Fm', 'B♭m'
  ];

  const timeSignatures = ['4/4', '3/4', '2/4', '6/8'];
  const measureCounts = ['2', '4', '8', '12', '16'];

  const handleCreateProgression = () => {
    const count = parseInt(measureCount);
    const emptyMeasures = new Array(count).fill(null);
    setProgressionMeasures(emptyMeasures);
    setProgressionActive(true);
    console.log('Created progression:', { progressionKey, timeSignature, measureCount, tempo });
  };

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      console.log('Stopped playback');
    } else {
      setIsPlaying(true);
      console.log('Started playback');
      // Implement playback logic
    }
  };

  const handleClear = () => {
    setProgressionMeasures([]);
    setProgressionActive(false);
    setIsPlaying(false);
    console.log('Cleared progression');
  };

  const allMeasuresFilled = progressionMeasures.length > 0 && 
    progressionMeasures.every(measure => measure !== null);

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Chord Progression Composer</Text>
      </View>

      {/* Progression Setup Controls */}
      <View style={styles.setupRow}>
        {/* Key Selector */}
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Key:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={progressionKey || selectedKey}
              onValueChange={(value) => setProgressionKey(value)}
              style={styles.picker}
            >
              {availableKeys.map(key => (
                <Picker.Item key={key} label={key} value={key} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Time Signature */}
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Time Signature:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={timeSignature}
              onValueChange={setTimeSignature}
              style={styles.picker}
            >
              {timeSignatures.map(sig => (
                <Picker.Item key={sig} label={sig} value={sig} />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <View style={styles.setupRow}>
        {/* Measures */}
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Measures:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={measureCount}
              onValueChange={setMeasureCount}
              style={styles.picker}
            >
              {measureCounts.map(count => (
                <Picker.Item key={count} label={count} value={count} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Tempo */}
        <View style={styles.controlGroup}>
          <Text style={styles.label}>Tempo:</Text>
          <View style={styles.tempoContainer}>
            <TextInput
              style={styles.tempoInput}
              value={tempo}
              onChangeText={setTempo}
              keyboardType="number-pad"
              maxLength={3}
            />
            <Text style={styles.bpmText}>BPM</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateProgression}
        >
          <Text style={styles.buttonText}>Create Progression</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, !allMeasuresFilled && styles.disabledButton]}
          onPress={handlePlay}
          disabled={!allMeasuresFilled}
        >
          <Text style={styles.buttonText}>{isPlaying ? 'Stop' : 'Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>

        {/* Loop Checkbox */}
        <TouchableOpacity
          style={styles.loopContainer}
          onPress={() => setLoopEnabled(!loopEnabled)}
        >
          <View style={[styles.checkbox, loopEnabled && styles.checkboxChecked]}>
            {loopEnabled && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.loopLabel}>Loop</Text>
        </TouchableOpacity>
      </View>

      {/* Cadence Controls - Conditional */}
      {progressionActive && (
        <View style={styles.cadenceSection}>
          <Text style={styles.cadenceTitle}>Suggested Cadences</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cadenceButtons}
          >
            <TouchableOpacity style={styles.cadenceButton}>
              <Text style={styles.cadenceButtonText}>Authentic →I</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cadenceButton}>
              <Text style={styles.cadenceButtonText}>Deceptive →vi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cadenceButton}>
              <Text style={styles.cadenceButtonText}>Plagal →I</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cadenceButton}>
              <Text style={styles.cadenceButtonText}>ii-V →V</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cadenceButton}>
              <Text style={styles.cadenceButtonText}>Half →V</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  headerSection: {
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  setupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: 10,
  },
  controlGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    overflow: 'hidden',
  },
  picker: {
    height: 40,
  },
  tempoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  tempoInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  bpmText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  createButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    minWidth: 100,
  },
  playButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 80,
  },
  clearButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 80,
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loopContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 3,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
  },
  checkmark: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loopLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  cadenceSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#4a90e2',
  },
  cadenceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c5282',
    marginBottom: 10,
  },
  cadenceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cadenceButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  cadenceButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ProgressionComposer;
