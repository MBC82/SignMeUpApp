import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

type ToggleOptionProps = {
  label: string;
  value: boolean;
  onToggle: (value: boolean) => void;
};

const ToggleOption = ({ label, value, onToggle }: ToggleOptionProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: 'navy', true: 'navy' }}
        thumbColor={value ? 'white' : '#f4f3f4'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
});

export default ToggleOption; 