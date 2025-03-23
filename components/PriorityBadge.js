import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const PriorityBadge = ({ priority }) => {
  const { theme } = useContext(ThemeContext);
  
  const getPriorityColor = () => {
    switch (priority) {
      case 'high':
        return theme.error;
      case 'medium':
        return theme.warning;
      case 'low':
        return theme.success;
      case 'overdue':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };
  
  const getPriorityLabel = () => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      case 'overdue':
        return 'Overdue';
      default:
        return 'Normal';
    }
  };

  const badgeColor = getPriorityColor();
  const badgeLabel = getPriorityLabel();
  
  return (
    <View style={[styles.badge, { backgroundColor: badgeColor }]}>
      <Text style={styles.badgeText}>{badgeLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default PriorityBadge;