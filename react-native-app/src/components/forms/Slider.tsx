import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SliderComponent from '@react-native-community/slider';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, DIMENSIONS } from '../../constants';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  label?: string;
  showLabels?: boolean;
  showCurrentValue?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onValueChange,
  minimumValue = 1,
  maximumValue = 10,
  step = 1,
  label,
  showLabels = true,
  showCurrentValue = true,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.sliderContainer}>
        <SliderComponent
          style={styles.slider}
          value={value}
          onValueChange={onValueChange}
          minimumValue={minimumValue}
          maximumValue={maximumValue}
          step={step}
          thumbStyle={styles.thumb}
          trackStyle={styles.track}
          minimumTrackTintColor={COLORS.primary}
          maximumTrackTintColor={COLORS.border}
          thumbTintColor={COLORS.primary}
        />
      </View>
      
      {showLabels && (
        <View style={styles.labelsContainer}>
          <Text style={styles.labelText}>{minimumValue} - Mild</Text>
          {showCurrentValue && (
            <Text style={styles.currentValue}>{value}</Text>
          )}
          <Text style={styles.labelText}>{maximumValue} - Severe</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  sliderContainer: {
    paddingHorizontal: SPACING.sm,
  },
  slider: {
    width: '100%',
    height: DIMENSIONS.touchTarget,
  },
  thumb: {
    backgroundColor: COLORS.primary,
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
    paddingHorizontal: SPACING.sm,
    marginTop: SPACING.sm,
  },
  labelText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  currentValue: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.bold,
    textAlign: 'center',
    minWidth: 30,
  },
});