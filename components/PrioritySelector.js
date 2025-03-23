
// components/PrioritySelector.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const PrioritySelector = ({ selectedPriority, onPriorityChange }) => {
  const { theme } = useContext(ThemeContext);
  
  const priorities = [
    { id: 'low', label: 'Low', color: '#50E3A4' },
    { id: 'medium', label: 'Medium', color: '#FFD700' },
    { id: 'high', label: 'High', color: '#FF6B6B' }
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.textColor }]}>Priority</Text>
      <View style={styles.priorityContainer}>
        {priorities.map((priority) => (
          <TouchableOpacity
            key={priority.id}
            style={[
              styles.priorityButton,
              { 
                backgroundColor: selectedPriority === priority.id 
                  ? priority.color 
                  : theme.cardBackground,
                borderColor: priority.color,
              }
            ]}
            onPress={() => onPriorityChange(priority.id)}
          >
            <Text
              style={[
                styles.priorityText,
                { 
                  color: selectedPriority === priority.id 
                    ? '#FFF' 
                    : theme.textColor 
                }
              ]}
            >
              {priority.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  priorityText: {
    fontWeight: '600',
  },
});

export default PrioritySelector;