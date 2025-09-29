// progressionStorage.js
// Utility for saving, loading, and sharing chord progressions

import * as FileSystem from 'expo-file-system';

const PROGRESSIONS_DIR = FileSystem.documentDirectory + 'progressions/';

export async function saveProgression(name, progression) {
  await FileSystem.makeDirectoryAsync(PROGRESSIONS_DIR, { intermediates: true });
  const filePath = PROGRESSIONS_DIR + name + '.json';
  await FileSystem.writeAsStringAsync(filePath, JSON.stringify(progression));
  return filePath;
}

export async function loadProgression(name) {
  const filePath = PROGRESSIONS_DIR + name + '.json';
  const data = await FileSystem.readAsStringAsync(filePath);
  return JSON.parse(data);
}

export async function listProgressions() {
  try {
    const files = await FileSystem.readDirectoryAsync(PROGRESSIONS_DIR);
    return files.filter(f => f.endsWith('.json')).map(f => f.replace('.json', ''));
  } catch {
    return [];
  }
}

export async function deleteProgression(name) {
  const filePath = PROGRESSIONS_DIR + name + '.json';
  await FileSystem.deleteAsync(filePath);
}

export async function exportProgression(name) {
  // Returns file URI for sharing
  return PROGRESSIONS_DIR + name + '.json';
}
