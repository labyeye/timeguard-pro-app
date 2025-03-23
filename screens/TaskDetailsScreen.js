import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ThemeContext } from '../context/ThemeContext';
import { TaskContext } from '../context/TaskContext';
import PriorityBadge from '../components/PriorityBadge';
import PrioritySelector from '../components/PrioritySelector.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// New color scheme to match HomeScreen
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
  overdue: '#E57373',    // Same as danger for overdue
  border: 'rgba(0,0,0,0.05)' // Light border
};

const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { theme } = useContext(ThemeContext);
  const { tasks, updateTask, deleteTask, toggleTaskCompleted } = useContext(TaskContext);
  const insets = useSafeAreaInsets();
  
  const [task, setTask] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [reminder, setReminder] = useState(true);
  const [customPriority, setCustomPriority] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const foundTask = tasks.find(t => t.id === taskId);
    if (foundTask) {
      setTask(foundTask);
      setTitle(foundTask.title);
      setDescription(foundTask.description || '');
      setDueDate(foundTask.dueDate ? new Date(foundTask.dueDate) : null);
      setReminder(foundTask.reminder !== false); // Default to true if not set
      setCustomPriority(foundTask.customPriority || null);
    } else {
      Alert.alert("Error", "Task not found");
      navigation.goBack();
    }
  }, [taskId, tasks]);

  const handleDeleteTask = () => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            deleteTask(taskId);
            navigation.goBack();
          } 
        }
      ]
    );
  };

  const handleToggleComplete = () => {
    toggleTaskCompleted(taskId);
  };

  const handleSaveChanges = () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a task title');
      return;
    }

    const updatedTask = {
      ...task,
      title,
      description,
      dueDate,
      reminder,
      customPriority,
      updatedAt: new Date(),
    };

    updateTask(updatedTask);
    setIsEditing(false);
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date) => {
    setDueDate(date);
    hideDatePicker();
  };

  const formatDate = (date) => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateRelative = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return formatDate(date);
  };

  const getPriorityLevel = (dueDateString) => {
    if (!dueDateString) return task?.customPriority || 'low';
    
    // If custom priority is set, use that
    if (task?.customPriority) return task.customPriority;
    
    // Otherwise calculate based on due date
    const today = new Date();
    const due = new Date(dueDateString);
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

  if (!task) {
    return null; // Loading state
  }

  const priorityLevel = getPriorityLevel(task.dueDate);
  const priorityColor = getPriorityColor(priorityLevel);

  return (
    <View style={[styles.container, { backgroundColor: COLORS.background, paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: COLORS.background }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: COLORS.accent }]} 
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={22} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: COLORS.text }]}>Task Details</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isEditing ? (
          // Edit Mode
          <>
            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: COLORS.textLight }]}>TITLE</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: COLORS.text,
                    backgroundColor: COLORS.card,
                    borderColor: COLORS.border,
                  },
                ]}
                placeholder="Task title"
                placeholderTextColor={COLORS.textLight}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: COLORS.textLight }]}>DESCRIPTION (OPTIONAL)</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    color: COLORS.text,
                    backgroundColor: COLORS.card,
                    borderColor: COLORS.border,
                  },
                ]}
                placeholder="Add details about your task"
                placeholderTextColor={COLORS.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: COLORS.textLight }]}>DUE DATE & TIME</Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  {
                    backgroundColor: COLORS.card,
                    borderColor: COLORS.border,
                  },
                ]}
                onPress={showDatePicker}
              >
                <Icon
                  name="calendar-outline"
                  size={20}
                  color={COLORS.primary}
                  style={styles.dateIcon}
                />
                <Text style={[styles.dateText, { color: dueDate ? COLORS.text : COLORS.textLight }]}>
                  {dueDate ? formatDate(dueDate) : 'Select date and time'}
                </Text>
                {dueDate && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={() => setDueDate(null)}
                  >
                    <Icon name="close-circle" size={18} color={COLORS.textLight} />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: COLORS.textLight }]}>PRIORITY</Text>
              <View style={styles.priorityContainer}>
                {['low', 'medium', 'high'].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.priorityButton,
                      {
                        backgroundColor: customPriority === priority ? 
                          getPriorityColor(priority) : COLORS.accent,
                        borderColor: customPriority === priority ? 
                          'transparent' : COLORS.border,
                      },
                    ]}
                    onPress={() => setCustomPriority(priority)}
                  >
                    <Text 
                      style={[
                        styles.priorityButtonText, 
                        { 
                          color: customPriority === priority ? 
                            'white' : COLORS.text,
                          fontWeight: customPriority === priority ? 
                            'bold' : 'normal',
                        }
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.autoButton, { borderColor: COLORS.border }]}
                onPress={() => setCustomPriority(null)}
              >
                <Text style={[styles.autoButtonText, { color: customPriority === null ? COLORS.primary : COLORS.textLight }]}>
                  Auto (Based on due date)
                </Text>
                {customPriority === null && (
                  <Icon name="checkmark" size={16} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: COLORS.text }]}>Set Reminder</Text>
                <Switch
                  trackColor={{ false: COLORS.accent, true: COLORS.primary }}
                  thumbColor={'white'}
                  ios_backgroundColor={COLORS.accent}
                  onValueChange={setReminder}
                  value={reminder}
                />
              </View>
              {reminder && (
                <Text style={[styles.helpText, { color: COLORS.textLight }]}>
                  You'll be notified before the deadline
                </Text>
              )}
            </View>
          </>
        ) : (
          // View Mode
          <>
            <View style={[
              styles.taskCard, 
              { 
                backgroundColor: task.completed ? COLORS.accent : COLORS.card,
                borderLeftColor: task.completed ? COLORS.completed : priorityColor,
              }
            ]}>
              <View style={styles.taskHeader}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.taskTitle, { color: COLORS.text }]}>{task.title}</Text>
                </View>

                {task.completed ? (
                  <View style={[styles.completedBadge, { backgroundColor: COLORS.completed }]}>
                    <Text style={styles.completedText}>Completed</Text>
                  </View>
                ) : (
                  <View style={styles.statusContainer}>
                    <View 
                      style={[
                        styles.priorityBadge, 
                        { backgroundColor: priorityColor }
                      ]}
                    >
                      <Text style={styles.priorityText}>
                        {priorityLevel.charAt(0).toUpperCase() + priorityLevel.slice(1)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.completeButton, { backgroundColor: COLORS.accent }]}
                      onPress={handleToggleComplete}
                    >
                      <Icon name="checkmark" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {task.description ? (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: COLORS.textLight }]}>DESCRIPTION</Text>
                  <Text style={[styles.description, { color: COLORS.text }]}>{task.description}</Text>
                </View>
              ) : null}

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: COLORS.textLight }]}>DUE DATE</Text>
                <View style={styles.dateContainer}>
                  <Icon 
                    name="calendar-outline" 
                    size={20} 
                    color={COLORS.primary} 
                    style={styles.icon} 
                  />
                  <View>
                    <Text style={[styles.dateText, { color: COLORS.text }]}>
                      {formatDate(task.dueDate)}
                    </Text>
                    {task.dueDate && !task.completed && (
                      <Text 
                        style={[
                          styles.relativeDate, 
                          { 
                            color: 
                              getPriorityLevel(task.dueDate) === 'overdue' 
                                ? COLORS.overdue 
                                : COLORS.textLight 
                          }
                        ]}
                      >
                        {formatDateRelative(task.dueDate)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: COLORS.textLight }]}>REMINDERS</Text>
                <View style={styles.reminderContainer}>
                  <Icon 
                    name={task.reminder ? "notifications-outline" : "notifications-off-outline"} 
                    size={20} 
                    color={task.reminder ? COLORS.primary : COLORS.textLight} 
                    style={styles.icon} 
                  />
                  <Text style={[styles.reminderText, { color: COLORS.text }]}>
                    {task.reminder ? "Reminders enabled" : "No reminders set"}
                  </Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: COLORS.textLight }]}>CREATED</Text>
                <Text style={[styles.metaText, { color: COLORS.textLight }]}>
                  {new Date(task.createdAt).toLocaleString()}
                </Text>
                {task.updatedAt && (
                  <>
                    <Text style={[styles.sectionTitle, { color: COLORS.textLight, marginTop: 10 }]}>LAST UPDATED</Text>
                    <Text style={[styles.metaText, { color: COLORS.textLight }]}>
                      {new Date(task.updatedAt).toLocaleString()}
                    </Text>
                  </>
                )}
                {task.completed && task.completedAt && (
                  <>
                    <Text style={[styles.sectionTitle, { color: COLORS.textLight, marginTop: 10 }]}>COMPLETED</Text>
                    <Text style={[styles.metaText, { color: COLORS.textLight }]}>
                      {new Date(task.completedAt).toLocaleString()}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
        date={dueDate || new Date()}
        themeVariant={'light'}
      />

      <View style={[styles.footer, { backgroundColor: COLORS.background, borderTopColor: COLORS.border }]}>
        {isEditing ? (
          <>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: COLORS.border, backgroundColor: COLORS.accent }]}
              onPress={() => {
                // Reset form values to original task values
                setTitle(task.title);
                setDescription(task.description || '');
                setDueDate(task.dueDate ? new Date(task.dueDate) : null);
                setReminder(task.reminder !== false);
                setCustomPriority(task.customPriority || null);
                setIsEditing(false);
              }}
            >
              <Text style={[styles.cancelButtonText, { color: COLORS.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: COLORS.primary }]}
              onPress={handleSaveChanges}
              disabled={!title.trim()}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: COLORS.danger }]}
              onPress={handleDeleteTask}
            >
              <Icon name="trash-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: COLORS.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit Task</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spacer: {
    width: 40,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  taskCard: {
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 5,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
    marginRight: 10,
  },
  statusContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 10,
  },
  taskTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  priorityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
  },
  relativeDate: {
    fontSize: 14,
    marginTop: 4,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderText: {
    fontSize: 16,
  },
  metaText: {
    fontSize: 14,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  textArea: {
    minHeight: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  dateIcon: {
    marginRight: 10,
  },
  clearButton: {
    padding: 4,
    marginLeft: 'auto',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginHorizontal: 4,
  },
  priorityButtonText: {
    fontWeight: '500',
  },
  autoButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  autoButtonText: {
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  editButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TaskDetailsScreen;