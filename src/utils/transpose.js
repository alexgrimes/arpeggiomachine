// transpose.js
// Utility for transposing keys and progressions
import { NOTES } from './musicTheory';

export function transposeNote(note, interval) {
  // Transpose a note by interval (in semitones)
  const idx = NOTES.findIndex(n => n.replace(/♯|#|♭|b/g, '') === note.replace(/♯|#|♭|b/g, ''));
  if (idx === -1) return note;
  return NOTES[(idx + interval + 12) % 12];
}

export function transposeProgression(progression, interval) {
  // Transpose all chord roots in a progression
  return progression.map(chord => ({
    ...chord,
    symbol: chord.symbol ? transposeChordSymbol(chord.symbol, interval) : chord.symbol,
    notes: chord.notes ? chord.notes.map(n => transposeNote(n, interval)) : chord.notes
  }));
}

function transposeChordSymbol(symbol, interval) {
  // Only transpose the root (first part of symbol)
  const match = symbol.match(/^([A-G][♯#♭b]?)(.*)$/);
  if (!match) return symbol;
  const [_, root, rest] = match;
  return transposeNote(root, interval) + rest;
}
