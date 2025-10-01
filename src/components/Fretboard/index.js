import React, { useRef, useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Dimensions, ScrollView, Animated } from 'react-native';
import Svg, { Line as SvgLine } from 'react-native-svg';
import { useMusicStore } from '../../store/useMusicStore';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

// Position definitions matching web app
const POSITIONS = {
	'I': { frets: [1, 2, 3, 4, 5], label: 'I' },
	'II': { frets: [2, 3, 4, 5, 6], label: 'II' },
	'III': { frets: [3, 4, 5, 6, 7], label: 'III' },
	'IV': { frets: [4, 5, 6, 7, 8], label: 'IV' },
	'V': { frets: [5, 6, 7, 8, 9], label: 'V' },
	'VI': { frets: [6, 7, 8, 9, 10], label: 'VI' },
	'VII': { frets: [7, 8, 9, 10, 11], label: 'VII' },
	'VIII': { frets: [8, 9, 10, 11, 12], label: 'VIII' },
	'IX': { frets: [9, 10, 11, 12, 13], label: 'IX' },
	'X': { frets: [10, 11, 12, 13, 14], label: 'X' },
	'XI': { frets: [11, 12, 13, 14, 15], label: 'XI' },
	'XII': { frets: [12, 13, 14, 15, 16], label: 'XII' },
	'XIII': { frets: [13, 14, 15, 16, 17], label: 'XIII' },
	'XIV': { frets: [14, 15, 16, 17, 18], label: 'XIV' },
	'XV': { frets: [15, 16, 17, 18, 19], label: 'XV' },
	'XVI': { frets: [16, 17, 18, 19, 20], label: 'XVI' },
	'XVII': { frets: [17, 18, 19, 20, 21], label: 'XVII' },
	'XVIII': { frets: [18, 19, 20, 21, 22], label: 'XVIII' },
};

const NOTES = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];

// Keys with sharps
const SHARP_KEYS = ['G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'];
// Keys with flats
const FLAT_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'];

// Proper note names with sharps and flats
const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NOTES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

const SCALE_PATTERNS = {
	major: [0, 2, 4, 5, 7, 9, 11],
	minor: [0, 2, 3, 5, 7, 8, 10],
	harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
	melodicMinor: [0, 2, 3, 5, 7, 9, 11],
	majorPentatonic: [0, 2, 4, 7, 9],
	minorPentatonic: [0, 3, 5, 7, 10],
};

const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21];

