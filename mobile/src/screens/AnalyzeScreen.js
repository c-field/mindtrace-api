import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const API_BASE_URL = 'https://your-repl-name.your-username.repl.co';
const { width } = Dimensions.get('window');

const dateFilters = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: '7days', label: 'Last 7 Days' },
  { id: '30days', label: 'Last 30 Days' },
];

export default function AnalyzeScreen() {
  const [selectedFilter, setSelectedFilter] = useState('7days');
  const [thoughts, setThoughts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchThoughts();
  }, [selectedFilter]);

  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return {
          from: today.toISOString(),
          to: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
        };
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {
          from: yesterday.toISOString(),
          to: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString()
        };
      case '7days':
        return {
          from: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        };
      case '30days':
        return {
          from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString()
        };
      default:
        return { from: null, to: null };
    }
  };

  const fetchThoughts = async () => {
    setLoading(true);
    try {
      const { from, to } = getDateRange(selectedFilter);
      let url = `${API_BASE_URL}/api/thoughts`;
      
      if (from && to) {
        url += `?dateFrom=${from}&dateTo=${to}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setThoughts(data);
        calculateAnalytics(data);
      } else {
        Alert.alert('Error', 'Failed to fetch thoughts');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (thoughtsData) => {
    if (thoughtsData.length === 0) {
      setAnalytics(null);
      return;
    }

    const totalThoughts = thoughtsData.length;
    const averageIntensity = thoughtsData.reduce((sum, t) => sum + t.intensity, 0) / totalThoughts;
    
    // Count emotions
    const emotionCounts = {};
    thoughtsData.forEach(thought => {
      emotionCounts[thought.emotion] = (emotionCounts[thought.emotion] || 0) + 1;
    });
    const topEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

    // Count cognitive distortions
    const distortionCounts = {};
    thoughtsData.forEach(thought => {
      thought.cognitiveDistortions.forEach(distortion => {
        distortionCounts[distortion] = (distortionCounts[distortion] || 0) + 1;
      });
    });
    const topDistortions = Object.entries(distortionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    setAnalytics({
      totalThoughts,
      averageIntensity: averageIntensity.toFixed(1),
      topEmotion: topEmotion ? { name: topEmotion[0], count: topEmotion[1] } : null,
      topDistortions,
    });
  };

  const renderMetricCard = (title, value, subtitle, icon) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Ionicons name={icon} size={24} color="#0f766e" />
        <Text style={styles.metricTitle}>{title}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderThoughtCard = (thought) => (
    <View key={thought.id} style={styles.thoughtCard}>
      <View style={styles.thoughtHeader}>
        <View style={styles.thoughtMeta}>
          <Text style={styles.thoughtEmotion}>{thought.emotion}</Text>
          <View style={styles.intensityBadge}>
            <Text style={styles.intensityText}>{thought.intensity}/10</Text>
          </View>
        </View>
        <Text style={styles.thoughtDate}>
          {new Date(thought.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.thoughtContent} numberOfLines={3}>
        {thought.content}
      </Text>
      {thought.trigger && (
        <Text style={styles.thoughtTrigger}>
          <Text style={styles.triggerLabel}>Trigger: </Text>
          {thought.trigger}
        </Text>
      )}
      <View style={styles.distortionsContainer}>
        {thought.cognitiveDistortions.slice(0, 2).map(distortion => (
          <View key={distortion} style={styles.distortionTag}>
            <Text style={styles.distortionTagText}>{distortion}</Text>
          </View>
        ))}
        {thought.cognitiveDistortions.length > 2 && (
          <Text style={styles.moreDistortions}>
            +{thought.cognitiveDistortions.length - 2} more
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analyze Patterns</Text>
        <Text style={styles.subtitle}>Understand your thought patterns and trends</Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dateFilters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                selectedFilter === filter.id && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text style={[
                styles.filterText,
                selectedFilter === filter.id && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : analytics ? (
          <>
            <View style={styles.metricsGrid}>
              {renderMetricCard(
                'Total Thoughts',
                analytics.totalThoughts,
                'thoughts recorded',
                'document-text'
              )}
              {renderMetricCard(
                'Average Intensity',
                analytics.averageIntensity,
                'out of 10',
                'speedometer'
              )}
            </View>

            {analytics.topEmotion && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Most Common Emotion</Text>
                <View style={styles.emotionCard}>
                  <Text style={styles.emotionName}>{analytics.topEmotion.name}</Text>
                  <Text style={styles.emotionCount}>
                    {analytics.topEmotion.count} times
                  </Text>
                </View>
              </View>
            )}

            {analytics.topDistortions.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Cognitive Distortions</Text>
                {analytics.topDistortions.map(([distortion, count], index) => (
                  <View key={distortion} style={styles.distortionRow}>
                    <Text style={styles.distortionName}>{distortion}</Text>
                    <Text style={styles.distortionCount}>{count}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Thoughts</Text>
              {thoughts.slice(0, 5).map(renderThoughtCard)}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="analytics-outline" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No Data Available</Text>
            <Text style={styles.emptySubtitle}>
              Record some thoughts to see your analytics
            </Text>
          </View>
        )}
      </ScrollView>
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
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },
  filterText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 25,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
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
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 4,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 15,
  },
  emotionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emotionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emotionCount: {
    fontSize: 14,
    color: '#6b7280',
  },
  distortionRow: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distortionName: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  distortionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
  },
  thoughtCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  thoughtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  thoughtMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thoughtEmotion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f766e',
    marginRight: 10,
  },
  intensityBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  intensityText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  thoughtDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  thoughtContent: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  thoughtTrigger: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  triggerLabel: {
    fontWeight: '500',
  },
  distortionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  distortionTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  distortionTagText: {
    fontSize: 10,
    color: '#065f46',
    fontWeight: '500',
  },
  moreDistortions: {
    fontSize: 10,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9ca3af',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});