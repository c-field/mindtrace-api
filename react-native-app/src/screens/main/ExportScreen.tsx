import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants';
import { thoughtService } from '../../services';
import { formatDisplayDate, getDateRange } from '../../utils';
import { Card, Button, LoadingSpinner } from '../../components';

const ExportScreen: React.FC = () => {
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [dateTo, setDateTo] = useState(new Date());
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleQuickFilter = (days: number) => {
    const { from, to } = getDateRange(days);
    setDateFrom(from);
    setDateTo(to);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const result = await thoughtService.exportThoughts(dateFrom, dateTo);
      
      if (!result.success || !result.data) {
        Alert.alert('Error', result.error || 'Failed to export data');
        return;
      }

      // Create file path
      const fileName = `mindtrace-export-${formatDisplayDate(new Date()).replace(/\s/g, '-')}.csv`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      // Write CSV data to file
      await RNFS.writeFile(filePath, result.data, 'utf8');

      // Share the file
      const shareOptions = {
        title: 'MindTrace Data Export',
        message: 'Your thought tracking data export',
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'text/csv',
        filename: fileName,
      };

      await Share.open(shareOptions);
      
      Alert.alert('Success', 'Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isExporting) {
    return <LoadingSpinner overlay message="Preparing export..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Text style={styles.title}>Export Your Data</Text>
            <Text style={styles.subtitle}>
              Download your thought tracking data as a CSV file for personal records or sharing with healthcare providers.
            </Text>

            {/* Quick Date Filters */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Filters</Text>
              <View style={styles.quickFilters}>
                <Button
                  title="Last 7 Days"
                  onPress={() => handleQuickFilter(7)}
                  variant="secondary"
                  size="small"
                  style={styles.quickFilterButton}
                />
                <Button
                  title="Last 30 Days"
                  onPress={() => handleQuickFilter(30)}
                  variant="secondary"
                  size="small"
                  style={styles.quickFilterButton}
                />
              </View>
            </View>

            {/* Date Range Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Custom Date Range</Text>
              
              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>From Date</Text>
                <Button
                  title={formatDisplayDate(dateFrom)}
                  onPress={() => setShowFromPicker(true)}
                  variant="secondary"
                  style={styles.dateButton}
                />
              </View>

              <View style={styles.dateInputContainer}>
                <Text style={styles.dateLabel}>To Date</Text>
                <Button
                  title={formatDisplayDate(dateTo)}
                  onPress={() => setShowToPicker(true)}
                  variant="secondary"
                  style={styles.dateButton}
                />
              </View>
            </View>

            {/* Export Info */}
            <Card style={styles.infoCard}>
              <Text style={styles.infoTitle}>Export Information</Text>
              <Text style={styles.infoText}>
                • Date range: {formatDisplayDate(dateFrom)} to {formatDisplayDate(dateTo)}
              </Text>
              <Text style={styles.infoText}>
                • Format: CSV (Comma Separated Values)
              </Text>
              <Text style={styles.infoText}>
                • Includes: Thoughts, intensity levels, cognitive patterns, triggers, and timestamps
              </Text>
            </Card>

            {/* Export Button */}
            <Button
              title="Export Data"
              onPress={handleExport}
              style={styles.exportButton}
            />
          </Card>

          {/* Privacy Notice */}
          <Card style={styles.privacyCard}>
            <Text style={styles.privacyTitle}>Privacy Notice</Text>
            <Text style={styles.privacyText}>
              Your data is exported locally to your device. We recommend reviewing the content before sharing with others. 
              Always follow your healthcare provider's guidelines for sharing mental health information.
            </Text>
          </Card>
        </View>
      </ScrollView>

      {/* Date Pickers */}
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
    lineHeight: 22,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.base,
  },
  
  // Quick filters
  quickFilters: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickFilterButton: {
    flex: 1,
  },
  
  // Date inputs
  dateInputContainer: {
    marginBottom: SPACING.base,
  },
  dateLabel: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  dateButton: {
    justifyContent: 'flex-start',
  },
  
  // Info card
  infoCard: {
    backgroundColor: COLORS.background,
    marginBottom: SPACING.lg,
  },
  infoTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
    lineHeight: 18,
  },
  
  // Export button
  exportButton: {
    marginTop: SPACING.base,
  },
  
  // Privacy notice
  privacyCard: {
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  privacyTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  privacyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});

export default ExportScreen;