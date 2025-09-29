import { create } from 'zustand';
import { 
  initializeAudio, 
  playChord, 
  playProgression, 
  stopAudio, 
  setAudioVolume, 
  setAudioInstrument,
  getAudioState
} from '../utils/audioEngine';

// Musical constants from your original app
const MUSICAL_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F♯/G♭', 'D♭', 'A♭', 'E♭', 'B♭', 'F'];
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F♯m', 'C♯m', 'G♯m', 'D♯m/E♭m', 'B♭m', 'Fm', 'Cm', 'Gm', 'Dm'];

const INSTRUMENTS = {
  guitar: {
    name: 'Guitar',
    strings: ['E', 'A', 'D', 'G', 'B', 'E'],
    frets: 24,
    defaultTuning: ['E', 'A', 'D', 'G', 'B', 'E']
  },
  bass: {
    name: 'Bass Guitar',
    strings: ['E', 'A', 'D', 'G'],
    frets: 24,
    defaultTuning: ['E', 'A', 'D', 'G']
  },
  ukulele: {
    name: 'Ukulele',
    strings: ['G', 'C', 'E', 'A'],
    frets: 15,
    defaultTuning: ['G', 'C', 'E', 'A']
  },
};

const SCALES = {
  major: 'Major',
  minor: 'Natural Minor',
  harmonicMinor: 'Harmonic Minor',
  melodicMinor: 'Melodic Minor',
  majorPentatonic: 'Major Pentatonic',
  minorPentatonic: 'Minor Pentatonic',
};

