// components/SegmentedControl.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ThemeContext } from '../context/ThemeContext';

const SegmentedControl = ({ 
  options, 
  selectedIndex, 
  onChange,
  style
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, style, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.segmentedControlWrapper}>
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                isSelected && [
                  styles.selectedOption,
                  { backgroundColor: theme.primaryColor }
                ]
              ]}
              onPress={() => onChange(index)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: theme.textColor, opacity: isSelected ? 1 : 0.7 },
                  isSelected && styles.selectedOptionText
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 4,
  },
  segmentedControlWrapper: {
    flexDirection: 'row',
  },
  option: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  selectedOption: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default SegmentedControl;