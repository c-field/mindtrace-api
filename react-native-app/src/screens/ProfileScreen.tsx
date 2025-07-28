import React, { useState, useEffect } from 'react';
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
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { thoughtService, Thought } from '../services/thoughtService';
import { authService } from '../services/authService';
import Icon from 'react-native-vector-icons/Ionicons';

interface ProfileScreenProps {
  navigation?: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [userEmail, setUserEmail] = useState<string>('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadUserInfo();
  }, []);

  const loadUserInfo = async () => {
    const email = await authService.getCurrentUser();
    if (email) {
      setUserEmail(email);
    }
  };

  const { data: thoughts = [], isLoading } = useQuery({
    queryKey: ['thoughts'],
    queryFn: () => thoughtService.getThoughts(),
  });

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await authService.logout();
              // Navigation will be handled by App.tsx auth state change
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const calculateStats = (thoughts: Thought[]) => {
    if (thoughts.length === 0) {
      return {
        totalThoughts: 0,
        averageIntensity: 0,
        mostCommonDistortion: 'None',
        joinDate: new Date(),
      };
    }

    const totalIntensity = thoughts.reduce((sum, thought) => sum + (thought.intensity || 0), 0);
    const averageIntensity = totalIntensity / thoughts.length;

    // Find most common distortion
    const distortionCounts: { [key: string]: number } = {};
    thoughts.forEach(thought => {
      if (thought.cognitive_distortion) {
        distortionCounts[thought.cognitive_distortion] = (distortionCounts[thought.cognitive_distortion] || 0) + 1;
      }
    });

    const mostCommonDistortion = Object.entries(distortionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    // Estimate join date from earliest thought
    const earliestThought = thoughts
      .filter(t => t.created_at)
      .sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime())[0];
    
    const joinDate = earliestThought ? new Date(earliestThought.created_at!) : new Date();

    return {
      totalThoughts: thoughts.length,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      mostCommonDistortion,
      joinDate,
    };
  };

  const stats = calculateStats(thoughts);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>
            Your mental health journey overview and account settings.
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.userInfoContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Icon name="person" size={40} color="#00D4AA" />
            </View>
          </View>
          
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Welcome Back!</Text>
            <Text style={styles.userEmail}>{userEmail || 'user@mindtrace.app'}</Text>
            <Text style={styles.joinDate}>
              Member since {format(stats.joinDate, 'MMM yyyy')}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Your Journey Stats</Text>
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#00D4AA" />
              <Text style={styles.loadingText}>Loading your stats...</Text>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="create-outline" size={24} color="#00D4AA" />
                <Text style={styles.statNumber}>{stats.totalThoughts}</Text>
                <Text style={styles.statLabel}>Thoughts Tracked</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="trending-up-outline" size={24} color="#00D4AA" />
                <Text style={styles.statNumber}>{stats.averageIntensity}</Text>
                <Text style={styles.statLabel}>Avg Intensity</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="analytics-outline" size={24} color="#00D4AA" />
                <Text style={styles.statNumber}>
                  {stats.mostCommonDistortion === 'None' ? 'N/A' : stats.mostCommonDistortion.split('-')[0]}
                </Text>
                <Text style={styles.statLabel}>Top Pattern</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="download-outline" size={20} color="#F3F4F6" />
            <Text style={styles.actionButtonText}>Export All Data</Text>
            <Icon name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="analytics-outline" size={20} color="#F3F4F6" />
            <Text style={styles.actionButtonText}>View Analysis</Text>
            <Icon name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="settings-outline" size={20} color="#F3F4F6" />
            <Text style={styles.actionButtonText}>App Settings</Text>
            <Icon name="chevron-forward" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.supportContainer}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          
          <TouchableOpacity style={styles.supportButton}>
            <Icon name="help-circle-outline" size={20} color="#F3F4F6" />
            <Text style={styles.supportButtonText}>Help & FAQ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportButton}>
            <Icon name="mail-outline" size={20} color="#F3F4F6" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.supportButton}>
            <Icon name="shield-checkmark-outline" size={20} color="#F3F4F6" />
            <Text style={styles.supportButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Icon name="log-out-outline" size={20} color="#FFFFFF" />
                <Text style={styles.logoutButtonText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
          
          <View style={styles.appInfo}>
            <Text style={styles.appVersion}>MindTrace v1.0.0</Text>
            <Text style={styles.appCopyright}>© 2025 Mental Health Support</Text>
          </View>
        </View>
      </ScrollView>
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
  userInfoContainer: {
    backgroundColor: '#374151',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00D4AA',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsContainer: {
    backgroundColor: '#374151',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00D4AA',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionsContainer: {
    backgroundColor: '#374151',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#F3F4F6',
    marginLeft: 12,
  },
  supportContainer: {
    backgroundColor: '#374151',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  supportButtonText: {
    fontSize: 16,
    color: '#F3F4F6',
    marginLeft: 12,
  },
  footer: {
    margin: 16,
    marginBottom: 32,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logoutButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  appCopyright: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default ProfileScreen;