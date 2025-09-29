// Instrument definitions and tunings
// Extracted from chord-visualizer-ii web app

export const instruments = {
  guitar: {
    name: 'Guitar',
    type: 'fretted',
    strings: ['E', 'A', 'D', 'G', 'B', 'E'], // Low E to High E
    frets: 24,
    defaultTuning: ['E', 'A', 'D', 'G', 'B', 'E']
  },
  bass: {
    name: 'Bass Guitar', 
    type: 'fretted',
    strings: ['E', 'A', 'D', 'G'], // Low E to High G
    frets: 24,
    defaultTuning: ['E', 'A', 'D', 'G']
  },
  ukulele: {
    name: 'Ukulele',
    type: 'fretted', 
    strings: ['G', 'C', 'E', 'A'], // Low G to High A
    frets: 15,
    defaultTuning: ['G', 'C', 'E', 'A']
  },
  violin: {
    name: 'Violin',
    type: 'bowed',
    strings: ['G', 'D', 'A', 'E'], // Low G to High E
    frets: 20, // positions instead of frets
    defaultTuning: ['G', 'D', 'A', 'E']
  }
};

export const positions = {
  'Position I': { label: 'Position I', frets: [0, 1, 2, 3, 4] },
  'Position II': { label: 'Position II', frets: [1, 2, 3, 4, 5] },
  'Position III': { label: 'Position III', frets: [2, 3, 4, 5, 6] },
  'Position IV': { label: 'Position IV', frets: [3, 4, 5, 6, 7] },
  'Position V': { label: 'Position V', frets: [4, 5, 6, 7, 8] },
  'Position VI': { label: 'Position VI', frets: [5, 6, 7, 8, 9] },
  'Position VII': { label: 'Position VII', frets: [6, 7, 8, 9, 10] },
  'Position VIII': { label: 'Position VIII', frets: [7, 8, 9, 10, 11] },
  'Position IX': { label: 'Position IX', frets: [8, 9, 10, 11, 12] },
  'Position X': { label: 'Position X', frets: [9, 10, 11, 12, 13] },
  'Position XI': { label: 'Position XI', frets: [10, 11, 12, 13, 14] },
  'Position XII': { label: 'Position XII', frets: [11, 12, 13, 14, 15] }
};