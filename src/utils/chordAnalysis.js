import { noteToSemitone, semitoneToNote } from './musicTheory';

function scoreChordMatch(inputIntervals, template) {
  const required = template.intervals;
  const inputSet = new Set(inputIntervals);
  
  if (template.excludeIf && template.excludeIf.length > 0) {
    for (let excludedInterval of template.excludeIf) {
      if (inputSet.has(excludedInterval)) {
        return 0;
      }
    }
  }
  
  const matchCount = required.filter(interval => inputSet.has(interval)).length;
  const completeness = matchCount / required.length;
  
  if (completeness < template.completenessThreshold) {
    return 0;
  }
  
  const extraNotes = inputIntervals.length - required.length;
  const missingNotes = required.length - matchCount;
  const extraNotePenalty = Math.max(0, extraNotes * 0.1);
  const missingNotePenalty = missingNotes * 0.15;
  const exactMatchBonus = (completeness === 1.0 && extraNotes === 0) ? 0.2 : 0;
  
  return Math.max(0, completeness - extraNotePenalty - missingNotePenalty + exactMatchBonus);
}

export function analyzeChord(notes, rootNote = null) {
  if (!notes || notes.length < 2) return [];

  const allSuggestions = [];
  const rootsToTry = rootNote ? [rootNote] : notes;
  const firstNoteInInput = notes[0]; // Remember the bass note

  rootsToTry.forEach(candidateRoot => {
    const rootSemitone = noteToSemitone(candidateRoot);
    const intervals = notes.map(note => {
      return (noteToSemitone(note) - rootSemitone + 12) % 12;
    }).sort((a, b) => a - b);

    Object.entries(CHORD_TEMPLATES).forEach(([templateName, template]) => {
      const score = scoreChordMatch(intervals, template);
      if (score > 0) {
        // Build the actual chord notes from the template intervals
        const actualChordNotes = template.intervals.map(interval => {
          const noteSemitone = (rootSemitone + interval) % 12;
          return semitoneToNote(noteSemitone, candidateRoot);
        });

        // Check if this is an inversion (bass note ≠ root)
        const isInversion = candidateRoot !== firstNoteInInput && notes.includes(candidateRoot);
        const displaySymbol = isInversion 
          ? `${candidateRoot}${template.symbol}/${firstNoteInInput}`  // Dm/F
          : candidateRoot + template.symbol;  // Dm

        allSuggestions.push({
          symbol: displaySymbol,
          score: score,
          priority: template.priority,
          type: template.type,
          intervals: template.intervals,
          template: templateName,
          root: candidateRoot,
          bassNote: firstNoteInInput,
          isInversion: isInversion,
          notes: actualChordNotes
        });
      }
    });
  });
  
  return allSuggestions.sort((a, b) => {
    if (Math.abs(a.score - b.score) < 0.01) {
      return a.priority - b.priority;
    }
    return b.score - a.score;
  }).slice(0, 7);
}

