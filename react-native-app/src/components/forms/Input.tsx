import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, DIMENSIONS } from '../../constants';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  isPassword?: boolean;
  icon?: string;
  required?: boolean;
  style?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  icon,
  required = false,
  style,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputStyle = [
    styles.input,
    isFocused && styles.inputFocused,
    error && styles.inputError,
    icon && styles.inputWithIcon,
    style,
  ];

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}
      
      <View style={styles.inputContainer}>
        {icon && (
          <Icon 
            name={icon} 
            size={DIMENSIONS.iconBase} 
            color={isFocused ? COLORS.primary : COLORS.textTertiary}
            style={styles.icon}
          />
        )}
        
        <TextInput
          {...props}
          style={inputStyle}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={isPassword && !isPasswordVisible}
          placeholderTextColor={COLORS.textTertiary}
        />
        
        {isPassword && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={togglePasswordVisibility}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={DIMENSIONS.iconBase}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    minHeight: DIMENSIONS.inputHeight,
  },
  inputWithIcon: {
    paddingLeft: SPACING['2xl'] + SPACING.sm,
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  icon: {
    position: 'absolute',
    left: SPACING.base,
    zIndex: 1,
  },
  passwordToggle: {
    position: 'absolute',
    right: SPACING.base,
    padding: SPACING.xs,
  },
  error: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
});