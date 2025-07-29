import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS, DIMENSIONS } from '../../constants';
import { useAuth, useThoughts, useThoughtStats } from '../../hooks';
import { Card, Button, LoadingSpinner } from '../../components';
import { formatDisplayDate } from '../../utils';

const ProfileScreen: React.FC = () => {
  const { userEmail, logout, isLoading } = useAuth();
  const { data: thoughts = [], isLoading: thoughtsLoading } = useThoughts();
  const stats = useThoughtStats(thoughts);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (isLoading || thoughtsLoading) {
    return <LoadingSpinner overlay message="Loading profile..." />;
  }

  const joinDate = new Date('2024-01-01'); // Default join date
  const daysSinceJoined = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Profile Header */}
          <Card style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Icon name="person" size={40} color={COLORS.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.userName}>Welcome back!</Text>
                <Text style={styles.userEmail}>{userEmail}</Text>
                <Text style={styles.joinDate}>
                  Member since {formatDisplayDate(joinDate)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Journey Statistics */}
          <Card style={styles.statsCard}>
            <Text style={styles.sectionTitle}>Your Journey</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.totalThoughts}</Text>
                <Text style={styles.statLabel}>Thoughts Tracked</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{daysSinceJoined}</Text>
                <Text style={styles.statLabel}>Days Active</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.averageIntensity}</Text>
                <Text style={styles.statLabel}>Avg Intensity</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {thoughts.length > 0 ? Math.round((stats.totalThoughts / daysSinceJoined) * 10) / 10 : 0}
                </Text>
                <Text style={styles.statLabel}>Thoughts/Day</Text>
              </View>
            </View>
          </Card>

          {/* Insights */}
          <Card style={styles.insightsCard}>
            <Text style={styles.sectionTitle}>Insights</Text>
            
            <View style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <Icon name="trending-up" size={20} color={COLORS.success} />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Most Common Pattern</Text>
                <Text style={styles.insightValue}>{stats.mostCommonDistortion}</Text>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View style={styles.insightIcon}>
                <Icon name="calendar" size={20} color={COLORS.info} />
              </View>
              <View style={styles.insightText}>
                <Text style={styles.insightTitle}>Tracking Consistency</Text>
                <Text style={styles.insightValue}>
                  {thoughts.length > 0 ? 'Regular tracking' : 'Start tracking thoughts'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Account Settings */}
          <Card style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Account</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="person-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.settingText}>Edit Profile</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="notifications-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="shield-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.settingText}>Privacy & Security</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Icon name="help-circle-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.settingText}>Help & Support</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </Card>

          {/* App Information */}
          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.appInfo}>MindTrace v1.0.0</Text>
            <Text style={styles.appDescription}>
              A mental health support application for tracking thoughts, emotions, and cognitive patterns.
            </Text>
          </Card>

          {/* Logout Button */}
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
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
  
  // Profile header
  profileCard: {
    marginBottom: SPACING.base,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.base,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  joinDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
  },
  
  // Statistics
  statsCard: {
    marginBottom: SPACING.base,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.base,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.base,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: SPACING.base,
    borderRadius: BORDER_RADIUS.md,
  },
  statNumber: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  
  // Insights
  insightsCard: {
    marginBottom: SPACING.base,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  insightIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.base,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  insightValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  
  // Settings
  settingsCard: {
    marginBottom: SPACING.base,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    marginLeft: SPACING.base,
  },
  
  // App info
  infoCard: {
    marginBottom: SPACING.base,
  },
  appInfo: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  appDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  
  // Logout button
  logoutButton: {
    marginTop: SPACING.base,
  },
});

export default ProfileScreen;