export const CHORD_TEMPLATES = {
  'power': { intervals: [0, 7], priority: 0.5, symbol: '5', type: 'power', completenessThreshold: 0.4, excludeIf: [3, 4] },
  'major': { intervals: [0, 4, 7], priority: 1, symbol: '', type: 'triad', completenessThreshold: 0.4, excludeIf: [] },
  'minor': { intervals: [0, 3, 7], priority: 1, symbol: 'm', type: 'triad', completenessThreshold: 0.4, excludeIf: [] },
  'diminished': { intervals: [0, 3, 6], priority: 1, symbol: '°', type: 'triad', completenessThreshold: 0.4, excludeIf: [] },
  'augmented': { intervals: [0, 4, 8], priority: 1, symbol: '+', type: 'triad', completenessThreshold: 0.4, excludeIf: [] },
  'sus2': { intervals: [0, 2, 7], priority: 1.5, symbol: 'sus2', type: 'suspended', completenessThreshold: 0.4, excludeIf: [3, 4] },
  'sus4': { intervals: [0, 5, 7], priority: 1.5, symbol: 'sus4', type: 'suspended', completenessThreshold: 0.4, excludeIf: [3, 4] },
  '6': { intervals: [0, 4, 7, 9], priority: 2, symbol: '6', type: 'sixth', completenessThreshold: 0.4, excludeIf: [] },
  'm6': { intervals: [0, 3, 7, 9], priority: 2, symbol: 'm6', type: 'sixth', completenessThreshold: 0.4, excludeIf: [] },
  'add9': { intervals: [0, 4, 7, 2], priority: 2, symbol: 'add9', type: 'added', completenessThreshold: 0.4, excludeIf: [10, 11] },
  'madd9': { intervals: [0, 3, 7, 2], priority: 2, symbol: 'madd9', type: 'added', completenessThreshold: 0.4, excludeIf: [10, 11] },
  '6/9': { intervals: [0, 4, 7, 9, 2], priority: 2.5, symbol: '6/9', type: 'sixth', completenessThreshold: 0.4, excludeIf: [] },
  'major7': { intervals: [0, 4, 7, 11], priority: 3, symbol: 'maj7', type: 'seventh', completenessThreshold: 0.4, excludeIf: [] },
  'minor7': { intervals: [0, 3, 7, 10], priority: 3, symbol: 'm7', type: 'seventh', completenessThreshold: 0.4, excludeIf: [] },
  'dominant7': { intervals: [0, 4, 7, 10], priority: 3, symbol: '7', type: 'seventh', completenessThreshold: 0.4, excludeIf: [] },
  'minorMajor7': { intervals: [0, 3, 7, 11], priority: 3, symbol: 'mMaj7', type: 'seventh', completenessThreshold: 0.4, excludeIf: [] },
  'halfDiminished7': { intervals: [0, 3, 6, 10], priority: 3, symbol: 'm7♭5', type: 'seventh', completenessThreshold: 0.4, excludeIf: [] },
  'diminished7': { intervals: [0, 3, 6, 9], priority: 3, symbol: '°7', type: 'seventh', completenessThreshold: 0.4, excludeIf: [] },
  'augmented7': { intervals: [0, 4, 8, 10], priority: 3, symbol: '7+', type: 'seventh', completenessThreshold: 0.4, excludeIf: [] },
  '9': { intervals: [0, 4, 7, 10, 2], priority: 4, symbol: '9', type: 'ninth', completenessThreshold: 0.4, excludeIf: [] },
  'major9': { intervals: [0, 4, 7, 11, 2], priority: 4, symbol: 'maj9', type: 'ninth', completenessThreshold: 0.4, excludeIf: [] },
  'minor9': { intervals: [0, 3, 7, 10, 2], priority: 4, symbol: 'm9', type: 'ninth', completenessThreshold: 0.4, excludeIf: [] },
  '7b9': { intervals: [0, 4, 7, 10, 1], priority: 5, symbol: '7♭9', type: 'altered', completenessThreshold: 0.4, excludeIf: [] },
  '7#9': { intervals: [0, 4, 7, 10, 3], priority: 5, symbol: '7♯9', type: 'altered', completenessThreshold: 0.4, excludeIf: [] },
  '7b5': { intervals: [0, 4, 6, 10], priority: 5, symbol: '7♭5', type: 'altered', completenessThreshold: 0.4, excludeIf: [] },
  '7#5': { intervals: [0, 4, 8, 10], priority: 5, symbol: '7♯5', type: 'altered', completenessThreshold: 0.4, excludeIf: [] },
};

export function calculateScaleDegree(note, root) {
  if (!root) return '?';
  const rootSemitone = noteToSemitone(root);
  const noteSemitone = noteToSemitone(note);
  const interval = (noteSemitone - rootSemitone + 12) % 12;
  const degreeMap = {
    0: '1', 1: '♭2', 2: '2', 3: '♭3', 4: '3', 5: '4',
    6: '♭5', 7: '5', 8: '♯5', 9: '6', 10: '♭7', 11: '7'
  };
  return degreeMap[interval] || '?';
}

export function generateDiatonicChords(key, scaleNotes, chordType = 'triads') {
  const chords = [];
  scaleNotes.forEach((note, index) => {
    const thirdIndex = (index + 2) % scaleNotes.length;
    const fifthIndex = (index + 4) % scaleNotes.length;
    let chordNotes = [note, scaleNotes[thirdIndex], scaleNotes[fifthIndex]];
    let degrees = ['1', '3', '5'];
    if (chordType === 'sevenths') {
      const seventhIndex = (index + 6) % scaleNotes.length;
      chordNotes.push(scaleNotes[seventhIndex]);
      degrees.push('7');
    }
    chords.push({ symbol: note, notes: chordNotes, degrees, scaleDegree: index + 1 });
  });
  return chords;
}