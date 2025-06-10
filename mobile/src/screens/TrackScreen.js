import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'http://localhost:5000';

const emotions = [
  'Anxious', 'Sad', 'Angry', 'Frustrated', 'Overwhelmed', 'Lonely',
  'Guilty', 'Ashamed', 'Fearful', 'Hopeless', 'Irritated', 'Disappointed'
];

const cognitiveDistortions = [
  { id: 'all-or-nothing', name: 'All-or-Nothing Thinking' },
  { id: 'overgeneralization', name: 'Overgeneralization' },
  { id: 'mental-filter', name: 'Mental Filter' },
  { id: 'disqualifying-positive', name: 'Disqualifying the Positive' },
  { id: 'jumping-to-conclusions', name: 'Jumping to Conclusions' },
  { id: 'magnification', name: 'Magnification (Catastrophizing)' },
  { id: 'emotional-reasoning', name: 'Emotional Reasoning' },
  { id: 'should-statements', name: 'Should Statements' },
  { id: 'labeling', name: 'Labeling and Mislabeling' },
  { id: 'personalization', name: 'Personalization' },
];

export default function TrackScreen() {
  const [thought, setThought] = useState('');
  const [emotion, setEmotion] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState('');
  const [selectedDistortions, setSelectedDistortions] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleDistortion = (distortionId) => {
    setSelectedDistortions(prev => 
      prev.includes(distortionId)
        ? prev.filter(id => id !== distortionId)
        : [...prev, distortionId]
    );
  };

  const handleSubmit = async () => {
    if (!thought.trim() || !emotion || selectedDistortions.length === 0) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/thoughts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: thought,
          emotion,
          intensity,
          cognitiveDistortions: selectedDistortions,
          trigger: trigger || null,
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Your thought has been recorded');
        // Reset form
        setThought('');
        setEmotion('');
        setIntensity(5);
        setTrigger('');
        setSelectedDistortions([]);
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'Failed to save thought');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Track Your Thoughts</Text>
          <Text style={styles.subtitle}>Record and analyze your thought patterns</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>What's on your mind? *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe the negative thought you're experiencing..."
              value={thought}
              onChangeText={setThought}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Primary Emotion *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={emotion}
                onValueChange={setEmotion}
                style={styles.picker}
              >
                <Picker.Item label="Select an emotion..." value="" />
                {emotions.map(em => (
                  <Picker.Item key={em} label={em} value={em} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Intensity Level: {intensity}/10</Text>
            <View style={styles.intensityContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.intensityButton,
                    intensity === num && styles.intensityButtonActive
                  ]}
                  onPress={() => setIntensity(num)}
                >
                  <Text style={[
                    styles.intensityText,
                    intensity === num && styles.intensityTextActive
                  ]}>
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Cognitive Distortions *</Text>
            <Text style={styles.sublabel}>
              Select patterns that apply to this thought:
            </Text>
            <View style={styles.distortionsContainer}>
              {cognitiveDistortions.map(distortion => (
                <TouchableOpacity
                  key={distortion.id}
                  style={[
                    styles.distortionChip,
                    selectedDistortions.includes(distortion.id) && styles.distortionChipActive
                  ]}
                  onPress={() => toggleDistortion(distortion.id)}
                >
                  <Text style={[
                    styles.distortionText,
                    selectedDistortions.includes(distortion.id) && styles.distortionTextActive
                  ]}>
                    {distortion.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Trigger (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="What triggered this thought?"
              value={trigger}
              onChangeText={setTrigger}
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons name="add-circle" size={20} color="white" />
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : 'Record Thought'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  sublabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    minHeight: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 50,
  },
  intensityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  intensityButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  intensityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  intensityTextActive: {
    color: 'white',
  },
  distortionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  distortionChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  distortionChipActive: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
  },
  distortionText: {
    fontSize: 14,
    color: '#6b7280',
  },
  distortionTextActive: {
    color: '#16a34a',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});