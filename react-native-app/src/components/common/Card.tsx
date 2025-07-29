import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: keyof typeof SPACING;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  padding = 'lg',
}) => {
  const cardStyle = [
    styles.card,
    { padding: SPACING[padding] },
    style,
  ];

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});