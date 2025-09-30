import * as Tone from 'tone';

let synth = null;
let sequence = null;

export const initializeAudio = async () => {
  await Tone.start();
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.02,
        decay: 0.3,
        sustain: 0.4,
        release: 2.0
      }
    }).toDestination();
    synth.volume.value = -10;
  }
};

export const playChord = async (notes, options = {}) => {
  const { duration = 1.5, velocity = 0.7 } = options;
  if (!synth) await initializeAudio();
  if (!notes || notes.length === 0) return;
  const toneNotes = notes.map(note => {
    const cleanNote = note.replace(/♯/g, '#').replace(/♭/g, 'b');
    return `${cleanNote}4`;
  });
  synth.triggerAttackRelease(toneNotes, duration, undefined, velocity);
};

export const playProgression = async (measures, tempo = 120, loop = false) => {
  if (!synth) await initializeAudio();
  if (sequence) {
    sequence.stop();
    sequence.dispose();
  }
  const validMeasures = measures
    .map((measure, index) => ({ measure, index }))
    .filter(({ measure }) => measure && measure.notes && measure.notes.length > 0);
  if (validMeasures.length === 0) return null;
  Tone.Transport.bpm.value = tempo;
  sequence = new Tone.Sequence(
    (time, value) => {
      const { measure, index } = value;
      const toneNotes = measure.notes.map(note => {
        const cleanNote = note.replace(/♯/g, '#').replace(/♭/g, 'b');
        return `${cleanNote}4`;
      });
      synth.triggerAttackRelease(toneNotes, '1m', time);
        // Removed Tone.Draw.schedule to fix 'now is not defined' error
    },
    validMeasures,
    '1m'
  );
  sequence.loop = loop;
  sequence.start(0);
  Tone.Transport.start();
  return sequence;
};

export const stopProgression = () => {
  if (sequence) {
    sequence.stop();
    Tone.Transport.stop();
  }
};

export const stopAllSounds = () => {
  if (synth) {
    synth.releaseAll();
  }
  stopProgression();
};



