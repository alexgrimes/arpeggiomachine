import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useMusicStore } from '../../store/useMusicStore';

const AudioControls = () => {
  const {
    isAudioInitialized,
    isPlayingChord,
    isPlayingProgression,
    initializeAudio: initStoreAudio,
    stopAudio,
    getAudioState
  } = useMusicStore();

  const [audioState, setAudioState] = useState(null);

  // Initialize audio on component mount if needed
  useEffect(() => {
    const initAudio = async () => {
      if (!isAudioInitialized) {
        await initStoreAudio();
      }
      const state = getAudioState();
      setAudioState(state);
    };
    
    initAudio();
  }, []);

  // Update audio state when playback changes
  useEffect(() => {
    if (isAudioInitialized) {
      const state = getAudioState();
      setAudioState(state);
    }
  }, [isPlayingChord, isPlayingProgression, isAudioInitialized]);

  const handleStopAudio = () => {
    stopAudio();
  };

  const handleInitializeAudio = async () => {
    await initStoreAudio();
  };

  const renderAudioStatus = () => (
    <View style={styles.audioStatus}>
      <View style={styles.statusIndicators}>
        <View style={[
          styles.statusIndicator,
          isAudioInitialized ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={styles.statusText}>
            {isAudioInitialized ? '🔊 Audio Ready' : '🔇 Initialize Audio'}
          </Text>
        </View>
        
        {(isPlayingChord || isPlayingProgression) && (
          <View style={[styles.statusIndicator, styles.statusPlaying]}>
            <Text style={styles.statusText}>
              {isPlayingChord ? '🎵 Playing Chord' : '🎼 Playing Progression'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Audio Status */}
      {renderAudioStatus()}
      
      {/* Initialize Audio Button (if not initialized) */}
      {!isAudioInitialized && (
        <TouchableOpacity 
          style={styles.initButton}
          onPress={handleInitializeAudio}
        >
          <Text style={styles.initButtonText}>🎵 Enable Audio</Text>
        </TouchableOpacity>
      )}
      
      {/* Stop Audio Button (if playing) */}
      {(isPlayingChord || isPlayingProgression) && (
        <TouchableOpacity 
          style={styles.stopButton}
          onPress={handleStopAudio}
        >
          <Text style={styles.stopButtonText}>⏹ Stop Audio</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    margin: 10,
    padding: 15,
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Audio Status
  audioStatus: {
    marginBottom: 15,
  },
  statusIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  statusInactive: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  statusPlaying: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Initialize Button
  initButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  initButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Stop Button
  stopButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AudioControls;