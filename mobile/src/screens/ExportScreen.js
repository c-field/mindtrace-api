import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_BASE_URL = 'http://localhost:5000';

export default function ExportScreen() {
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const fromStr = dateFrom.toISOString().split('T')[0];
      const toStr = dateTo.toISOString().split('T')[0];
      
      const response = await fetch(
        `${API_BASE_URL}/api/export/csv?dateFrom=${fromStr}&dateTo=${toStr}`
      );
      
      if (response.ok) {
        const csvData = await response.text();
        
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          await Share.share({
            message: csvData,
            title: 'MindTrace Thoughts Export',
          });
        }
        
        Alert.alert('Success', 'Your thoughts have been exported successfully');
      } else {
        Alert.alert('Error', 'Failed to export data');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Your Data</Text>
        <Text style={styles.subtitle}>Download your mental health journey data</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="download" size={24} color="#0f766e" />
            <Text style={styles.cardTitle}>Export to CSV</Text>
          </View>
          <Text style={styles.cardDescription}>
            Export your thoughts, emotions, and analysis data in CSV format for backup 
            or analysis in other tools.
          </Text>

          <View style={styles.dateSection}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>From</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowFromPicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(dateFrom)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>To</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowToPicker(true)}
                >
                  <Text style={styles.dateText}>{formatDate(dateTo)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.exportButton, loading && styles.exportButtonDisabled]}
            onPress={handleExportCSV}
            disabled={loading}
          >
            <Ionicons name="download" size={20} color="white" />
            <Text style={styles.exportButtonText}>
              {loading ? 'Exporting...' : 'Export CSV'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#0369a1" />
            <Text style={styles.infoTitle}>Export Information</Text>
          </View>
          
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.infoText}>All your thoughts and emotions</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.infoText}>Cognitive distortion analysis</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.infoText}>Intensity ratings and triggers</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
              <Text style={styles.infoText}>Timestamps for all entries</Text>
            </View>
          </View>
        </View>

        <View style={styles.privacyCard}>
          <View style={styles.privacyHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#7c3aed" />
            <Text style={styles.privacyTitle}>Your Data, Your Control</Text>
          </View>
          <Text style={styles.privacyText}>
            Your mental health data is private and secure. Export features give you 
            complete control over your information for backup, analysis, or sharing 
            with healthcare providers.
          </Text>
        </View>
      </ScrollView>

      {showFromPicker && (
        <DateTimePicker
          value={dateFrom}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) {
              setDateFrom(selectedDate);
            }
          }}
        />
      )}

      {showToPicker && (
        <DateTimePicker
          value={dateTo}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) {
              setDateTo(selectedDate);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  header: {
    padding: 20,
    paddingTop: 60,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginLeft: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  dateSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  dateText: {
    fontSize: 16,
    color: '#374151',
  },
  exportButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  exportButtonDisabled: {
    opacity: 0.7,
  },
  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginLeft: 10,
  },
  infoList: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    marginLeft: 10,
  },
  privacyCard: {
    backgroundColor: '#faf5ff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginLeft: 10,
  },
  privacyText: {
    fontSize: 14,
    color: '#6b46c1',
    lineHeight: 20,
  },
});