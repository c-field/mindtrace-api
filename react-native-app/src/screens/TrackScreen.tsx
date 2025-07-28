import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { thoughtService, CreateThoughtData } from '../services/thoughtService';
import { cognitiveDistortions, getCognitiveDistortionById } from '../data/cognitiveDistortions';
import CustomSlider from '../components/CustomSlider';
import Icon from 'react-native-vector-icons/Ionicons';

const TrackScreen: React.FC = () => {
  const [content, setContent] = useState('');
  const [cognitiveDistortion, setCognitiveDistortion] = useState('');
  const [trigger, setTrigger] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [showDistortionInfo, setShowDistortionInfo] = useState(false);
  
  const queryClient = useQueryClient();

  const createThoughtMutation = useMutation({
    mutationFn: async (data: CreateThoughtData) => {
      const result = await thoughtService.createThought(data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Reset form
      setContent('');
      setCognitiveDistortion('');
      setTrigger('');
      setIntensity(5);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['thoughts'] });
      
      Alert.alert('Success', 'Thought recorded successfully!');
    },
    onError: (error: Error) => {
      const isNetworkError = error.message.includes('Network error');
      Alert.alert(
        isNetworkError ? 'No Internet Connection' : 'Error',
        isNetworkError ? error.message : 'Failed to record thought. Please check your connection and try again.'
      );
    },
  });

  const handleSubmit = () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter your thought');
      return;
    }
    
    if (!cognitiveDistortion) {
      Alert.alert('Error', 'Please select a cognitive distortion');
      return;
    }

    const thoughtData: CreateThoughtData = {
      content: content.trim(),
      cognitiveDistortion,
      trigger: trigger.trim() || undefined,
      intensity
    };

    createThoughtMutation.mutate(thoughtData);
  };

  const selectedDistortionData = getCognitiveDistortionById(cognitiveDistortion);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Track Your Thoughts</Text>
          <Text style={styles.headerSubtitle}>
            Record and categorize negative thought patterns to gain insight into your mental health journey.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Thought Content */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Thought</Text>
            <TextInput
              style={styles.textArea}
              value={content}
              onChangeText={setContent}
              placeholder="Describe the negative thought you're experiencing..."
              placeholderTextColor="#6B7280"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Cognitive Distortion Selection */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Cognitive Distortion Pattern</Text>
              {selectedDistortionData && (
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => setShowDistortionInfo(true)}
                >
                  <Icon name="information-circle-outline" size={20} color="#00D4AA" />
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={cognitiveDistortion}
                onValueChange={(itemValue) => setCognitiveDistortion(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}
                dropdownIconColor="#9CA3AF"
              >
                <Picker.Item label="Select a cognitive distortion..." value="" />
                {cognitiveDistortions.map((distortion) => (
                  <Picker.Item
                    key={distortion.id}
                    label={distortion.name}
                    value={distortion.id}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Trigger (Optional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trigger (Optional)</Text>
            <TextInput
              style={styles.input}
              value={trigger}
              onChangeText={setTrigger}
              placeholder="What triggered this thought?"
              placeholderTextColor="#6B7280"
            />
          </View>

          {/* Intensity Level */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Intensity Level</Text>
            <Text style={styles.sublabel}>
              Rate the emotional intensity of this thought (1 = mild, 10 = severe)
            </Text>
            <CustomSlider
              value={intensity}
              onValueChange={setIntensity}
              minimumValue={1}
              maximumValue={10}
              step={1}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, createThoughtMutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={createThoughtMutation.isPending}
          >
            {createThoughtMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Record Thought</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Distortion Info Modal */}
      <Modal
        visible={showDistortionInfo}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDistortionInfo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedDistortionData && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedDistortionData.name}</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowDistortionInfo(false)}
                  >
                    <Icon name="close" size={24} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.modalDescription}>
                  {selectedDistortionData.description}
                </Text>
                
                <View style={styles.modalExampleContainer}>
                  <Text style={styles.modalExampleTitle}>Example:</Text>
                  <Text style={styles.modalExample}>
                    "{selectedDistortionData.example}"
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#374151',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  formContainer: {
    backgroundColor: '#374151',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F3F4F6',
    minHeight: 48,
  },
  textArea: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F3F4F6',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#F3F4F6',
    backgroundColor: '#1F2937',
  },
  pickerItem: {
    color: '#F3F4F6',
    fontSize: 16,
  },
  infoButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F3F4F6',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalExampleContainer: {
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00D4AA',
  },
  modalExampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D4AA',
    marginBottom: 8,
  },
  modalExample: {
    fontSize: 14,
    color: '#D1D5DB',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

export default TrackScreen;