import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface CustomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
}

const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  minimumValue = 1,
  maximumValue = 10,
  step = 1,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          value={value}
          onValueChange={onValueChange}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          thumbStyle={styles.thumb}
          trackStyle={styles.track}
          minimumTrackTintColor="#00D4AA"
          maximumTrackTintColor="#4B5563"
          thumbTintColor="#00D4AA"
        />
      </View>
      
      <View style={styles.labelsContainer}>
        <Text style={styles.label}>1 - Mild</Text>
        <Text style={styles.currentValue}>{value}</Text>
        <Text style={styles.label}>10 - Severe</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sliderContainer: {
    paddingHorizontal: 10,
  },
  slider: {
    width: '100%',
    height: 44,
  },
  thumb: {
    backgroundColor: '#00D4AA',
    width: 24,
    height: 24,
  },
  track: {
    height: 6,
    borderRadius: 3,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  currentValue: {
    fontSize: 18,
    color: '#00D4AA',
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 30,
  },
});

export default CustomSlider;