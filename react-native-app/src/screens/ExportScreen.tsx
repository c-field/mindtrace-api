import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';
import { format, subDays } from 'date-fns';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { thoughtService } from '../services/thoughtService';
import Icon from 'react-native-vector-icons/Ionicons';

const ExportScreen: React.FC = () => {
  const [dateFrom, setDateFrom] = useState(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleQuickSelect = (days: number) => {
    const now = new Date();
    setDateFrom(subDays(now, days));
    setDateTo(now);
  };

  const handleExport = async () => {
    if (dateFrom > dateTo) {
      Alert.alert('Error', 'Start date must be before end date');
      return;
    }

    setIsExporting(true);

    try {
      const dateFromStr = format(dateFrom, 'yyyy-MM-dd') + 'T00:00:00.000Z';
      const dateToStr = format(dateTo, 'yyyy-MM-dd') + 'T23:59:59.999Z';

      if (exportFormat === 'csv') {
        const result = await thoughtService.exportThoughts(dateFromStr, dateToStr);
        
        if (result.success && result.data) {
          // Save CSV to device
          const fileName = `mindtrace-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
          const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
          
          await RNFS.writeFile(filePath, result.data, 'utf8');
          
          // Share the file
          const shareOptions = {
            title: 'MindTrace Export',
            message: 'Your mental health data export',
            url: `file://${filePath}`,
            type: 'text/csv',
          };
          
          await Share.open(shareOptions);
          
          Alert.alert(
            'Export Successful',
            'Your data has been exported and saved to your device. You can now share it or save it to your preferred location.'
          );
        } else {
          Alert.alert('Export Failed', result.error || 'Failed to export data');
        }
      } else {
        // PDF export would require additional implementation
        Alert.alert('PDF Export', 'PDF export feature coming soon!');
      }
    } catch (error) {
      Alert.alert('Export Failed', 'An error occurred while exporting your data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Export Data</Text>
          <Text style={styles.headerSubtitle}>
            Export your mental health data for personal records or sharing with healthcare providers.
          </Text>
        </View>

        {/* Export Form */}
        <View style={styles.formContainer}>
          {/* Quick Select Buttons */}
          <View style={styles.quickSelectContainer}>
            <Text style={styles.sectionTitle}>Quick Time Periods</Text>
            <View style={styles.quickSelectButtons}>
              <TouchableOpacity
                style={styles.quickSelectButton}
                onPress={() => handleQuickSelect(7)}
              >
                <Text style={styles.quickSelectButtonText}>Last 7 days</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickSelectButton}
                onPress={() => handleQuickSelect(30)}
              >
                <Text style={styles.quickSelectButtonText}>Last 30 days</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Range Selection */}
          <View style={styles.dateContainer}>
            <Text style={styles.sectionTitle}>Date Range</Text>
            
            <View style={styles.dateGroup}>
              <Text style={styles.dateLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowFromPicker(true)}
              >
                <Icon name="calendar-outline" size={20} color="#9CA3AF" />
                <Text style={styles.dateButtonText}>
                  {format(dateFrom, 'MMM dd, yyyy')}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.dateGroup}>
              <Text style={styles.dateLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowToPicker(true)}
              >
                <Icon name="calendar-outline" size={20} color="#9CA3AF" />
                <Text style={styles.dateButtonText}>
                  {format(dateTo, 'MMM dd, yyyy')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Export Format Selection */}
          <View style={styles.formatContainer}>
            <Text style={styles.sectionTitle}>Export Format</Text>
            
            <TouchableOpacity
              style={[styles.formatOption, exportFormat === 'csv' && styles.formatOptionSelected]}
              onPress={() => setExportFormat('csv')}
            >
              <View style={styles.formatOptionContent}>
                <View style={[styles.radio, exportFormat === 'csv' && styles.radioSelected]} />
                <View style={styles.formatInfo}>
                  <Text style={styles.formatTitle}>CSV Spreadsheet</Text>
                  <Text style={styles.formatDescription}>
                    Compatible with Excel, Google Sheets, and other data analysis tools
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.formatOption, exportFormat === 'pdf' && styles.formatOptionSelected]}
              onPress={() => setExportFormat('pdf')}
            >
              <View style={styles.formatOptionContent}>
                <View style={[styles.radio, exportFormat === 'pdf' && styles.radioSelected]} />
                <View style={styles.formatInfo}>
                  <Text style={styles.formatTitle}>PDF Report</Text>
                  <Text style={styles.formatDescription}>
                    Professional report format suitable for healthcare providers
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Export Button */}
          <TouchableOpacity
            style={[styles.exportButton, isExporting && styles.exportButtonDisabled]}
            onPress={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="download-outline" size={20} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>
                  Export {exportFormat.toUpperCase()}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Export Info */}
          <View style={styles.infoContainer}>
            <Icon name="information-circle-outline" size={20} color="#00D4AA" />
            <Text style={styles.infoText}>
              Your data will be exported securely and can be saved to your device or shared 
              with healthcare providers. All exports include thought content, cognitive distortions, 
              intensity levels, and timestamps.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Date Pickers */}
      {showFromPicker && (
        <DatePicker
          value={dateFrom}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFromPicker(false);
            if (selectedDate) setDateFrom(selectedDate);
          }}
        />
      )}

      {showToPicker && (
        <DatePicker
          value={dateTo}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowToPicker(false);
            if (selectedDate) setDateTo(selectedDate);
          }}
        />
      )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 16,
  },
  quickSelectContainer: {
    marginBottom: 32,
  },
  quickSelectButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  quickSelectButton: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  quickSelectButtonText: {
    fontSize: 14,
    color: '#00D4AA',
    fontWeight: '500',
  },
  dateContainer: {
    marginBottom: 32,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#F3F4F6',
  },
  formatContainer: {
    marginBottom: 32,
  },
  formatOption: {
    backgroundColor: '#1F2937',
    borderColor: '#4B5563',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  formatOptionSelected: {
    borderColor: '#00D4AA',
    backgroundColor: '#0F2E29',
  },
  formatOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  radioSelected: {
    borderColor: '#00D4AA',
    backgroundColor: '#00D4AA',
  },
  formatInfo: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  formatDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  exportButton: {
    backgroundColor: '#00D4AA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 52,
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  exportButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F2E29',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00D4AA',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
});

export default ExportScreen;