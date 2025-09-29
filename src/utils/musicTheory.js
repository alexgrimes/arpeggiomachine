// Enhanced Music Theory Utilities for React Native
// Extended from chord-visualizer-ii web app

export const NOTES = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];

// Scale patterns (semitone intervals from root)
export const SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  majorPentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  wholeTone: [0, 2, 4, 6, 8, 10],
  halfWholeDiminished: [0, 1, 3, 4, 6, 7, 9, 10],
  wholeHalfDiminished: [0, 2, 3, 5, 6, 8, 9, 11],
  // Legacy patterns for compatibility
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
};

/**
 * Convert a note name to its semitone value (0-11)
 */
export const noteToSemitone = (note) => {
  const cleanNote = note.replace(/♯|♭/g, match => match === '♯' ? '#' : 'b');
  const baseNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  let index = baseNotes.indexOf(cleanNote);
  if (index === -1) index = flatNotes.indexOf(cleanNote);
  if (index === -1) {
    // Handle combined notes like "F♯/G♭"
    const parts = cleanNote.split('/');
    index = baseNotes.indexOf(parts[0]);
    if (index === -1) index = flatNotes.indexOf(parts[0]);
  }
  return index === -1 ? 0 : index;
};

/**
 * Convert semitone back to note name with key context
 */
export const semitoneToNote = (semitone, keyContext = 'C') => {
  // Determine if we should use sharps or flats based on key context
  const flatKeys = ['F', 'B♭', 'E♭', 'A♭', 'D♭', 'G♭', 'Dm', 'Gm', 'Cm', 'Fm', 'B♭m'];
  const useFlats = flatKeys.some(key => keyContext.includes(key.replace('♭', 'b')));
  
  if (useFlats) {
    const flatNotes = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
    return flatNotes[semitone % 12];
  } else {
    const sharpNotes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
    return sharpNotes[semitone % 12];
  }
};

/**
 * Generate scale notes from root and pattern
 */
export const generateScale = (root, scaleType) => {
  const pattern = SCALE_PATTERNS[scaleType];
  if (!pattern) return [];
  
  const rootSemitone = noteToSemitone(root);
  return pattern.map(interval => 
    semitoneToNote((rootSemitone + interval) % 12, root)
  );
};

/**
 * Legacy function for compatibility
 */
export const generateScaleNotes = (key, scaleType = 'major') => {
  return generateScale(key, scaleType);
};

/**
 * Generate diatonic triads from scale
 */
export const generateTriads = (scaleNotes, keyRoot) => {
  const triads = [];
  
  scaleNotes.forEach((note, index) => {
    const thirdIndex = (index + 2) % scaleNotes.length;
    const fifthIndex = (index + 4) % scaleNotes.length;
    
    const third = scaleNotes[thirdIndex];
    const fifth = scaleNotes[fifthIndex];
    
    const chordNotes = [note, third, fifth];
    const symbol = determineTriadSymbol(note, third, fifth);
    const romanNumeral = generateRomanNumeral(index, 'major', keyRoot);
    
    triads.push({
      symbol,
      notes: chordNotes,
      root: note,
      romanNumeral,
      scaleDegree: index + 1,
      degrees: ['1', '3', '5']
    });
  });
  
  return triads;
};

/**
 * Generate diatonic seventh chords from scale
 */
export const generateSevenths = (scaleNotes, keyRoot) => {
  const sevenths = [];
  
  scaleNotes.forEach((note, index) => {
    const thirdIndex = (index + 2) % scaleNotes.length;
    const fifthIndex = (index + 4) % scaleNotes.length;
    const seventhIndex = (index + 6) % scaleNotes.length;
    
    const third = scaleNotes[thirdIndex];
    const fifth = scaleNotes[fifthIndex];
    const seventh = scaleNotes[seventhIndex];
    
    const chordNotes = [note, third, fifth, seventh];
    const symbol = determineSeventhSymbol(note, third, fifth, seventh);
    const romanNumeral = generateRomanNumeral(index, 'major', keyRoot) + '7';
    
    sevenths.push({
      symbol,
      notes: chordNotes,
      root: note,
      romanNumeral,
      scaleDegree: index + 1,
      degrees: ['1', '3', '5', '7']
    });
  });
  
  return sevenths;
};

/**
 * Determine triad quality from intervals
 */
const determineTriadSymbol = (root, third, fifth) => {
  const rootSemi = noteToSemitone(root);
  const thirdInterval = (noteToSemitone(third) - rootSemi + 12) % 12;
  const fifthInterval = (noteToSemitone(fifth) - rootSemi + 12) % 12;
  
  if (thirdInterval === 4 && fifthInterval === 7) {
    return root; // Major
  } else if (thirdInterval === 3 && fifthInterval === 7) {
    return root + 'm'; // Minor
  } else if (thirdInterval === 3 && fifthInterval === 6) {
    return root + '°'; // Diminished
  } else if (thirdInterval === 4 && fifthInterval === 8) {
    return root + '+'; // Augmented
  }
  return root; // Default to major
};