export const useMusicStore = create((set, get) => ({
  // Core musical state
  selectedKey: 'C',
  selectedScale: 'major',
  selectedInstrument: 'guitar',
  chordMode: 'triads', // 'triads', 'sevenths', 'secondary', 'diminished'

  // Nashville Number System
  showNashville: false, // Toggle for Nashville number display

  
  // Instrument state
  currentTuning: INSTRUMENTS.guitar.defaultTuning,
  
  // Chord selection state
  selectedChord: null,
  
  // Custom chord creation state
  customChordNotes: [],
  customChordRoot: null,
  isChordBuildingMode: false,
  builtChord: null, // { name, notes, intervals }
  
  // Simple progression state
  progression: [], // Array of chord objects { symbol, romanNumeral, notes }
  
  // Complex progression state (for advanced features)
  progressionActive: false,
  progressionKey: 'C',
  progressionMeasures: [],
  selectedMeasureIndex: null,
  isPlaying: false,
  isLooping: true,
  tempo: 120,
  timeSignature: '4/4',
  
  // Fretboard state
  currentPosition: null,
  isPositionZoomed: false,
  arpeggioLinesEnabled: true,
  
  // Audio state
  isAudioInitialized: false,
  audioVolume: 0.3,
  audioInstrument: 'guitar',
  isPlayingChord: false,
  isPlayingProgression: false,
  
  // Actions
  setSelectedKey: (key) => set({ selectedKey: key }),

  setSelectedScale: (scale) => set({ selectedScale: scale }),

  setSelectedInstrument: (instrument) => {
    const instrumentData = INSTRUMENTS[instrument];
    set({ 
      selectedInstrument: instrument,
      currentTuning: [...instrumentData.defaultTuning]
    });
  },

  // Nashville toggle
  setShowNashville: (show) => set({ showNashville: show }),
  
  setChordMode: (mode) => set({ chordMode: mode }),
  
  setCurrentTuning: (tuning) => set({ currentTuning: tuning }),
  
  setSelectedChord: (chord) => set({ selectedChord: chord }),
  
  // Custom chord actions
  addCustomChordNote: (note) => {
    const { customChordNotes } = get();
    if (!customChordNotes.includes(note) && customChordNotes.length < 6) {
      const newNotes = [...customChordNotes, note];
      set({ 
        customChordNotes: newNotes,
        customChordRoot: newNotes.length === 1 ? note : get().customChordRoot
      });
    }
  },
  
  removeCustomChordNote: (note) => {
    const { customChordNotes, customChordRoot } = get();
    const newNotes = customChordNotes.filter(n => n !== note);
    set({ 
      customChordNotes: newNotes,
      customChordRoot: customChordRoot === note && newNotes.length > 0 
        ? newNotes[0] 
        : customChordRoot === note ? null : customChordRoot
    });
  },
  
  setCustomChordRoot: (note) => set({ customChordRoot: note }),
  
  clearCustomChord: () => set({ 
    customChordNotes: [], 
    customChordRoot: null,
    builtChord: null
  }),

  // Chord building actions
  toggleChordBuildingMode: () => set((state) => ({ 
    isChordBuildingMode: !state.isChordBuildingMode,
    customChordNotes: [],
    builtChord: null
  })),

  setBuiltChord: (chord) => set({ builtChord: chord }),

  addBuiltChordToProgression: () => {
    const { builtChord, progression } = get();
    if (builtChord) {
      set({ 
        progression: [...progression, {
          symbol: builtChord.name,
          romanNumeral: builtChord.romanNumeral || '?',
          notes: builtChord.notes
        }]
      });
    }
  },
  
  // Complex progression actions
  createProgression: (measureCount, timeSignature, key) => {
    set({
      progressionActive: true,
      progressionMeasures: new Array(measureCount).fill(null),
      progressionKey: key,
      timeSignature: timeSignature,
      selectedMeasureIndex: 0,
      isPlaying: false
    });
  },
  
  setProgressionChord: (index, chord) => {
    const { progressionMeasures } = get();
    const newMeasures = [...progressionMeasures];
    newMeasures[index] = chord;
    set({ progressionMeasures: newMeasures });
  },
  
  clearComplexProgression: () => set({
    progressionActive: false,
    progressionMeasures: [],
    selectedMeasureIndex: null,
    isPlaying: false
  }),
  
  setSelectedMeasureIndex: (index) => set({ selectedMeasureIndex: index }),
  
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setTempo: (tempo) => set({ tempo }),
  
  // Simple progression actions
  addToProgression: (chordInfo) => {
    const { progression } = get();
    set({ progression: [...progression, chordInfo] });
  },
  
  removeFromProgression: (index) => {
    const { progression } = get();
    const newProgression = progression.filter((_, i) => i !== index);
    set({ progression: newProgression });
  },
  
  clearProgression: () => set({ progression: [] }),
  
  // Audio actions
  initializeAudio: async () => {
    const initialized = await initializeAudio();
    set({ isAudioInitialized: initialized });
    return initialized;
  },
  
  playChordAudio: async (chordNotes, options = {}) => {
    const { audioVolume, audioInstrument } = get();
    
    if (!chordNotes || chordNotes.length === 0) return false;
    
    set({ isPlayingChord: true });
    
    const playOptions = {
      volume: audioVolume,
      instrument: audioInstrument,
      duration: 2.0,
      strummed: audioInstrument === 'guitar',
      ...options
    };
    
    try {
      const success = await playChord(chordNotes, playOptions);
      
      // Auto-reset playing state after chord duration
      setTimeout(() => {
        set({ isPlayingChord: false });
      }, (playOptions.duration + 0.5) * 1000);
      
      return success;
    } catch (error) {
      console.error('Error playing chord:', error);
      set({ isPlayingChord: false });
      return false;
    }
  },
  
  playProgressionAudio: async (progressionToPlay = null, options = {}) => {
    const { progression, audioVolume, audioInstrument } = get();
    const targetProgression = progressionToPlay || progression;
    
    if (targetProgression.length === 0) return false;
    
    set({ isPlayingProgression: true });
    
    const playOptions = {
      chordDuration: 1.5,
      gap: 0.2,
      volume: audioVolume,
      instrument: audioInstrument,
      ...options
    };
    
    try {
      const totalDuration = await playProgression(targetProgression, playOptions);
      
      // Auto-reset playing state after progression finishes
      setTimeout(() => {
        set({ isPlayingProgression: false });
      }, (totalDuration + 1) * 1000);
      
      return true;
    } catch (error) {
      console.error('Error playing progression:', error);
      set({ isPlayingProgression: false });
      return false;
    }
  },
  
  stopAudio: () => {
    stopAudio();
    set({ 
      isPlayingChord: false, 
      isPlayingProgression: false 
    });
  },
  
  setAudioVolume: (volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setAudioVolume(clampedVolume);
    set({ audioVolume: clampedVolume });
  },
  
  setAudioInstrument: (instrument) => {
    setAudioInstrument(instrument);
    set({ audioInstrument: instrument });
  },
  
  getAudioState: () => {
    return getAudioState();
  },
  
  playProgression: () => {
    // Legacy method for backward compatibility
    return get().playProgressionAudio();
  },
  
  // Fretboard actions
  setCurrentPosition: (position) => set({ currentPosition: position }),
  
  setIsPositionZoomed: (zoomed) => set({ isPositionZoomed: zoomed }),
  
  toggleArpeggioLines: () => set((state) => ({ 
    arpeggioLinesEnabled: !state.arpeggioLinesEnabled 
  })),
  
  // Utility getters
  getCurrentInstrument: () => INSTRUMENTS[get().selectedInstrument],
  
  getAvailableKeys: () => [...MUSICAL_KEYS, ...MINOR_KEYS],
  
  getAvailableScales: () => Object.keys(SCALES),
  
  getScaleName: (scale) => SCALES[scale] || scale,
}));