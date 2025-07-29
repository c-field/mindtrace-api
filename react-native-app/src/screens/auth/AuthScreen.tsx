import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../../constants';
import { validateAuthForm } from '../../utils';
import { useAuth } from '../../hooks';
import { Button, Input, LoadingSpinner } from '../../components';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  
  const { login, register, isLoading } = useAuth();

  const handleAuth = async () => {
    const validationErrors = validateAuthForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const result = isLogin 
        ? await login(email, password)
        : await register(email, password);

      if (!result.success) {
        Alert.alert('Error', result.error || 'Authentication failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection.');
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setErrors({});
  };

  if (isLoading) {
    return <LoadingSpinner overlay message="Authenticating..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo Section */}
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>MindTrace</Text>
              <Text style={styles.subtitle}>Mental Health Support</Text>
              <Text style={styles.description}>
                Track your thoughts, understand patterns, and improve your mental well-being
              </Text>
            </View>

            {/* Form Section */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail-outline"
                error={errors.email}
                required
              />

              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                isPassword
                icon="lock-closed-outline"
                error={errors.password}
                required
              />

              <Button
                title={isLogin ? 'Sign In' : 'Create Account'}
                onPress={handleAuth}
                style={styles.authButton}
              />

              <Button
                title={isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                onPress={toggleAuthMode}
                variant="secondary"
                style={styles.toggleButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING['4xl'],
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
    marginBottom: SPACING.base,
  },
  description: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textTertiary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.xl,
  },
  formTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  authButton: {
    marginTop: SPACING.lg,
  },
  toggleButton: {
    marginTop: SPACING.base,
  },
});

export default AuthScreen;