// Chord analysis utilities for identifying chords from selected notes

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Convert note name to semitone number
const noteToSemitone = (note) => {
  const cleanNote = note.replace(/♯/g, '#').replace(/♭/g, 'b');
  const noteMap = {
    'C': 0, 'C#': 1, 'Db': 1,
    'D': 2, 'D#': 3, 'Eb': 3,
    'E': 4,
    'F': 5, 'F#': 6, 'Gb': 6,
    'G': 7, 'G#': 8, 'Ab': 8,
    'A': 9, 'A#': 10, 'Bb': 10,
    'B': 11
  };
  return noteMap[cleanNote] !== undefined ? noteMap[cleanNote] : 0;
};

// Convert semitone back to note name
const semitoneToNote = (semitone) => {
  return NOTES[semitone % 12];
};

// Calculate intervals from root note
const calculateIntervals = (notes, root) => {
  const rootSemitone = noteToSemitone(root);
  return notes
    .map(note => noteToSemitone(note))
    .map(semitone => (semitone - rootSemitone + 12) % 12)
    .sort((a, b) => a - b);
};

// Chord patterns for identification
const CHORD_PATTERNS = [
  // Triads
  { intervals: [0, 4, 7], name: 'Major', suffix: '' },
  { intervals: [0, 3, 7], name: 'Minor', suffix: 'm' },
  { intervals: [0, 4, 8], name: 'Augmented', suffix: 'aug' },
  { intervals: [0, 3, 6], name: 'Diminished', suffix: 'dim' },
  
  // Suspended chords
  { intervals: [0, 2, 7], name: 'Suspended 2nd', suffix: 'sus2' },
  { intervals: [0, 5, 7], name: 'Suspended 4th', suffix: 'sus4' },
  
  // Seventh chords
  { intervals: [0, 4, 7, 11], name: 'Major 7th', suffix: 'maj7' },
  { intervals: [0, 3, 7, 10], name: 'Minor 7th', suffix: 'm7' },
  { intervals: [0, 4, 7, 10], name: 'Dominant 7th', suffix: '7' },
  { intervals: [0, 3, 6, 10], name: 'Half-Diminished 7th', suffix: 'm7b5' },
  { intervals: [0, 3, 6, 9], name: 'Diminished 7th', suffix: 'dim7' },
  
  // Extended chords
  { intervals: [0, 4, 7, 11, 2], name: 'Major 9th', suffix: 'maj9' },
  { intervals: [0, 3, 7, 10, 2], name: 'Minor 9th', suffix: 'm9' },
  { intervals: [0, 4, 7, 10, 2], name: 'Dominant 9th', suffix: '9' },
  
  // Add more patterns as needed
];

// Try to identify chord from intervals
const identifyChordFromIntervals = (intervals, root) => {
  // Sort intervals to normalize
  const sortedIntervals = [...intervals].sort((a, b) => a - b);
  
  // Try exact matches first
  for (const pattern of CHORD_PATTERNS) {
    if (arraysEqual(sortedIntervals, pattern.intervals)) {
      return {
        name: `${root}${pattern.suffix}`,
        type: pattern.name,
        intervals: sortedIntervals,
        confidence: 'high'
      };
    }
  }
  
  // Try partial matches (for incomplete chords)
  for (const pattern of CHORD_PATTERNS) {
    if (isSubset(sortedIntervals, pattern.intervals)) {
      return {
        name: `${root}${pattern.suffix} (partial)`,
        type: pattern.name,
        intervals: sortedIntervals,
        confidence: 'medium'
      };
    }
  }
  
  // If no match found, return generic description
  return {
    name: `${root} chord`,
    type: 'Unknown',
    intervals: sortedIntervals,
    confidence: 'low'
  };
};

// Helper functions
const arraysEqual = (a, b) => {
  return a.length === b.length && a.every((val, idx) => val === b[idx]);
};

const isSubset = (subset, superset) => {
  return subset.every(val => superset.includes(val));
};

// Main chord analysis function
export const analyzeChord = (selectedNotes) => {
  if (!selectedNotes || selectedNotes.length < 2) {
    return null;
  }
  
  // Remove duplicates and sort
  const uniqueNotes = [...new Set(selectedNotes)];
  
  if (uniqueNotes.length < 2) {
    return {
      name: uniqueNotes[0],
      type: 'Single Note',
      notes: uniqueNotes,
      intervals: [0],
      confidence: 'high'
    };
  }
  
  // Try each note as potential root
  let bestMatch = null;
  let highestConfidence = 0;
  
  for (const potentialRoot of uniqueNotes) {
    const intervals = calculateIntervals(uniqueNotes, potentialRoot);
    const analysis = identifyChordFromIntervals(intervals, potentialRoot);
    
    const confidenceScore = 
      analysis.confidence === 'high' ? 3 :
      analysis.confidence === 'medium' ? 2 : 1;
    
    if (confidenceScore > highestConfidence) {
      highestConfidence = confidenceScore;
      bestMatch = {
        ...analysis,
        notes: uniqueNotes,
        root: potentialRoot
      };
    }
  }
  
  return bestMatch;
};

// Get Roman numeral for chord in key
export const getRomanNumeral = (chordRoot, key, chordType) => {
  const keyNote = noteToSemitone(key);
  const chordRootNote = noteToSemitone(chordRoot);
  const interval = (chordRootNote - keyNote + 12) % 12;
  
  const romanNumerals = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  const majorScalePattern = [0, 2, 4, 5, 7, 9, 11];
  
  const scaleIndex = majorScalePattern.indexOf(interval);
  if (scaleIndex !== -1) {
    let numeral = romanNumerals[scaleIndex];
    
    // Adjust for chord type
    if (chordType && chordType.includes('Minor') && scaleIndex < 3) {
      numeral = numeral.toLowerCase();
    }
    
    return numeral;
  }
  
  return '?';
};