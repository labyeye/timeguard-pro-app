import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import PushNotification from 'react-native-push-notification';
import SiriShortcuts from 'react-native-siri-shortcut';
import { useNavigation } from '@react-navigation/native';

// Screens
import HomeScreen from './screens/HomeScreen';
import AddTaskScreen from './screens/AddTaskScreen';
import TaskDetailsScreen from './screens/TaskDetailsScreen';
import SiriShortcutHandler from './SiriShortcutHandler';
// Context
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider, TaskContext } from './context/TaskContext';

const Stack = createStackNavigator();

// Configure notifications for React Native
const configurePushNotifications = () => {
  // ... (your existing configuration)
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
            {/* Add SiriShortcutHandler */}
            <SiriShortcutHandler />
            
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
                options={{ headerShown: false }}
              />
              <Stack.Screen 
                name="TaskDetails" 
                component={TaskDetailsScreen} 
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </TaskProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}