const Fretboard = () => {
	const { 
		selectedKey, 
		selectedScale, 
		selectedInstrument, 
		selectedChord,
		getCurrentInstrument,
		customChordNotes,
		addCustomChordNote,
		removeCustomChordNote,
	} = useMusicStore();

	const [selectedPosition, setSelectedPosition] = useState(null);
	const [showArpeggio, setShowArpeggio] = useState(true);
	const zoomAnim = useRef(new Animated.Value(1)).current;
	const scrollViewRef = useRef(null);

	// Calculate dimensions first, before useEffect
	const instrument = getCurrentInstrument();
	const fretCount = 24;
	const cellWidth = Math.max(33, Math.floor((width - 100) / 24)); // Make cellWidth dynamic based on screen width
	const cellHeight = 48;

	useEffect(() => {
		if (selectedPosition) {
			// Zoom animation
			Animated.spring(zoomAnim, {
				toValue: 1.2,
				useNativeDriver: true,
				tension: 40,
				friction: 8,
			}).start(() => {
				// Center scroll AFTER zoom completes
				if (scrollViewRef.current) {
					const position = POSITIONS[selectedPosition];
					const minFret = Math.min(...position.frets);
					const maxFret = Math.max(...position.frets);
					const centerFret = (minFret + maxFret) / 2;
					
					const screenWidth = width;
					const zoomedFretWidth = cellWidth * 1.2;
					
					// Target: center of screen should be at center fret
					const targetX = (centerFret * zoomedFretWidth) - (screenWidth / 2);
					
					setTimeout(() => {
						scrollViewRef.current.scrollTo({ 
							x: Math.max(0, targetX), 
							animated: true 
						});
					}, 50);
				}
			});
		} else {
			// Reset zoom and scroll
			if (scrollViewRef.current) {
				scrollViewRef.current.scrollTo({ x: 0, animated: true });
			}
			
			Animated.spring(zoomAnim, {
				toValue: 1,
				useNativeDriver: true,
			}).start();
		}
	}, [selectedPosition, cellWidth, width]);
  
	const noteToSemitone = (note) => {
		const cleanNote = note.replace(/♯|♭/g, match => match === '♯' ? '#' : 'b');
		const baseNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
		const flatNotes = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    
		let index = baseNotes.indexOf(cleanNote);
		if (index === -1) index = flatNotes.indexOf(cleanNote);
		if (index === -1) {
			const parts = cleanNote.split('/');
			index = baseNotes.indexOf(parts[0]);
			if (index === -1) index = flatNotes.indexOf(parts[0]);
		}
		return index === -1 ? 0 : index;
	};

	const getScaleNotes = () => {
		const rootSemitone = noteToSemitone(selectedKey.replace('m', ''));
		const pattern = SCALE_PATTERNS[selectedScale] || SCALE_PATTERNS.major;
		return pattern.map(interval => (rootSemitone + interval) % 12);
	};

	const getNoteAtPosition = (stringIndex, fret) => {
		const openString = instrument.strings[stringIndex];
		const openSemitone = noteToSemitone(openString);
		const noteSemitone = (openSemitone + fret) % 12;
		
		// Use proper enharmonic spelling based on key signature
		const useFlats = FLAT_KEYS.includes(selectedKey);
		const noteArray = useFlats ? FLAT_NOTES : SHARP_NOTES;
		return noteArray[noteSemitone];
	};

	const isNoteInScale = (stringIndex, fret) => {
		const openString = instrument.strings[stringIndex];
		const openSemitone = noteToSemitone(openString);
		const noteSemitone = (openSemitone + fret) % 12;
		const scaleNotes = getScaleNotes();
		return scaleNotes.includes(noteSemitone);
	};

	const isRootNote = (stringIndex, fret) => {
		const note = getNoteAtPosition(stringIndex, fret);
		const rootSemitone = noteToSemitone(selectedKey.replace('m', ''));
		const noteSemitone = noteToSemitone(note);
		return noteSemitone === rootSemitone;
	};

	const isInCustomChord = (stringIndex, fret) => {
		const note = getNoteAtPosition(stringIndex, fret);
		return customChordNotes.includes(note);
	};

	const handleNotePress = (stringIndex, fret) => {
		const note = getNoteAtPosition(stringIndex, fret);
		if (isInCustomChord(stringIndex, fret)) {
			removeCustomChordNote(note);
		} else {
			addCustomChordNote(note);
		}
	};

	// Calculate fret opacity based on position - 3-tier system
	const getFretOpacity = (fret) => {
		if (!selectedPosition) return 1;
    
		const position = POSITIONS[selectedPosition];
		const minFret = Math.min(...position.frets);
		const maxFret = Math.max(...position.frets);
    
		if (fret === 0) {
			// Open strings - only show for lower positions
			return minFret <= 3 ? 1 : 0.1;
		} else if (fret >= minFret && fret <= maxFret) {
			// Target position - full opacity
			return 1;
		} else if (fret >= minFret - 1 && fret <= maxFret + 1) {
			// Context frets (±1 from target) - medium opacity
			return 0.3;
		} else {
			// Distant frets - very low opacity
			return 0.1;
		}
	};

	// Check if fret is in target position
	const isPositionTarget = (fret) => {
		if (!selectedPosition) return false;
		const position = POSITIONS[selectedPosition];
		return position.frets.includes(fret);
	};

	const getFretCellStyle = (fret) => {
		const styles = [styleSheet.fretCell];
    
		// Traditional fret markers always visible
		if (fret === 12) {
			styles.push(styleSheet.fret12);
		} else if (FRET_MARKERS.includes(fret)) {
			styles.push(styleSheet.fretPosition);
		}
    
		return styles;
	};

	const renderNoteDot = (stringIndex, fret) => {
		const inScale = isNoteInScale(stringIndex, fret);
		const isRoot = isRootNote(stringIndex, fret);
		const inCustomChord = isInCustomChord(stringIndex, fret);
    
		const note = getNoteAtPosition(stringIndex, fret);
		const isChordNote = selectedChord?.notes?.includes(note);
		const isChordRoot = selectedChord?.notes?.[0] === note;
    
		if (!inScale && !inCustomChord && !isChordNote) return null;
    
		let dotStyle = [styleSheet.noteDot];
		if (inCustomChord) {
			dotStyle.push(styleSheet.chordNote);
		} else if (isChordRoot) {
			dotStyle.push(styleSheet.chordRoot);
		} else if (isChordNote) {
			dotStyle.push(styleSheet.selectedChordNote);
		} else if (isRoot) {
			dotStyle.push(styleSheet.rootNote);
		} else if (inScale) {
			dotStyle.push(styleSheet.scaleNote);
		}
    
		const noteText = note.split('/')[0];
		// Apply fret opacity to the note dot itself
		const fretOpacity = getFretOpacity(fret);
    
		return (
			<TouchableOpacity
				style={[dotStyle, { opacity: fretOpacity }]}
				onPress={() => handleNotePress(stringIndex, fret)}
			>
				<Text style={styleSheet.noteText}>{noteText}</Text>
			</TouchableOpacity>
		);
	};

	const renderStringRow = (stringIndex) => {
		const cells = [];
    
		cells.push(
			<View key={`string-${stringIndex}`} style={styleSheet.stringLabel}>
				<Text style={styleSheet.stringLabelText}>{instrument.strings[stringIndex]}</Text>
			</View>
		);
    
		for (let fret = 1; fret <= fretCount; fret++) {
			const opacity = getFretOpacity(fret);
			cells.push(
				<View key={`${stringIndex}-${fret}`} style={[getFretCellStyle(fret), { opacity, width: cellWidth }]}> 
					<View style={styleSheet.stringLine} />
					<View style={styleSheet.fretLine} />
					{renderNoteDot(stringIndex, fret)}
				</View>
			);
		}
    
		return (
			<View key={`row-${stringIndex}`} style={styleSheet.stringRow}>
				{cells}
			</View>
		);
	};

	const handlePositionSelect = (posKey) => {
		setSelectedPosition(selectedPosition === posKey ? null : posKey);
	};

	const handleShowAll = () => {
		setSelectedPosition(null);
	};

	const renderPositionControls = () => {
		return (
			<View style={styleSheet.positionControls}>
				<Text style={styleSheet.positionLabel}>Fretboard Positions:</Text>
				<View style={styleSheet.positionButtons}>
					{Object.keys(POSITIONS).map(posKey => (
						<TouchableOpacity
							key={posKey}
							style={[
								styleSheet.positionBtn,
								selectedPosition === posKey && styleSheet.positionBtnActive
							]}
							onPress={() => handlePositionSelect(posKey)}
						>
							<Text style={[
								styleSheet.positionBtnText,
								selectedPosition === posKey && styleSheet.positionBtnTextActive
							]}>
								{POSITIONS[posKey].label}
							</Text>
						</TouchableOpacity>
					))}
				</View>
				<View style={styleSheet.zoomControls}>
					<TouchableOpacity style={styleSheet.showAllBtn} onPress={handleShowAll}>
						<Text style={styleSheet.showAllBtnText}>Show All</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	const renderFretMarkers = () => {
		const markers = [<View key="marker-empty" style={styleSheet.fretMarkerEmpty} />];
    
		for (let fret = 1; fret <= fretCount; fret++) {
			const isMarker = FRET_MARKERS.includes(fret);
			const opacity = getFretOpacity(fret);
      
			markers.push(
				<View key={`marker-${fret}`} style={[styleSheet.fretMarkerCell, { opacity, width: cellWidth }]}> 
					{isMarker && (
						<Text style={styleSheet.fretMarkerText}>
							{fret === 12 ? '●●' : '●'}
						</Text>
					)}
				</View>
			);
		}
    
		return <View style={styleSheet.fretMarkersRow}>{markers}</View>;
	};

	return (
		<View style={[styleSheet.container, selectedPosition && styleSheet.containerZoomed]}>
			<View style={styleSheet.header}>
				<Text style={styleSheet.title}>
					{instrument.name} - {selectedKey} {selectedScale}
				</Text>
			</View>

			{renderPositionControls()}

			<ScrollView 
				ref={scrollViewRef}
				horizontal 
				showsHorizontalScrollIndicator={false}
				style={styleSheet.fretboardScrollView}
				contentContainerStyle={[
					styleSheet.fretboardScrollContent,
					selectedPosition && styleSheet.fretboardScrollContentZoomed
				]}
			>
				<Animated.View style={[
					styleSheet.fretboardContainer,
					selectedPosition && styleSheet.fretboardZoomed,
					{ 
						transform: [{ scale: zoomAnim }],
						transformOrigin: 'left center',  // Zoom from left edge
					}
				]}>
					{[...instrument.strings].map((_, stringIndex, arr) => renderStringRow(arr.length - 1 - stringIndex))}
					{renderFretMarkers()}
				</Animated.View>
			</ScrollView>
      
			<View style={styleSheet.legend}>
				<View style={styleSheet.legendItem}>
					<View style={[styleSheet.legendDot, styleSheet.rootNote]} />
					<Text style={styleSheet.legendText}>Key Center</Text>
				</View>
				<View style={styleSheet.legendItem}>
					<View style={[styleSheet.legendDot, styleSheet.chordRoot]} />
					<Text style={styleSheet.legendText}>Chord Root</Text>
				</View>
				<View style={styleSheet.legendItem}>
					<View style={[styleSheet.legendDot, styleSheet.selectedChordNote]} />
					<Text style={styleSheet.legendText}>Chord Tones</Text>
				</View>
				<View style={styleSheet.legendItem}>
					<View style={[styleSheet.legendDot, styleSheet.scaleNote]} />
					<Text style={styleSheet.legendText}>Scale Notes</Text>
				</View>
			</View>
		</View>
	);
};

const styleSheet = StyleSheet.create({
	container: {
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		marginVertical: 10,
		borderWidth: 1,
		borderColor: '#ddd',
		elevation: 3,
		width: '100%',  // Full width
		overflow: 'visible',  // Allow note dots to overflow
	},
	containerZoomed: {
		paddingHorizontal: 20,  // Reduced padding for 1.2x zoom
		paddingVertical: 25,
	},
	header: {
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	title: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
		textAlign: 'center',
	},
	fretboardScrollView: {
		width: '100%',  // Full width
		overflow: 'visible',  // Allow content to overflow
	},
	fretboardScrollContent: {
		paddingHorizontal: 80,  // Base padding to show nut/open strings and far edge
		paddingVertical: 20,
		alignItems: 'center',  // Center the fretboard content
		justifyContent: 'center',
	},
	fretboardScrollContentZoomed: {
		paddingHorizontal: 150,  // Extra padding when zoomed to prevent edge clipping
	},
	fretboardContainer: {
		minWidth: '100%',  // Changed from fixed 1200px
		width: '100%',
		alignItems: 'center',  // Center rows within container
	},
	fretboardZoomed: {
		backgroundColor: 'rgba(52, 152, 219, 0.08)',
		borderRadius: 12,
		padding: 25,
	},
	positionControls: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		flexWrap: 'wrap',
		gap: 5,
		margin: 10,
		padding: 10,
		backgroundColor: '#f8f8f8',
		borderRadius: 8,
	},
	positionLabel: {
		fontSize: 12,
		color: '#666',
		marginRight: 15,
		fontWeight: '600',
	},
	positionButtons: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 5,
	},
	positionBtn: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: '#f8f9fa',
		borderWidth: 1,
		borderColor: '#dee2e6',
		borderRadius: 4,
		minWidth: 35,
		alignItems: 'center',
	},
	positionBtnActive: {
		backgroundColor: '#3498db',
		borderColor: '#2980b9',
		shadowColor: '#3498db',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 12,
		elevation: 4,
	},
	positionBtnText: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#333',
	},
	positionBtnTextActive: {
		color: 'white',
	},
	zoomControls: {
		marginLeft: 15,
		paddingLeft: 15,
		borderLeftWidth: 1,
		borderLeftColor: '#ccc',
	},
	showAllBtn: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		backgroundColor: '#2196F3',
		borderRadius: 4,
	},
	showAllBtnText: {
		color: 'white',
		fontSize: 12,
		fontWeight: 'bold',
	},
	stringRow: {
		flexDirection: 'row',
		height: 48,
		alignSelf: 'center',  // Center each row
	},
	fretCell: {
		position: 'relative',
		height: 48,
		backgroundColor: 'white',
		alignItems: 'center',
		justifyContent: 'center',
		borderRightWidth: 1,
		borderRightColor: '#ccc',
	},
	positionTarget: {
		// No special background color - target frets blend with normal frets
	},
	fretPosition: {
		backgroundColor: 'rgba(230, 230, 230, 0.75)',
	},
	fret12: {
		backgroundColor: 'rgba(190, 190, 190, 0.85)',
	},
	stringLabel: {
		width: 60,
		height: 48,
		backgroundColor: '#e8e8e8',
		alignItems: 'center',
		justifyContent: 'center',
		borderRightWidth: 1,
		borderRightColor: '#d7d6d6',
	},
	stringLabelText: {
		fontWeight: 'bold',
		color: '#333',
		fontSize: 16,
	},
	stringLine: {
		position: 'absolute',
		top: '50%',
		left: 0,
		right: 0,
		height: 2,
		backgroundColor: '#666',
		marginTop: -1,
	},
	fretLine: {
		position: 'absolute',
		right: 0,
		top: 0,
		bottom: 0,
		width: 1,
		backgroundColor: '#ccc',
	},
	noteDot: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		zIndex: 10,
		borderWidth: 2,
	},
	rootNote: {
		backgroundColor: '#ff6b35',
		borderColor: '#e55a2b',
	},
	scaleNote: {
		backgroundColor: '#A8D0F0',
		borderColor: '#85B8DD',
	},
	chordNote: {
		backgroundColor: '#0D47A1',
		borderColor: '#001970',
	},
	selectedChordNote: {
		backgroundColor: '#0D47A1',
		borderColor: '#001970',
	},
	chordRoot: {
		backgroundColor: '#FF9800',
		borderColor: '#F57400',
	},
	noteText: {
		fontSize: 12,
		fontWeight: 'bold',
		color: 'white',
	},
	fretMarkersRow: {
		flexDirection: 'row',
		marginTop: 10,
		height: 25,
	},
	fretMarkerEmpty: {
		width: 60,
	},
	fretMarkerCell: {
		height: 25,
		alignItems: 'center',
		justifyContent: 'center',
	},
	fretMarkerText: {
		fontSize: 14,
		color: '#666',
		fontWeight: 'bold',
	},
	legend: {
		flexDirection: 'row',
		justifyContent: 'center',
		flexWrap: 'wrap',
		gap: 20,
		padding: 15,
		backgroundColor: '#F8F9FA',
		borderTopWidth: 1,
		borderTopColor: '#E0E0E0',
	},
	legendItem: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	legendDot: {
		width: 18,
		height: 18,
		borderRadius: 9,
		borderWidth: 2,
	},
	legendText: {
		fontSize: 12,
		color: '#333',
	},
});

export default Fretboard;