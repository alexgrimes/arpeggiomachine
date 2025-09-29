// chordVoicings.js
// Data structure and stub for chord diagrams and voicings

export const chordVoicings = {
  // Example: C major guitar
  'C': {
    guitar: {
      positions: [
        { frets: [0, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
        // ...more voicings
      ],
      diagramType: 'open',
    },
    piano: {
      keys: ['C', 'E', 'G'],
      // ...more voicings
    },
    ukulele: {
      positions: [
        { frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
      ],
    },
    violin: {
      positions: [
        { positions: [0, 2, 3, 0] },
      ],
    }
  },
  // Add more chords and instruments as needed
};

// Placeholder for a function to get voicings
export function getChordVoicings(chord, instrument) {
  return chordVoicings[chord]?.[instrument] || null;
}
