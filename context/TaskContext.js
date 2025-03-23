// context/TaskContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

// Create the context
export const TaskContext = createContext();

// Create the provider
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tasks from storage
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const savedTasks = await AsyncStorage.getItem('tasks');
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks));
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Save tasks to storage whenever they change
  useEffect(() => {
    const saveTasks = async () => {
      try {
        if (!isLoading) {
          await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        }
      } catch (error) {
        console.error('Failed to save tasks:', error);
      }
    };

    saveTasks();
  }, [tasks, isLoading]);

  // Schedule notification for a task
  const scheduleNotification = (task) => {
    if (!task.reminder || !task.reminderDate) return;

    const scheduledTime = new Date(task.reminderDate).getTime();
    const now = new Date().getTime();

    // Only schedule if the reminder time is in the future
    if (scheduledTime > now) {
      PushNotification.localNotificationSchedule({
        id: task.id.toString(),
        channelId: 'default',
        title: 'Task Reminder',
        message: task.title,
        date: new Date(scheduledTime),
        allowWhileIdle: true,
        playSound: true,
        soundName: 'default',
      });
    }
  };

  // Cancel notification for a task
  const cancelNotification = (taskId) => {
    PushNotification.cancelLocalNotification(taskId.toString());
  };

  // Add a new task
  const addTask = (newTask) => {
    // Generate a unique ID
    const id = Date.now().toString();
    const taskWithId = { ...newTask, id, createdAt: new Date().toISOString() };
    
    setTasks((prevTasks) => [...prevTasks, taskWithId]);
    
    // Schedule reminder notification if set
    if (newTask.reminder && newTask.reminderDate) {
      scheduleNotification(taskWithId);
    }
    
    return taskWithId;
  };

  // Update an existing task
  const updateTask = (updatedTask) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => 
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    
    // Cancel any existing reminder
    cancelNotification(updatedTask.id);
    
    // Schedule new reminder if set
    if (updatedTask.reminder && updatedTask.reminderDate) {
      scheduleNotification(updatedTask);
    }
  };

  // Delete a task
  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    
    // Cancel any scheduled notification
    cancelNotification(taskId);
  };

  // Toggle task completion
  const toggleTaskCompleted = (taskId) => {
    setTasks((prevTasks) => 
      prevTasks.map((task) => 
        task.id === taskId 
          ? { ...task, completed: !task.completed, completedAt: !task.completed ? new Date().toISOString() : null } 
          : task
      )
    );
  };

  // Get a task by ID
  const getTaskById = (taskId) => {
    return tasks.find((task) => task.id === taskId);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      isLoading,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskCompleted,
      getTaskById
    }}>
      {children}
    </TaskContext.Provider>
  );
};