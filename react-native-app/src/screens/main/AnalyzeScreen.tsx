import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../constants';
import { useThoughts, useThoughtStats } from '../../hooks';
import { Card, LoadingSpinner, ErrorMessage, Button } from '../../components';
import { formatDisplayDate } from '../../utils';
import type { TimeFilter } from '../../types';

const screenWidth = Dimensions.get('window').width;

const AnalyzeScreen: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30days');
  const { data: thoughts = [], isLoading, error, refetch } = useThoughts({ timeFilter });
  const stats = useThoughtStats(thoughts);

  if (isLoading) {
    return <LoadingSpinner overlay message="Loading analysis..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ErrorMessage
            message="Failed to load thought data"
            onRetry={refetch}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Prepare chart data
  const intensityData = thoughts.map((thought, index) => ({
    x: index + 1,
    y: thought.intensity || 0,
  }));

  const distortionCounts = thoughts.reduce((acc, thought) => {
    const distortion = thought.cognitive_distortion || 'Unknown';
    acc[distortion] = (acc[distortion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(243, 244, 246, ${opacity})`,
    style: {
      borderRadius: BORDER_RADIUS.lg,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: COLORS.primary,
    },
  };

  const intensityChartData = {
    labels: thoughts.slice(-7).map((_, index) => `${index + 1}`),
    datasets: [
      {
        data: thoughts.slice(-7).map(thought => thought.intensity || 0),
        color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Filter Buttons */}
          <Card style={styles.filterCard}>
            <Text style={styles.sectionTitle}>Time Period</Text>
            <View style={styles.filterButtons}>
              {[
                { key: '7days' as TimeFilter, label: 'Last 7 Days' },
                { key: '30days' as TimeFilter, label: 'Last 30 Days' },
                { key: 'all' as TimeFilter, label: 'All Time' },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  title={filter.label}
                  onPress={() => setTimeFilter(filter.key)}
                  variant={timeFilter === filter.key ? 'primary' : 'secondary'}
                  size="small"
                  style={styles.filterButton}
                />
              ))}
            </View>
          </Card>

          {/* Statistics Cards */}
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalThoughts}</Text>
              <Text style={styles.statLabel}>Total Thoughts</Text>
            </Card>
            
            <Card style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.averageIntensity}</Text>
              <Text style={styles.statLabel}>Avg Intensity</Text>
            </Card>
          </View>

          <Card style={styles.statCardFull}>
            <Text style={styles.statLabel}>Most Common Pattern</Text>
            <Text style={styles.statText}>{stats.mostCommonDistortion}</Text>
          </Card>

          {/* Intensity Trend Chart */}
          {thoughts.length > 0 && (
            <Card style={styles.chartCard}>
              <Text style={styles.sectionTitle}>Intensity Trend (Last 7 entries)</Text>
              <LineChart
                data={intensityChartData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card>
          )}

          {/* Recent Thoughts */}
          <Card style={styles.recentCard}>
            <Text style={styles.sectionTitle}>Recent Thoughts</Text>
            {thoughts.slice(0, 5).map((thought) => (
              <View key={thought.id} style={styles.thoughtItem}>
                <View style={styles.thoughtHeader}>
                  <Text style={styles.thoughtDate}>
                    {formatDisplayDate(thought.created_at)}
                  </Text>
                  <View style={styles.intensityBadge}>
                    <Text style={styles.intensityText}>{thought.intensity}</Text>
                  </View>
                </View>
                <Text style={styles.thoughtContent} numberOfLines={2}>
                  {thought.content}
                </Text>
                <Text style={styles.thoughtDistortion}>
                  {thought.cognitive_distortion}
                </Text>
              </View>
            ))}
          </Card>

          {thoughts.length === 0 && (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No Data Available</Text>
              <Text style={styles.emptyText}>
                Start tracking your thoughts to see patterns and insights here.
              </Text>
            </Card>
          )}
        </View>
      </ScrollView>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Filter section
  filterCard: {
    marginBottom: SPACING.base,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.base,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterButton: {
    flex: 1,
  },
  
  // Statistics
  statsGrid: {
    flexDirection: 'row',
    gap: SPACING.base,
    marginBottom: SPACING.base,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statCardFull: {
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  statNumber: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  statText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  
  // Charts
  chartCard: {
    marginBottom: SPACING.base,
  },
  chart: {
    marginVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  
  // Recent thoughts
  recentCard: {
    marginBottom: SPACING.base,
  },
  thoughtItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: SPACING.md,
  },
  thoughtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  thoughtDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },
  intensityBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    minWidth: 24,
    alignItems: 'center',
  },
  intensityText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.white,
  },
  thoughtContent: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  thoughtDistortion: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  
  // Empty state
  emptyCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default AnalyzeScreen;