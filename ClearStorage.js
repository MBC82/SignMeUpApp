import React, { useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClearStorage = () => {
  const clearAll = async () => {
    try {
      console.log('Starting to clear AsyncStorage');
      const keys = await AsyncStorage.getAllKeys();
      console.log('Found keys:', keys);
      
      // First clear isLoggedIn status
      await AsyncStorage.setItem('isLoggedIn', 'false');
      console.log('Set isLoggedIn to false');
      
      // Clear username and related keys specifically
      const userKeys = keys.filter(key => 
        key === 'username' || 
        key === 'isLoggedIn' || 
        key.includes('mbc82') || 
        key.includes('profile') ||
        key.includes('ProfileImage')
      );
      
      if (userKeys.length > 0) {
        console.log('Removing user keys:', userKeys);
        await AsyncStorage.multiRemove(userKeys);
      }
      
      Alert.alert('Success', `Cleared ${userKeys.length} stored values. App has been reset.`);
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      Alert.alert('Error', 'Failed to clear storage: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Storage Utility</Text>
      <Text style={styles.description}>
        This utility helps reset your app's storage when you're having login issues.
      </Text>
      <Button 
        title="Clear All User Data" 
        onPress={clearAll}
        color="#dc3545"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529'
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#6c757d'
  }
});

export default ClearStorage; 