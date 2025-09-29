import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal, FlatList } from 'react-native';
import { useMusicStore } from '../../store/useMusicStore';
import * as progressionStorage from '../../utils/progressionStorage';


const ProgressionComposer = () => {
  const { 
    selectedKey, 
    selectedScale,
    progression,
    tempo,
    setTempo,
    isAudioInitialized,
    isPlayingProgression,
    addToProgression,
    removeFromProgression,
    clearProgression,
    playProgressionAudio,
    initializeAudio: initStoreAudio,
    stopAudio
  } = useMusicStore();

  // Save/load modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [progressionName, setProgressionName] = useState('');
  const [progressionList, setProgressionList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Fetch saved progressions
  const refreshProgressionList = async () => {
    setLoadingList(true);
    const list = await progressionStorage.listProgressions();
    setProgressionList(list);
    setLoadingList(false);
  };

  useEffect(() => {
    if (modalVisible) refreshProgressionList();
  }, [modalVisible]);

  // Save progression
  const handleSaveProgression = async () => {
    if (!progressionName.trim()) return;
    await progressionStorage.saveProgression(progressionName.trim(), {
      progression,
      tempo,
      key: selectedKey,
      scale: selectedScale
    });
    setProgressionName('');
    refreshProgressionList();
    Alert.alert('Saved', 'Progression saved!');
  };

  // Load progression
  const handleLoadProgression = async (name) => {
    try {
      const data = await progressionStorage.loadProgression(name);
      if (data.progression) {
        clearProgression();
        data.progression.forEach(chord => addToProgression(chord));
      }
      if (data.tempo) setTempo(data.tempo);
      setModalVisible(false);
      Alert.alert('Loaded', `Progression "${name}" loaded!`);
    } catch (e) {
      Alert.alert('Error', 'Could not load progression.');
    }
  };

  // Delete progression
  const handleDeleteProgression = async (name) => {
    await progressionStorage.deleteProgression(name);
    refreshProgressionList();
    Alert.alert('Deleted', 'Progression deleted.');
  };

  // Handle play progression with audio
  const handlePlayProgression = async () => {
    if (progression.length === 0) return;

    // Initialize audio if not already done
    if (!isAudioInitialized) {
      await initStoreAudio();
    }

    // Play the progression
    await playProgressionAudio();
  };

  // Handle stop audio
  const handleStopAudio = () => {
    stopAudio();
  };

  const renderProgressionChord = (chordInfo, index) => {
    const { symbol, romanNumeral, notes } = chordInfo;
    
    return (
      <TouchableOpacity
        key={index}
        style={styles.progressionChord}
        onLongPress={() => {
          Alert.alert(
            'Remove Chord',
            `Remove ${symbol} from progression?`,
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Remove', onPress: () => removeFromProgression(index) }
            ]
          );
        }}
      >
        <Text style={styles.chordSymbol}>{symbol}</Text>
        <Text style={styles.romanNumeral}>{romanNumeral}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptySlot = (index) => (
    <View key={`empty-${index}`} style={styles.emptySlot}>
      <Text style={styles.emptyText}>+</Text>
    </View>
  );

  const maxChords = 8;
  const progressionDisplay = [];
  
  // Add existing progression chords
  progression.forEach((chord, index) => {
    progressionDisplay.push(renderProgressionChord(chord, index));
  });
  
  // Fill remaining slots with empty placeholders
  for (let i = progression.length; i < maxChords; i++) {
    progressionDisplay.push(renderEmptySlot(i));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Chord Progression</Text>
        <Text style={styles.keyInfo}>
          {selectedKey} {selectedScale} • Tempo: 
          <TextInput
            style={styles.tempoInput}
            value={tempo.toString()}
            keyboardType="numeric"
            onChangeText={t => setTempo(Number(t.replace(/[^0-9]/g, '')) || 1)}
            maxLength={3}
          />
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.progressionContainer}
      >
        {progressionDisplay}
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, styles.playButton, isPlayingProgression && styles.playingButton]}
          onPress={isPlayingProgression ? handleStopAudio : handlePlayProgression}
          disabled={progression.length === 0}
        >
          <Text style={styles.buttonText}>
            {isPlayingProgression ? 'Stop' : 'Play'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.controlButton, styles.clearButton]}
          onPress={clearProgression}
          disabled={progression.length === 0 || isPlayingProgression}
        >
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.saveButton]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Save/Load</Text>
        </TouchableOpacity>
      </View>

      {/* Save/Load Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save/Load Progression</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Progression Name"
              value={progressionName}
              onChangeText={setProgressionName}
              maxLength={32}
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveProgression}
                disabled={!progressionName.trim() || progression.length === 0}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Saved Progressions:</Text>
            <FlatList
              data={progressionList}
              keyExtractor={item => item}
              refreshing={loadingList}
              onRefresh={refreshProgressionList}
              renderItem={({ item }) => (
                <View style={styles.progressionListItem}>
                  <Text style={styles.progressionListName}>{item}</Text>
                  <View style={styles.progressionListActions}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.loadButton]}
                      onPress={() => handleLoadProgression(item)}
                    >
                      <Text style={styles.buttonText}>Load</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.clearButton]}
                      onPress={() => handleDeleteProgression(item)}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No saved progressions.</Text>}
              style={{ maxHeight: 200 }}
            />
          </View>
        </View>
      </Modal>

      {progression.length > 0 && (
        <View style={styles.progressionInfo}>
          <Text style={styles.infoText}>
            Progression: {progression.map(chord => chord.romanNumeral).join(' - ')}
          </Text>
          <Text style={styles.infoText}>
            Chords: {progression.map(chord => chord.symbol).join(' | ')}
          </Text>
        </View>
      )}

      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Long press chords in the analysis grid to add them to this progression
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    margin: 10,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 5,
  },
  keyInfo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flexDirection: 'row',
    alignItems: 'center',
  },
  tempoInput: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    paddingHorizontal: 6,
    marginLeft: 4,
    width: 40,
    textAlign: 'center',
  },
  progressionContainer: {
    flexDirection: 'row',
    padding: 15,
    minWidth: '100%',
    justifyContent: 'flex-start',
  },
  progressionChord: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  chordSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  romanNumeral: {
    fontSize: 12,
    color: '#E0E7FF',
    fontWeight: '600',
  },
  emptySlot: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyText: {
    fontSize: 24,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  controlButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flex: 1,
    maxWidth: 120,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#00D4AA',
  },
  playingButton: {
    backgroundColor: '#FF6B6B',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  loadButton: {
    backgroundColor: '#2196F3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: 320,
    maxWidth: '90%',
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#4CAF50',
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    color: '#333',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    width: '100%',
    marginBottom: 10,
    fontSize: 14,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  modalButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
    minWidth: 60,
  },
  progressionListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  progressionListName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  progressionListActions: {
    flexDirection: 'row',
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressionInfo: {
    padding: 15,
    backgroundColor: '#F8F9FA',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 3,
  },
  instructions: {
    padding: 15,
    backgroundColor: '#F0F9FF',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  instructionText: {
    fontSize: 12,
    color: '#0369A1',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ProgressionComposer;