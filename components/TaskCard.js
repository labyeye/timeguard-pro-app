// components/TaskCard.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const TaskCard = ({ task, onPress, onToggleComplete }) => {
  const { theme } = useContext(ThemeContext);
  
  // Priority colors
  const priorityColors = {
    low: '#50E3A4',
    medium: '#FFD700',
    high: '#FF6B6B'
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric' 
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.card, 
        { 
          backgroundColor: theme.cardBackground,
          borderLeftColor: priorityColors[task.priority || 'medium'],
          shadowColor: theme.shadowColor,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <TouchableOpacity 
          style={[
            styles.checkbox, 
            { 
              borderColor: theme.borderColor,
              backgroundColor: task.completed ? priorityColors[task.priority || 'medium'] : 'transparent' 
            }
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
        >
          {task.completed && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.taskInfo}>
          <Text 
            style={[
              styles.title, 
              { 
                color: theme.textColor,
                textDecorationLine: task.completed ? 'line-through' : 'none',
                opacity: task.completed ? 0.7 : 1
              }
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>
          
          {task.dueDate && (
            <Text 
              style={[
                styles.date, 
                { 
                  color: task.completed ? theme.textColor : 
                         new Date(task.dueDate) < new Date() ? priorityColors.high : theme.textColor,
                  opacity: task.completed ? 0.7 : 0.9
                }
              ]}
            >
              Due: {formatDate(task.dueDate)}
            </Text>
          )}
        </View>
      </View>
      
      {task.reminder && (
        <View style={styles.reminderBadge}>
          <Text style={styles.reminderText}>⏰</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 13,
  },
  reminderBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  reminderText: {
    fontSize: 14,
  },
});

export default TaskCard;