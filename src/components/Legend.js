import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Legend = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Legend</Text>
    <View style={styles.row}>
      <View style={[styles.colorBox, { backgroundColor: '#FFD700' }]} />
      <Text style={styles.label}>Key Center</Text>
    </View>
    <View style={styles.row}>
      <View style={[styles.colorBox, { backgroundColor: '#8B5CF6' }]} />
      <Text style={styles.label}>Chord Root</Text>
    </View>
    <View style={styles.row}>
      <View style={[styles.colorBox, { backgroundColor: '#34D399' }]} />
      <Text style={styles.label}>Chord Tones</Text>
    </View>
    <View style={styles.row}>
      <View style={[styles.colorBox, { backgroundColor: '#60A5FA' }]} />
      <Text style={styles.label}>Scale Notes</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  colorBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  label: {
    fontSize: 14,
    color: '#444',
  },
});

export default Legend;
