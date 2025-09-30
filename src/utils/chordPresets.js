// src/utils/chordPresets.js
import { noteToSemitone, semitoneToNote } from './musicTheory';

export function generateChordNotes(root, chordType) {
  const rootSemitone = noteToSemitone(root);
  
  const chordIntervals = {
    'major': [0, 4, 7],
    'minor': [0, 3, 7],
    'dim': [0, 3, 6],
    '7': [0, 4, 7, 10],
    'maj7': [0, 4, 7, 11],
    'm7': [0, 3, 7, 10],
  };
  
  const intervals = chordIntervals[chordType] || chordIntervals['major'];
  
  return intervals.map(interval => {
    const noteSemitone = (rootSemitone + interval) % 12;
    return semitoneToNote(noteSemitone, root);
  });
}

export function getDiatonicChords(key) {
  const majorScale = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const minorScale = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  
  const isMinor = key.includes('m');
  const rootNote = key.replace('m', '');
  
  // For C major: I=C, ii=Dm, iii=Em, IV=F, V=G, vi=Am, vii°=Bdim
  const majorQualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'dim'];
  const minorQualities = ['minor', 'dim', 'major', 'minor', 'minor', 'major', 'major'];
  
  const scale = isMinor ? minorScale : majorScale;
  const qualities = isMinor ? minorQualities : majorQualities;
  const romanNumerals = isMinor 
    ? ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII']
    : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'];
  
  const rootIndex = scale.indexOf(rootNote);
  const rotatedScale = [...scale.slice(rootIndex), ...scale.slice(0, rootIndex)];
  
  return rotatedScale.map((note, idx) => ({
    root: note,
    quality: qualities[idx],
    romanNumeral: romanNumerals[idx],
    symbol: note + (qualities[idx] === 'minor' ? 'm' : qualities[idx] === 'dim' ? '°' : ''),
    notes: generateChordNotes(note, qualities[idx])
  }));
}
