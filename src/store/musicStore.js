// Music Store - Global state management with Zustand
// Handles key, scale, instrument, chord selection, and progression state

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { instruments } from '../utils/instruments.js';

const useMusicStore = create((set, get) => ({
  // Core music state
  selectedKey: 'C',
  selectedScale: 'major',
  selectedInstrument: 'guitar',
  currentTuning: instruments.guitar.defaultTuning,
  
  // Chord and note state
  selectedChord: null,
  customChordNotes: [],
  customChordRoot: null,
  
  // Position and fretboard state
  currentPosition: null,
  isPositionZoomed: false,
  arpeggioLinesEnabled: true,
  
  // Progression state
  progressionMeasures: Array(16).fill(null),
  selectedMeasure: 0,
  progressionActive: false,
  isPlaying: false,
  isLooping: true,
  tempo: 120,
  beatsPerMeasure: 4,
  countInActive: false,
  
  // Actions for music theory
  setSelectedKey: (key) => set({ selectedKey: key }),
  setSelectedScale: (scale) => set({ selectedScale: scale }),
  setSelectedInstrument: (instrument) => {
    const instrumentData = instruments[instrument];
    set({ 
      selectedInstrument: instrument,
      currentTuning: instrumentData.defaultTuning,
      currentPosition: null,
      isPositionZoomed: false
    });
  },
  setCurrentTuning: (tuning) => set({ currentTuning: tuning }),
  
  // Actions for chords
  setSelectedChord: (chord) => set({ selectedChord: chord }),
  setCustomChordNotes: (notes) => set({ customChordNotes: notes }),
  setCustomChordRoot: (root) => set({ customChordRoot: root }),
  addCustomChordNote: (note) => {
    const { customChordNotes } = get();
    if (!customChordNotes.includes(note)) {
      set({ customChordNotes: [...customChordNotes, note] });
    }
  },
  removeCustomChordNote: (note) => {
    const { customChordNotes } = get();
    set({ customChordNotes: customChordNotes.filter(n => n !== note) });
  },
  clearCustomChord: () => set({ customChordNotes: [], customChordRoot: null }),
  
  // Actions for position and fretboard
  setCurrentPosition: (position) => set({ currentPosition: position }),
  setPositionZoomed: (zoomed) => set({ isPositionZoomed: zoomed }),
  toggleArpeggioLines: () => {
    const { arpeggioLinesEnabled } = get();
    set({ arpeggioLinesEnabled: !arpeggioLinesEnabled });
  },
  
  // Actions for progression
  setProgressionMeasure: (index, chord) => {
    const { progressionMeasures } = get();
    const newMeasures = [...progressionMeasures];
    newMeasures[index] = chord;
    set({ progressionMeasures: newMeasures });
  },
  setSelectedMeasure: (measure) => set({ selectedMeasure: measure }),
  setProgressionActive: (active) => set({ progressionActive: active }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsLooping: (looping) => set({ isLooping: looping }),
  setTempo: (tempo) => set({ tempo: tempo }),
  setBeatsPerMeasure: (beats) => set({ beatsPerMeasure: beats }),
  setCountInActive: (active) => set({ countInActive: active }),
  
  // Persistence actions
  saveState: async () => {
    try {
      const state = get();
      const stateToSave = {
        selectedKey: state.selectedKey,
        selectedScale: state.selectedScale,
        selectedInstrument: state.selectedInstrument,
        currentTuning: state.currentTuning,
        progressionMeasures: state.progressionMeasures,
        tempo: state.tempo,
        beatsPerMeasure: state.beatsPerMeasure,
        isLooping: state.isLooping
      };
      await AsyncStorage.setItem('musicAppState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  },
  
  loadState: async () => {
    try {
      const savedState = await AsyncStorage.getItem('musicAppState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        set(parsedState);
      }
    } catch (error) {
      console.error('Failed to load state:', error);
    }
  }
}));

export { useMusicStore };
export default useMusicStore;