import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ThemeContext } from '../context/ThemeContext';
import { TaskContext } from '../context/TaskContext';
import PrioritySelector from '../components/PrioritySelector.js';

// New color scheme
const COLORS = {
  background: '#FDFAF6',  // Light cream background
  card: '#FAF1E6',        // Warm cream for cards
  accent: '#E4EFE7',      // Soft mint for highlights
  primary: '#99BC85',     // Sage green for primary actions
  text: '#384B42',        // Dark green for text
  textLight: '#666666',   // Light text
  border: '#E4EFE7',      // Border color (using accent)
  inputBg: '#FFFFFF',     // White background for inputs
  danger: '#E57373',      // Softer red for delete
  placeholderText: '#999999', // Placeholder text color
};

const AddTaskScreen = ({ navigation }) => {
  const { theme } = useContext(ThemeContext);
  const { addTask } = useContext(TaskContext);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [reminder, setReminder] = useState(true);
  const [customPriority, setCustomPriority] = useState(null); // null means auto priority
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const handlePriorityChange = (priority) => {
    setCustomPriority(priority);
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

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Missing Information', 'Please enter a task title');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      dueDate,
      reminder,
      customPriority,
      completed: false,
      createdAt: new Date(),
    };

    addTask(newTask);
    navigation.goBack();
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { backgroundColor: COLORS.background }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Task</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView
        style={[styles.container, { backgroundColor: COLORS.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formGroup}>
          <Text style={styles.label}>TITLE</Text>
          <TextInput
            style={[styles.input, styles.inputTitle]}
            placeholder="What do you need to do?"
            placeholderTextColor={COLORS.placeholderText}
            value={title}
            onChangeText={setTitle}
            autoFocus
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>DESCRIPTION (OPTIONAL)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add details about your task"
            placeholderTextColor={COLORS.placeholderText}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>DUE DATE & TIME</Text>
          <TouchableOpacity
            style={[styles.dateButton, dueDate ? styles.dateButtonActive : {}]}
            onPress={showDatePicker}
          >
            <Icon
              name="calendar-outline"
              size={20}
              color={COLORS.primary}
              style={styles.dateIcon}
            />
            <Text 
              style={[
                styles.dateText, 
                { color: dueDate ? COLORS.text : COLORS.placeholderText }
              ]}
            >
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
          <Text style={styles.label}>PRIORITY</Text>
          <PrioritySelector
            selectedPriority={customPriority}
            onPriorityChange={handlePriorityChange}
            
            theme={{
              ...theme,
              accent: COLORS.primary,
              accentLight: COLORS.accent,
              text: COLORS.text,
              cardBackground: COLORS.card,
              border: COLORS.border,
              textSecondary: COLORS.textLight
            }}
          />
          {!customPriority && (
            <Text style={styles.helpText}>
              Auto priority will be set based on due date
            </Text>
          )}
        </View>

        <View style={styles.formGroup}>
          <View style={styles.switchRow}>
            <View style={styles.switchLabelContainer}>
              <Icon name="notifications-outline" size={20} color={COLORS.primary} style={styles.switchIcon} />
              <Text style={styles.switchLabel}>Set Reminder</Text>
            </View>
            <Switch
              trackColor={{ false: '#E0E0E0', true: COLORS.accent }}
              thumbColor={reminder ? COLORS.primary : '#BDBDBD'}
              ios_backgroundColor="#E0E0E0"
              onValueChange={setReminder}
              value={reminder}
            />
          </View>
          {reminder && (
            <Text style={styles.helpText}>
              You'll be notified before the deadline
            </Text>
          )}
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="datetime"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
          minimumDate={new Date()}
          date={dueDate || new Date()}
          themeVariant={theme.isDark ? 'dark' : 'light'}
        />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton, 
            { backgroundColor: title.trim() ? COLORS.primary : '#CCDDCC' }
          ]}
          onPress={handleSubmit}
          disabled={!title.trim()}
        >
          <Text style={styles.submitButtonText}>Save Task</Text>
          <Icon name="checkmark-circle-outline" size={20} color="white" style={styles.submitIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  contentContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputTitle: {
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
    lineHeight: 22,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    borderColor: COLORS.border,
    backgroundColor: COLORS.inputBg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateButtonActive: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    backgroundColor: COLORS.card,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
    flex: 1,
  },
  clearButton: {
    padding: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchIcon: {
    marginRight: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  helpText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: COLORS.textLight,
    marginTop: 6,
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: COLORS.background,
  },
  cancelButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
    backgroundColor: COLORS.accent,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitIcon: {
    marginLeft: 8,
  },
});

export default AddTaskScreen;