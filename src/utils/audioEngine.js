// Enhanced Audio System for Chord Visualizer
// Web Audio API-based synthesis with realistic instrument sounds

class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.masterVolume = 0.3;
    this.currentInstrument = 'guitar';
    this.isInitialized = false;
  }

  // Initialize Audio Context (must be called after user interaction)
  async initialize() {
    if (this.isInitialized) return true;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
      return false;
    }
  }

  // Convert note name to frequency
  noteToFrequency(note, octave = 4) {
    const noteMap = {
      'C': -9, 'C#': -8, 'Db': -8,
      'D': -7, 'D#': -6, 'Eb': -6,
      'E': -5,
      'F': -4, 'F#': -3, 'Gb': -3,
      'G': -2, 'G#': -1, 'Ab': -1,
      'A': 0, 'A#': 1, 'Bb': 1,
      'B': 2
    };
    
    const cleanNote = note.replace(/♯/g, '#').replace(/♭/g, 'b');
    const semitoneOffset = noteMap[cleanNote] || 0;
    const totalSemitones = (octave - 4) * 12 + semitoneOffset;
    
    return 440 * Math.pow(2, totalSemitones / 12);
  }

  // Create instrument-specific oscillator settings
  getInstrumentSettings(instrument) {
    const settings = {
      guitar: {
        waveform: 'sine',
        attack: 0.08,      // Slower attack
        decay: 0.5,        // Longer decay
        sustain: 0.3,      // Lower sustain
        release: 2.0,      // Longer release
        filterFrequency: 1600, // Slightly darker
        filterQ: 1,
        masterVolume: 0.18 // Lower overall volume
      },
      piano: {
        waveform: 'triangle',
        attack: 0.01,
        decay: 0.1,
        sustain: 0.8,
        release: 0.5,
        filterFrequency: 4000,
        filterQ: 0.5
      },
      bass: {
        waveform: 'sawtooth',
        attack: 0.01,
        decay: 0.2,
        sustain: 0.6,
        release: 0.8,
        filterFrequency: 800,
        filterQ: 2
      },
      organ: {
        waveform: 'square',
        attack: 0.1,
        decay: 0.1,
        sustain: 0.9,
        release: 0.2,
        filterFrequency: 3000,
        filterQ: 0.3
      }
    };
    
    return settings[instrument] || settings.guitar;
  }

  // Create and play a single note
  playNote(note, octave = 4, duration = 1.0, startTime = 0) {
    if (!this.isInitialized) return null;

    const frequency = this.noteToFrequency(note, octave);
    const settings = this.getInstrumentSettings(this.currentInstrument);
    const now = this.audioContext.currentTime + startTime;

    // Create oscillator
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = settings.waveform;
    oscillator.frequency.setValueAtTime(frequency, now);

    // Create filter for tone shaping
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(settings.filterFrequency, now);
    filter.Q.setValueAtTime(settings.filterQ, now);

    // Create envelope (ADSR)
    const gainNode = this.audioContext.createGain();
    const envelope = gainNode.gain;
    envelope.setValueAtTime(0, now);
    
    // Attack
    envelope.linearRampToValueAtTime(this.masterVolume, now + settings.attack);
    
    // Decay
    envelope.exponentialRampToValueAtTime(
      this.masterVolume * settings.sustain, 
      now + settings.attack + settings.decay
    );
    
    // Release
    const releaseStart = now + duration - settings.release;
    envelope.exponentialRampToValueAtTime(0.001, releaseStart + settings.release);

    // Connect audio graph
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Schedule playback
    oscillator.start(now);
    oscillator.stop(now + duration);

    return { oscillator, gainNode, filter };
  }

  // Play a chord (multiple notes simultaneously)
  playChord(notes, octaves = null, duration = 2.0, startTime = 0) {
    if (!this.isInitialized || !notes.length) return [];

    const audioNodes = [];
    
    notes.forEach((note, index) => {
      let octave = 4;
      
      if (octaves && octaves[index]) {
        octave = octaves[index];
      } else {
        // Smart octave assignment based on instrument
        switch (this.currentInstrument) {
          case 'bass':
            octave = index === 0 ? 2 : 3; // Root in lower octave
            break;
          case 'guitar':
            octave = 3 + (index % 2); // Alternate between octaves 3 and 4
            break;
          default:
            octave = 4;
        }
      }
      
      const nodeGroup = this.playNote(note, octave, duration, startTime);
      if (nodeGroup) {
        audioNodes.push(nodeGroup);
      }
    });

    return audioNodes;
  }

  // Play chord with guitar-like strumming pattern
  playChordStrummed(notes, direction = 'down', speed = 0.05) {
    if (!this.isInitialized || !notes.length) return [];

    const audioNodes = [];
    const noteOrder = direction === 'up' ? notes.slice().reverse() : notes;
    
    noteOrder.forEach((note, index) => {
      const delay = index * speed;
      const nodeGroup = this.playNote(note, 3 + (index % 2), 2.0, delay);
      if (nodeGroup) {
        audioNodes.push(nodeGroup);
      }
    });

    return audioNodes;
  }

  // Play a sequence of chords (progression)
  async playProgression(chordProgression, chordDuration = 2.0, gap = 0.1) {
    if (!this.isInitialized || !chordProgression.length) return;

    let currentTime = 0;
    
    for (const chord of chordProgression) {
      if (chord.notes && chord.notes.length > 0) {
        this.playChord(chord.notes, null, chordDuration, currentTime);
        currentTime += chordDuration + gap;
      }
    }
    
    return currentTime; // Total duration
  }

  // Set master volume (0.0 to 1.0)
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  // Change instrument
  setInstrument(instrument) {
    this.currentInstrument = instrument;
  }

  // Stop all audio
  stopAll() {
    if (this.audioContext) {
      // Create a new context to stop all sounds
      this.audioContext.close();
      this.initialize();
    }
  }

  // Get current audio state
  getState() {
    return {
      isInitialized: this.isInitialized,
      volume: this.masterVolume,
      instrument: this.currentInstrument,
      contextState: this.audioContext?.state
    };
  }
}

