import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const romanNumerals = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII'
];

const FretboardPositions = ({ onSelect, selected, onShowAll }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Fretboard Positions</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {romanNumerals.map((num, idx) => (
        <TouchableOpacity
          key={num}
          style={[styles.button, selected === idx ? styles.selected : null]}
          onPress={() => onSelect && onSelect(idx)}
        >
          <Text style={styles.buttonText}>{num}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.showAllButton} onPress={onShowAll}>
        <Text style={styles.showAllText}>Show All</Text>
      </TouchableOpacity>
    </ScrollView>
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
  button: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  buttonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  showAllButton: {
    backgroundColor: '#34D399',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginLeft: 10,
  },
  showAllText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default FretboardPositions;
