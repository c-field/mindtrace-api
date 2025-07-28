import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns';
import { thoughtService, Thought } from '../services/thoughtService';
import { getCognitiveDistortionById } from '../data/cognitiveDistortions';
import Icon from 'react-native-vector-icons/Ionicons';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

const AnalyzeScreen: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<'7days' | '30days' | 'all'>('30days');
  
  const { data: thoughts = [], isLoading, error } = useQuery({
    queryKey: ['thoughts', timeFilter],
    queryFn: async () => {
      const now = new Date();
      let dateFrom: string | undefined;
      
      if (timeFilter === '7days') {
        dateFrom = format(subDays(now, 7), 'yyyy-MM-dd') + 'T00:00:00.000Z';
      } else if (timeFilter === '30days') {
        dateFrom = format(subDays(now, 30), 'yyyy-MM-dd') + 'T00:00:00.000Z';
      }
      
      const dateTo = format(now, 'yyyy-MM-dd') + 'T23:59:59.999Z';
      
      return thoughtService.getThoughts(dateFrom, dateTo);
    },
  });

  const filteredThoughts = thoughts.filter((thought) => {
    if (!thought.created_at) return false;
    
    try {
      const thoughtDate = parseISO(thought.created_at);
      const now = new Date();
      
      if (timeFilter === '7days') {
        return isAfter(thoughtDate, subDays(now, 7));
      } else if (timeFilter === '30days') {
        return isAfter(thoughtDate, subDays(now, 30));
      }
      
      return true;
    } catch (error) {
      return false;
    }
  });

  // Prepare chart data
  const intensityData = prepareIntensityData(filteredThoughts);
  const distortionData = prepareDistortionData(filteredThoughts);
  const dailyData = prepareDailyData(filteredThoughts, timeFilter);

  const chartConfig = {
    backgroundGradientFrom: '#374151',
    backgroundGradientTo: '#374151',
    color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D4AA" />
          <Text style={styles.loadingText}>Analyzing your patterns...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Failed to load analysis data</Text>
          <Text style={styles.errorSubtext}>Please check your connection and try again</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (filteredThoughts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Analyze Patterns</Text>
            <Text style={styles.headerSubtitle}>
              Track your mental health journey through data visualization and insights.
            </Text>
          </View>
          
          <View style={styles.emptyContainer}>
            <Icon name="analytics-outline" size={64} color="#6B7280" />
            <Text style={styles.emptyTitle}>No Data Available</Text>
            <Text style={styles.emptyText}>
              Start tracking your thoughts to see patterns and insights here.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analyze Patterns</Text>
          <Text style={styles.headerSubtitle}>
            Track your mental health journey through data visualization and insights.
          </Text>
        </View>

        {/* Time Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === '7days' && styles.filterButtonActive]}
            onPress={() => setTimeFilter('7days')}
          >
            <Text style={[styles.filterButtonText, timeFilter === '7days' && styles.filterButtonTextActive]}>
              7 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === '30days' && styles.filterButtonActive]}
            onPress={() => setTimeFilter('30days')}
          >
            <Text style={[styles.filterButtonText, timeFilter === '30days' && styles.filterButtonTextActive]}>
              30 Days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, timeFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setTimeFilter('all')}
          >
            <Text style={[styles.filterButtonText, timeFilter === 'all' && styles.filterButtonTextActive]}>
              All Time
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{filteredThoughts.length}</Text>
            <Text style={styles.statsLabel}>Total Thoughts</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>
              {filteredThoughts.length > 0 
                ? (filteredThoughts.reduce((sum, t) => sum + t.intensity, 0) / filteredThoughts.length).toFixed(1)
                : '0'
              }
            </Text>
            <Text style={styles.statsLabel}>Avg Intensity</Text>
          </View>
        </View>

        {/* Intensity Over Time Chart */}
        {dailyData.datasets[0].data.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Intensity Over Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={dailyData}
                width={Math.max(chartWidth, dailyData.labels.length * 50)}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </ScrollView>
          </View>
        )}

        {/* Cognitive Distortions Chart */}
        {distortionData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Most Common Distortions</Text>
            <BarChart
              data={{
                labels: distortionData.slice(0, 5).map(d => d.name.split(' ')[0]),
                datasets: [{ data: distortionData.slice(0, 5).map(d => d.count) }]
              }}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </View>
        )}

        {/* Intensity Distribution */}
        {intensityData.length > 0 && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Intensity Distribution</Text>
            <BarChart
              data={{
                labels: intensityData.map(d => d.level.toString()),
                datasets: [{ data: intensityData.map(d => d.count) }]
              }}
              width={chartWidth}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars
            />
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

// Helper functions
function prepareIntensityData(thoughts: Thought[]) {
  const intensityCount: { [key: number]: number } = {};
  
  thoughts.forEach(thought => {
    if (thought.intensity) {
      intensityCount[thought.intensity] = (intensityCount[thought.intensity] || 0) + 1;
    }
  });
  
  return Object.entries(intensityCount)
    .map(([level, count]) => ({ level: parseInt(level), count }))
    .sort((a, b) => a.level - b.level);
}

function prepareDistortionData(thoughts: Thought[]) {
  const distortionCount: { [key: string]: number } = {};
  
  thoughts.forEach(thought => {
    if (thought.cognitive_distortion) {
      const distortion = getCognitiveDistortionById(thought.cognitive_distortion);
      if (distortion) {
        distortionCount[distortion.name] = (distortionCount[distortion.name] || 0) + 1;
      }
    }
  });
  
  return Object.entries(distortionCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

function prepareDailyData(thoughts: Thought[], timeFilter: string) {
  const days = timeFilter === '7days' ? 7 : timeFilter === '30days' ? 30 : 90;
  const dailyData: { [key: string]: { total: number, count: number } } = {};
  
  // Initialize with empty days
  for (let i = 0; i < days; i++) {
    const date = format(subDays(new Date(), i), 'MM/dd');
    dailyData[date] = { total: 0, count: 0 };
  }
  
  // Fill with actual data
  thoughts.forEach(thought => {
    if (thought.created_at && thought.intensity) {
      try {
        const date = format(parseISO(thought.created_at), 'MM/dd');
        if (dailyData[date]) {
          dailyData[date].total += thought.intensity;
          dailyData[date].count += 1;
        }
      } catch (error) {
        console.error('Date parsing error:', error);
      }
    }
  });
  
  const labels = Object.keys(dailyData).reverse();
  const data = labels.map(date => 
    dailyData[date].count > 0 ? dailyData[date].total / dailyData[date].count : 0
  );
  
  return {
    labels,
    datasets: [{ data }]
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
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
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: '#00D4AA',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  statsNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#374151',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomPadding: {
    height: 32,
  },
});

export default AnalyzeScreen;