// Create singleton instance
const audioEngine = new AudioEngine();

// Utility functions for chord playback
export const initializeAudio = async () => {
  return await audioEngine.initialize();
};

export const playChord = async (chordNotes, options = {}) => {
  const {
    duration = 2.0,
    instrument = 'guitar',
    volume = 0.3,
    strummed = false,
    strumDirection = 'down'
  } = options;

  if (!audioEngine.isInitialized) {
    const initialized = await audioEngine.initialize();
    if (!initialized) return false;
  }

  audioEngine.setInstrument(instrument);
  audioEngine.setVolume(volume);

  if (strummed) {
    audioEngine.playChordStrummed(chordNotes, strumDirection);
  } else {
    audioEngine.playChord(chordNotes, null, duration);
  }

  return true;
};

export const playProgression = async (progression, options = {}) => {
  const {
    chordDuration = 2.0,
    gap = 0.2,
    instrument = 'guitar',
    volume = 0.3
  } = options;

  if (!audioEngine.isInitialized) {
    const initialized = await audioEngine.initialize();
    if (!initialized) return false;
  }

  audioEngine.setInstrument(instrument);
  audioEngine.setVolume(volume);

  const totalDuration = await audioEngine.playProgression(progression, chordDuration, gap);
  return totalDuration;
};

export const stopAudio = () => {
  audioEngine.stopAll();
};

export const setAudioVolume = (volume) => {
  audioEngine.setVolume(volume);
};

export const setAudioInstrument = (instrument) => {
  audioEngine.setInstrument(instrument);
};

export const getAudioState = () => {
  return audioEngine.getState();
};

export default audioEngine;