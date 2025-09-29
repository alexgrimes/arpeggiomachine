
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useMusicStore } from '../../store/useMusicStore';

const TUNING_PRESETS = {
  guitar: {
    'Standard': ['E', 'A', 'D', 'G', 'B', 'E'],
    'Drop D': ['D', 'A', 'D', 'G', 'B', 'E'],
    'Drop C': ['C', 'G', 'C', 'F', 'A', 'D'],
    'Open G': ['D', 'G', 'D', 'G', 'B', 'D'],
    'DADGAD': ['D', 'A', 'D', 'G', 'A', 'D'],
  },
  bass: {
    'Standard': ['E', 'A', 'D', 'G'],
    'Drop D': ['D', 'A', 'D', 'G'],
    'Drop C': ['C', 'G', 'C', 'F'],
  },
  ukulele: {
    'Standard': ['G', 'C', 'E', 'A'],
    'Baritone': ['D', 'G', 'B', 'E'],
  },
  violin: {
    'Standard': ['G', 'D', 'A', 'E'],
  },
};

const NOTES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

const TuningControls = () => {
  const { 
    selectedInstrument, 
    currentTuning, 
    setCurrentTuning, 
    getCurrentInstrument 
  } = useMusicStore();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStringIndex, setSelectedStringIndex] = useState(null);

  const instrument = getCurrentInstrument();
  const presets = TUNING_PRESETS[selectedInstrument] || {};

  const applyPreset = (presetName) => {
    const preset = presets[presetName];
    if (preset) {
      setCurrentTuning([...preset]);
    }
  };

  const openNoteSelector = (stringIndex) => {
    setSelectedStringIndex(stringIndex);
    setModalVisible(true);
  };

  const selectNote = (note) => {
    if (selectedStringIndex !== null) {
      const newTuning = [...currentTuning];
      newTuning[selectedStringIndex] = note;
      setCurrentTuning(newTuning);
    }
    setModalVisible(false);
    setSelectedStringIndex(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <Text style={styles.title}>Tuning</Text>
      </View>

      {/* String Tuners */}
      <View style={styles.tuningGrid}>
        {currentTuning.map((note, index) => (
          <View key={index} style={styles.stringRow}>
            <Text style={styles.stringLabel}>String {index + 1}:</Text>
            <TouchableOpacity
              style={styles.noteSelector}
              onPress={() => openNoteSelector(index)}
            >
              <Text style={styles.noteText}>{note}</Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Preset Buttons */}
      {Object.keys(presets).length > 0 && (
        <View style={styles.presetSection}>
          <Text style={styles.presetLabel}>Presets:</Text>
          <View style={styles.presetButtons}>
            {Object.keys(presets).map((presetName) => (
              <TouchableOpacity
                key={presetName}
                style={styles.presetButton}
                onPress={() => applyPreset(presetName)}
              >
                <Text style={styles.presetText}>{presetName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Note Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Select Note for String {selectedStringIndex !== null ? selectedStringIndex + 1 : ''}
            </Text>
            <ScrollView style={styles.noteList}>
              {NOTES.map((note) => (
                <TouchableOpacity
                  key={note}
                  style={[
                    styles.noteOption,
                    selectedStringIndex !== null && 
                    currentTuning[selectedStringIndex] === note && 
                    styles.noteOptionSelected
                  ]}
                  onPress={() => selectNote(note)}
                >
                  <Text style={[
                    styles.noteOptionText,
                    selectedStringIndex !== null && 
                    currentTuning[selectedStringIndex] === note && 
                    styles.noteOptionTextSelected
                  ]}>
                    {note}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#BBDEFB',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  headerSection: {
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  tuningGrid: {
    gap: 10,
    marginBottom: 15,
  },
  stringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stringLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    flex: 1,
  },
  noteSelector: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#90CAF9',
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
    marginLeft: 8,
  },
  presetSection: {
    borderTopWidth: 1,
    borderTopColor: '#90CAF9',
    paddingTop: 15,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  presetText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
    textAlign: 'center',
  },
  noteList: {
    maxHeight: 300,
  },
  noteOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  noteOptionSelected: {
    backgroundColor: '#1976D2',
  },
  noteOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  noteOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TuningControls;