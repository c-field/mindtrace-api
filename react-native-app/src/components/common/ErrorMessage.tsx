import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, DIMENSIONS } from '../../constants';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  retryText?: string;
  showIcon?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  retryText = 'Try Again',
  showIcon = true,
}) => {
  return (
    <View style={styles.container}>
      {showIcon && (
        <Icon 
          name="alert-circle-outline" 
          size={DIMENSIONS.iconXl} 
          color={COLORS.error} 
          style={styles.icon}
        />
      )}
      
      <Text style={styles.message}>{message}</Text>
      
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  icon: {
    marginBottom: SPACING.base,
  },
  message: {
    fontSize: FONT_SIZES.base,
    color: COLORS.error,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.base,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
  },
  retryText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});