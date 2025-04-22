import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import SiriShortcuts from 'react-native-siri-shortcut';

export const SiriShortcutHandler = () => {
  useEffect(() => {
    const setupSiriShortcuts = async () => {
      // Only run on iOS
      if (Platform.OS !== 'ios') return;

      try {
        // Log all available methods
        console.log('Available SiriShortcuts methods:', Object.keys(SiriShortcuts));

        // Perform donation
        const result = await SiriShortcuts.donate({
          activityType: 'com.deadlinetracker.addtask',
          title: 'Add Task in Deadline Tracker',
          suggestedInvocationPhrase: 'Add a task in Deadline Tracker',
          userInfo: {
            taskName: 'Sample Task',
            taskDate: new Date().toISOString()
          }
        });

        // Log donation result
        console.log('Siri Shortcut Donation Result:', result);

        // Set up listener
        const listener = SiriShortcuts.addListener(
          'SiriShortcutListener', 
          (data) => {
            // Debugging alert
            Alert.alert(
              'Siri Shortcut Triggered', 
              JSON.stringify(data, null, 2)
            );
            
            console.log('Siri Shortcut Data:', data);
          }
        );

      } catch (error) {
        // Comprehensive error logging
        console.error('Siri Shortcut Setup Error:', error);
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);

        // Debugging alert
        Alert.alert(
          'Siri Shortcut Error', 
          error.message || 'Failed to set up Siri Shortcut'
        );
      }
    };

    setupSiriShortcuts();
  }, []);

  return null;
};

export default SiriShortcutHandler;