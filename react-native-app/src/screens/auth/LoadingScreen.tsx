import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { LoadingSpinner } from '../../components';

const LoadingScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>MindTrace</Text>
        <Text style={styles.subtitle}>Mental Health Support</Text>
        
        <View style={styles.loadingContainer}>
          <LoadingSpinner message="Loading..." />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  logo: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING['3xl'],
  },
  loadingContainer: {
    marginTop: SPACING['2xl'],
  },
});

export default LoadingScreen;