import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type StatBoxProps = {
  title: string;
  value: number;
};

const StatBox = ({ title, value }: StatBoxProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '30%',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  title: {
    fontSize: 11,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default StatBox; 