/**
 * Determine seventh chord quality
 */
const determineSeventhSymbol = (root, third, fifth, seventh) => {
  const baseSymbol = determineTriadSymbol(root, third, fifth);
  const rootSemi = noteToSemitone(root);
  const seventhInterval = (noteToSemitone(seventh) - rootSemi + 12) % 12;
  
  if (seventhInterval === 11) { // Major 7th
    if (baseSymbol === root) return root + 'maj7';
    if (baseSymbol === root + 'm') return root + 'mMaj7';
  } else if (seventhInterval === 10) { // Minor 7th
    if (baseSymbol === root) return root + '7';
    if (baseSymbol === root + 'm') return root + 'm7';
    if (baseSymbol === root + '°') return root + 'm7♭5';
  } else if (seventhInterval === 9) { // Diminished 7th
    return root + '°7';
  }
  
  return baseSymbol + '7'; // Default
};

/**
 * Generate Roman numerals for chord degrees
 */
export const generateRomanNumeral = (degree, mode, keyRoot) => {
  const isMinor = keyRoot.includes('m') || mode === 'minor';
  
  if (isMinor) {
    const minorNumerals = ['i', 'ii°', '♭III', 'iv', 'v', '♭VI', '♭VII'];
    return minorNumerals[degree] || 'i';
  } else {
    const majorNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
    return majorNumerals[degree] || 'I';
  }
};

/**
 * Generate secondary dominants
 */
export const generateSecondaryDominants = (keyRoot, scaleNotes) => {
  const secondaries = [];
  
  scaleNotes.forEach((targetNote, index) => {
    if (index === 0) return; // Skip tonic
    
    // Create V7 of each scale degree
    const dominantRoot = semitoneToNote((noteToSemitone(targetNote) + 7) % 12, keyRoot);
    const third = semitoneToNote((noteToSemitone(dominantRoot) + 4) % 12, keyRoot);
    const fifth = semitoneToNote((noteToSemitone(dominantRoot) + 7) % 12, keyRoot);
    const seventh = semitoneToNote((noteToSemitone(dominantRoot) + 10) % 12, keyRoot);
    
    const targetRoman = generateRomanNumeral(index, 'major', keyRoot);
    
    secondaries.push({
      symbol: dominantRoot + '7',
      notes: [dominantRoot, third, fifth, seventh],
      root: dominantRoot,
      romanNumeral: `V7/${targetRoman}`,
      target: targetNote,
      degrees: ['1', '3', '5', '♭7']
    });
  });
  
  return secondaries;
};

/**
 * Check if note is in chord
 */
export const isNoteInChord = (note, chord) => {
  if (!chord || !chord.notes) return false;
  const noteSemi = noteToSemitone(note);
  return chord.notes.some(chordNote => noteToSemitone(chordNote) === noteSemi);
};

/**
 * Check if note is chord root
 */
export const isChordRoot = (note, chord) => {
  if (!chord || !chord.root) return false;
  return noteToSemitone(note) === noteToSemitone(chord.root);
};

/**
 * Check if note is in scale
 */
export const isNoteInScale = (note, scaleNotes) => {
  const noteSemi = noteToSemitone(note);
  return scaleNotes.some(scaleNote => noteToSemitone(scaleNote) === noteSemi);
};

/**
 * Get chord frequencies for audio playback
 */
export const getChordFrequencies = (chordNotes) => {
  const noteFrequencies = {
    'C': 261.63, 'C♯': 277.18, 'D♭': 277.18, 'D': 293.66, 'D♯': 311.13, 'E♭': 311.13,
    'E': 329.63, 'F': 349.23, 'F♯': 369.99, 'G♭': 369.99, 'G': 392.00, 'G♯': 415.30,
    'A♭': 415.30, 'A': 440.00, 'A♯': 466.16, 'B♭': 466.16, 'B': 493.88
  };
  
  return chordNotes.map(note => {
    const cleanNote = note.split('/')[0]; // Handle enharmonic equivalents
    return noteFrequencies[cleanNote] || 440;
  });
};

/**
 * Legacy function for compatibility
 */
export const noteToFrequency = (note, octave = 4) => {
  const A4 = 440;
  const semitone = noteToSemitone(note);
  const semitonesFromA4 = semitone - 9 + (octave - 4) * 12;
  return A4 * Math.pow(2, semitonesFromA4 / 12);
};

// Re-export scale patterns for compatibility
export const scalePatterns = SCALE_PATTERNS;