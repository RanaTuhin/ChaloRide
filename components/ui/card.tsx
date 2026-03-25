import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export function Card({ style, ...props }: ViewProps) {
  const bg = useThemeColor({ light: '#FFFFFF', dark: '#1C1E20' }, 'background');
  const border = useThemeColor({ light: '#E5E7EB', dark: '#2A2D30' }, 'icon');
  return <View style={[styles.card, { backgroundColor: bg, borderColor: border }, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
});

