import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMusicStore } from '../../store/useMusicStore';

const InstrumentSelector = () => {
  const { 
    selectedInstrument, 
    setSelectedInstrument
  } = useMusicStore();

  const instruments = [
    { id: 'guitar', name: 'Guitar' },
    { id: 'bass', name: 'Bass Guitar' },
    { id: 'ukulele', name: 'Ukulele' },
    { id: 'violin', name: 'Violin' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Instruments</Text>
      <View style={styles.instrumentGrid}>
        {instruments.map((instrument) => (
          <TouchableOpacity
            key={instrument.id}
            style={[
              styles.instrumentButton,
              selectedInstrument === instrument.id && styles.instrumentButtonActive
            ]}
            onPress={() => setSelectedInstrument(instrument.id)}
          >
            <Text style={[
              styles.instrumentName,
              selectedInstrument === instrument.id && styles.instrumentNameActive
            ]}>
              {instrument.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  instrumentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  instrumentButton: {
    flex: 1,
    minWidth: 110,
    padding: 12,
    borderWidth: 2,
    borderColor: '#333',
    backgroundColor: 'white',
    borderRadius: 5,
    alignItems: 'center',
  },
  instrumentButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
  },
  instrumentName: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  instrumentNameActive: {
    color: 'white',
  },
  instrumentDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  instrumentDescriptionActive: {
    color: '#E8F5E8',
  },
  currentInstrumentInfo: {
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  currentInstrumentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 3,
  },
  instrumentSpecs: {
    fontSize: 12,
    color: '#4CAF50',
  },
  tuningControls: {
    backgroundColor: '#BBDEFB',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  tuningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 15,
  },
  tuningGrid: {
    gap: 10,
    marginBottom: 15,
  },
  stringTuning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  stringLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565C0',
    minWidth: 80,
  },
  tuningSelector: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#90CAF9',
    minWidth: 60,
    alignItems: 'center',
  },
  tuningNote: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  presetSection: {
    borderTopWidth: 1,
    borderTopColor: '#90CAF9',
    paddingTop: 15,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 10,
  },
  presetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  presetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default InstrumentSelector;