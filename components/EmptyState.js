// components/EmptyState.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const EmptyState = ({ message, subMessage }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={styles.container}>
      <View style={[styles.illustrationContainer, { backgroundColor: theme.cardBackground }]}>
        <Text style={styles.emoji}>📝</Text>
      </View>
      <Text style={[styles.message, { color: theme.textColor }]}>
        {message || 'No tasks yet'}
      </Text>
      {subMessage && (
        <Text style={[styles.subMessage, { color: theme.textColor, opacity: 0.7 }]}>
          {subMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
  },
  message: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  subMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  }
});

export default EmptyState;