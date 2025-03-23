import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AppState, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';

// Screens
import HomeScreen from './screens/HomeScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import TaskDetailsScreen from './screens/TaskDetailsScreen';

// Context
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';

const Stack = createStackNavigator();

// Configure notifications for React Native
const configurePushNotifications = () => {
  // Configure for iOS
  PushNotification.configure({
    onRegister: function (token) {
      console.log("TOKEN:", token);
    },
    onNotification: function (notification) {
      console.log("NOTIFICATION:", notification);
      notification.finish(PushNotificationIOS.FetchResult.NoData);
    },
    permissions: {
      alert: true,
      badge: true,
      sound: true,
    },
    popInitialNotification: true,
    requestPermissions: true,
  });

  // Create a notification channel for Android
  if (Platform.OS === 'android') {
    PushNotification.createChannel(
      {
        channelId: "default",
        channelName: "Default Channel",
        channelDescription: "A default channel for notifications",
        soundName: "default",
        importance: 4,
        vibrate: true,
      },
      (created) => console.log(`Channel created: ${created}`)
    );
  }
};

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Configure notifications
        configurePushNotifications();
        
        // Simulate a brief loading time
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <ThemeProvider>
        <TaskProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={({ route, navigation }) => ({
                headerShown: true,
                headerStyle: {
                  elevation: 0,
                  shadowOpacity: 0,
                },
              })}
            >
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="AddTask" 
                component={AddTaskScreen} 
                options={{ 
                  headerShown:false 
                }}
              />
              <Stack.Screen 
                name="TaskDetails" 
                component={TaskDetailsScreen} 
                options={{ 
                  headerShown:false 

                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </TaskProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}