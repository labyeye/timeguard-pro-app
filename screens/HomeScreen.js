import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SwipeListView } from 'react-native-swipe-list-view';
import { ThemeContext } from '../context/ThemeContext';
import { TaskContext } from '../context/TaskContext';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import SegmentedControl from '../components/SegmentedControl';

// New color scheme
const COLORS = {
  background: '#FDFAF6', // Light cream background
  card: '#FAF1E6',       // Warm cream for cards
  accent: '#E4EFE7',     // Soft mint for highlights
  primary: '#99BC85',    // Sage green for primary actions
  text: '#384B42',       // Dark green for text
  textLight: '#666666',  // Light text
  danger: '#E57373',     // Softer red for delete
  completed: '#99BC85',  // Same as primary for completed tasks
  high: '#E78F64',       // Soft orange for high priority
  medium: '#F2C57C',     // Warm yellow for medium priority
  low: '#A1C6EA',        // Soft blue for low priority
  overdue: '#E57373'     // Same as danger for overdue
};

const AnimatedStatusBar = Animated.createAnimatedComponent(StatusBar);

const HomeScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { tasks, deleteTask, toggleTaskCompleted } = useContext(TaskContext);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const insets = useSafeAreaInsets();
  const [scrollY] = useState(new Animated.Value(0));

  // Animation values
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.95],
    extrapolate: 'clamp',
  });

  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [130, 90],
    extrapolate: 'clamp',
  });

  // Fetch tasks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Since we don't have fetchTasks anymore (it's handled by the TaskContext)
      // we'll just simulate a refresh completion
      setRefreshing(false);
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate task fetching (TaskContext already handles it via AsyncStorage)
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const getPriorityLevel = (task) => {
    if (task.priority) return task.priority; // Use manually set priority if available
  
    // Otherwise, fall back to due date calculation
    if (!task.dueDate) return 'low';
    
    const today = new Date();
    const due = new Date(task.dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'overdue';
    if (diffDays <= 2) return 'high';
    if (diffDays <= 5) return 'medium';
    return 'low';
  };
  

  const getPriorityColor = (priorityLevel) => {
    switch (priorityLevel) {
      case 'overdue': return COLORS.overdue;
      case 'high': return COLORS.high;
      case 'medium': return COLORS.medium;
      case 'low': return COLORS.low;
      default: return COLORS.low;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'active') return !task.completed;
    if (filter === 'high') return !task.completed && getPriorityLevel(task.dueDate) === 'high';
    if (filter === 'medium') return !task.completed && getPriorityLevel(task.dueDate) === 'medium';
    return true;
  }).sort((a, b) => {
    // Sort by priority first (non-completed tasks)
    if (!a.completed && !b.completed) {
      const priorityOrder = { overdue: 0, high: 1, medium: 2, low: 3 };
      const aPriority = getPriorityLevel(a.dueDate);
      const bPriority = getPriorityLevel(b.dueDate);
      
      if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      }
      
      // If same priority, sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
    }
    
    // Completed tasks go to the bottom
    if (a.completed && !b.completed) return 1;
    if (!a.completed && b.completed) return -1;
    
    // Sort completed tasks by completion date (most recent first)
    if (a.completed && b.completed) {
      return new Date(b.completedAt || 0) - new Date(a.completedAt || 0);
    }
    
    return 0;
  });

  const handleDeleteTask = (id) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteTask(id) }
      ]
    );
  };

  const renderHiddenItem = ({ item }) => (
    <View style={[styles.rowBack, { backgroundColor: COLORS.background }]}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => handleDeleteTask(item.id)}
      >
        <Icon name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const segments = [
    { label: 'All', value: 'all' },
    { label: 'High', value: 'high' },
    { label: 'Active', value: 'active' },
    { label: 'Done', value: 'completed' },
  ];

  const renderTaskCard = ({ item }) => {
    const priorityLevel = getPriorityLevel(item.dueDate);
    const priorityColor = getPriorityColor(priorityLevel);
    
    return (
      <View style={styles.taskCardContainer}>
        <TouchableOpacity
          style={[
            styles.taskCard,
            { 
              backgroundColor: item.completed ? COLORS.accent : COLORS.card,
              borderLeftColor: item.completed ? COLORS.completed : priorityColor,
            }
          ]}
          onPress={() => navigation.navigate('TaskDetails', { taskId: item.id })}
          activeOpacity={0.7}
        >
          <View style={styles.taskHeader}>
            <TouchableOpacity
              style={[
                styles.checkbox,
                {
                  backgroundColor: item.completed ? COLORS.completed : 'transparent',
                  borderColor: item.completed ? COLORS.completed : priorityColor,
                }
              ]}
              onPress={() => toggleTaskCompleted(item.id)}
            >
              {item.completed && (
                <Icon name="checkmark" size={16} color="white" />
              )}
            </TouchableOpacity>
            
            <Text 
              style={[
                styles.taskTitle, 
                { 
                  color: COLORS.text,
                  textDecorationLine: item.completed ? 'line-through' : 'none',
                  opacity: item.completed ? 0.7 : 1
                }
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
          </View>
          
          <View style={styles.taskDetails}>
            {item.dueDate && (
              <View style={styles.dueDateContainer}>
                <Icon 
                  name="calendar-outline" 
                  size={14} 
                  color={item.completed ? COLORS.textLight : priorityColor} 
                />
                <Text 
                  style={[
                    styles.dueDate, 
                    { 
                      color: item.completed ? COLORS.textLight : priorityColor,
                      fontWeight: priorityLevel === 'overdue' || priorityLevel === 'high' ? 'bold' : 'normal'
                    }
                  ]}
                >
                  {new Date(item.dueDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            {!item.completed && priorityLevel !== 'low' && (
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                <Text style={styles.priorityText}>
                  {priorityLevel === 'overdue' ? 'Overdue' : priorityLevel === 'high' ? 'High' : 'Medium'}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background, paddingTop: insets.top }]}>
      <AnimatedStatusBar 
        animated={true}
        backgroundColor={COLORS.background}
        barStyle="dark-content"
      />
      
      <Animated.View style={[
        styles.header, 
        { 
          height: headerHeight,
          opacity: headerOpacity,
          backgroundColor: COLORS.background
        }
      ]}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: COLORS.text }]}>TimeGuard</Text>
            <Text style={[styles.titleAccent, { color: COLORS.primary }]}>Pro</Text>
          </View>
          
        </View>
        
        <SegmentedControl
          options={segments.map(seg => seg.label)}
          selectedIndex={segments.findIndex(seg => seg.value === filter)}
          onChange={(index) => setFilter(segments[index].value)}
          primaryColor={COLORS.primary}
          backgroundColor={COLORS.accent}
          textColor={COLORS.text}
        />
      </Animated.View>

      {tasks.length === 0 ? (
        <EmptyState 
          message="No tasks yet. Tap the + button to add your first task!" 
          color={COLORS.textLight}
          iconColor={COLORS.primary}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState 
          message={`No ${filter} tasks found.`} 
          color={COLORS.textLight}
          iconColor={COLORS.primary}
        />
      ) : (
        <SwipeListView
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskCard}
          renderHiddenItem={renderHiddenItem}
          rightOpenValue={-75}
          previewRowKey={'0'}
          previewOpenValue={-40}
          previewOpenDelay={3000}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: COLORS.primary }]}
        onPress={() => navigation.navigate('AddTask')}
        activeOpacity={0.8}
      >
        <Icon name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 15,
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginRight: 3,
  },
  titleAccent: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsButton: {
    padding: 10,
    borderRadius: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 100,
  },
  taskCardContainer: {
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskCard: {
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 5,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 34, // Aligned with text after checkbox
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 14,
    marginLeft: 5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  rowBack: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    margin: 0,
    marginBottom: 12,
    borderRadius: 12,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  backRightBtnRight: {
    backgroundColor: COLORS.danger,
    right: 0,
  },
});

export default HomeScreen;