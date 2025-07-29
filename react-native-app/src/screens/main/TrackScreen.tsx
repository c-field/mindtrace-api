import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, DIMENSIONS } from '../../constants';
import { validateThoughtForm } from '../../utils';
import { useCreateThought } from '../../hooks';
import { Button, Card, Slider, LoadingSpinner } from '../../components';
import { cognitiveDistortions, getCognitiveDistortionById } from '../../data/cognitiveDistortions';
import type { CreateThoughtData } from '../../types';

const TrackScreen: React.FC = () => {
  const [content, setContent] = useState('');
  const [cognitiveDistortion, setCognitiveDistortion] = useState('');
  const [trigger, setTrigger] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [showDistortionInfo, setShowDistortionInfo] = useState(false);
  const [errors, setErrors] = useState<{content?: string; cognitiveDistortion?: string}>({});
  
  const createThoughtMutation = useCreateThought();

  const handleSubmit = () => {
    const validationErrors = validateThoughtForm(content, cognitiveDistortion, intensity);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    const thoughtData: CreateThoughtData = {
      content: content.trim(),
      cognitiveDistortion,
      trigger: trigger.trim() || undefined,
      intensity
    };

    createThoughtMutation.mutate(thoughtData, {
      onSuccess: () => {
        // Reset form
        setContent('');
        setCognitiveDistortion('');
        setTrigger('');
        setIntensity(5);
        Alert.alert('Success', 'Thought recorded successfully!');
      },
      onError: (error: any) => {
        const isNetworkError = error?.message?.includes('Network error');
        Alert.alert(
          isNetworkError ? 'No Internet Connection' : 'Error',
          isNetworkError ? error.message : 'Failed to record thought. Please try again.'
        );
      },
    });
  };

  const selectedDistortion = getCognitiveDistortionById(cognitiveDistortion);

  if (createThoughtMutation.isPending) {
    return <LoadingSpinner overlay message="Recording thought..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={styles.title}>Record Your Thought</Text>
            <Text style={styles.subtitle}>
              Take a moment to capture what's on your mind
            </Text>

            {/* Thought Content */}
            <View style={styles.section}>
              <Text style={styles.label}>What's on your mind? *</Text>
              <TextInput
                style={[styles.textArea, errors.content && styles.inputError]}
                value={content}
                onChangeText={setContent}
                placeholder="Describe your thought or feeling..."
                placeholderTextColor={COLORS.textTertiary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}
            </View>

            {/* Cognitive Distortion */}
            <View style={styles.section}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Cognitive Pattern *</Text>
                <TouchableOpacity onPress={() => setShowDistortionInfo(true)}>
                  <Icon name="information-circle-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={[styles.pickerContainer, errors.cognitiveDistortion && styles.inputError]}>
                <Picker
                  selectedValue={cognitiveDistortion}
                  onValueChange={setCognitiveDistortion}
                  style={styles.picker}
                  dropdownIconColor={COLORS.textTertiary}
                >
                  <Picker.Item label="Select a cognitive pattern..." value="" />
                  {cognitiveDistortions.map((distortion) => (
                    <Picker.Item
                      key={distortion.id}
                      label={distortion.name}
                      value={distortion.id}
                    />
                  ))}
                </Picker>
              </View>
              {errors.cognitiveDistortion && <Text style={styles.errorText}>{errors.cognitiveDistortion}</Text>}
              
              {selectedDistortion && (
                <View style={styles.distortionInfo}>
                  <Text style={styles.distortionExample}>
                    Example: {selectedDistortion.example}
                  </Text>
                </View>
              )}
            </View>

            {/* Intensity Slider */}
            <View style={styles.section}>
              <Slider
                label="Intensity Level"
                value={intensity}
                onValueChange={setIntensity}
                minimumValue={1}
                maximumValue={10}
                showLabels
                showCurrentValue
              />
            </View>

            {/* Trigger (Optional) */}
            <View style={styles.section}>
              <Text style={styles.label}>Trigger (Optional)</Text>
              <TextInput
                style={styles.input}
                value={trigger}
                onChangeText={setTrigger}
                placeholder="What triggered this thought?"
                placeholderTextColor={COLORS.textTertiary}
              />
            </View>

            <Button
              title="Record Thought"
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </Card>
        </View>
      </ScrollView>

      {/* Cognitive Distortion Info Modal */}
      <Modal
        visible={showDistortionInfo}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDistortionInfo(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cognitive Patterns</Text>
            <TouchableOpacity onPress={() => setShowDistortionInfo(false)}>
              <Icon name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {cognitiveDistortions.map((distortion) => (
              <Card key={distortion.id} style={styles.distortionCard}>
                <Text style={styles.distortionName}>{distortion.name}</Text>
                <Text style={styles.distortionDescription}>{distortion.description}</Text>
                <Text style={styles.distortionExample}>Example: {distortion.example}</Text>
              </Card>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.base,
  },
  card: {
    marginBottom: SPACING.base,
  },
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    minHeight: DIMENSIONS.inputHeight,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    minHeight: 100,
  },
  pickerContainer: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  picker: {
    color: COLORS.textPrimary,
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  distortionInfo: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  distortionExample: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: SPACING.lg,
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.base,
  },
  distortionCard: {
    marginBottom: SPACING.base,
  },
  distortionName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  distortionDescription: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 22,
  },
});

export default TrackScreen;