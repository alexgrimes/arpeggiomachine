// Nashville Number System utilities
// Converts scale degree to Nashville number (1-7) based on key and scale

import { generateScale } from './musicTheory';

export function getNashvilleNumbers(key, scaleType) {
  // Returns array of Nashville numbers for the scale
  // e.g. ['1', '2', '3', '4', '5', '6', '7']
  const scale = generateScale(key, scaleType);
  return scale.map((_, i) => (i + 1).toString());
}

export function getNashvilleNumberForChord(scale, chordRoot) {
  // Returns Nashville number for a given chord root in the scale
  // e.g. scale = ['C','D','E','F','G','A','B'], chordRoot = 'F' => '4'
  const idx = scale.findIndex(n => n.replace(/♯|#|♭|b/g, '') === chordRoot.replace(/♯|#|♭|b/g, ''));
  return idx >= 0 ? (idx + 1).toString() : '?';
}
