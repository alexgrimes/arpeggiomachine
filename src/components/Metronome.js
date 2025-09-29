// Metronome.js
// Simple metronome and tempo control stub for React Native
// To be integrated with audio engine for click track

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { useMusicStore } from '../store/useMusicStore';

const Metronome = () => {
  const tempo = useMusicStore((state) => state.tempo);
  const setTempo = useMusicStore((state) => state.setTempo);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);

  // Simple Web Audio API click sound
  const playClick = () => {
    try {
      const ctx = window.AudioContext ? new window.AudioContext() : new window.webkitAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 1200;
      gain.gain.value = 0.2;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
      osc.onended = () => ctx.close();
    } catch {}
  };

  const startMetronome = () => {
    if (intervalRef.current) return;
    setIsPlaying(true);
    playClick();
    intervalRef.current = setInterval(() => {
      playClick();
    }, 60000 / tempo);
  };

  const stopMetronome = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Sync tempo changes while running
  React.useEffect(() => {
    if (isPlaying) {
      stopMetronome();
      startMetronome();
    }
    // eslint-disable-next-line
  }, [tempo]);

  React.useEffect(() => () => stopMetronome(), []);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tempo: {tempo} BPM</Text>
      <Slider
        style={styles.slider}
        minimumValue={40}
        maximumValue={220}
        value={tempo}
        onValueChange={setTempo}
        step={1}
        minimumTrackTintColor="#4CAF50"
        maximumTrackTintColor="#ddd"
      />
      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, isPlaying && styles.buttonActive]} onPress={startMetronome}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={stopMetronome}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  slider: {
    width: 200,
    height: 40,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 5,
  },
  buttonActive: {
    backgroundColor: '#388E3C',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Metronome;
