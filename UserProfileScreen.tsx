import React, { useState } from 'react';
import { Alert, Button } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

const UserProfileScreen = () => {
  const [profileImage, setProfileImage] = useState('');

  const pickImage = async () => {
    try {
      // Launch the image library
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 300,
        maxWidth: 300,
      });
      
      // Check if user cancelled
      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      
      // Check for errors
      if (result.errorCode) {
        console.log('Image picker error: ', result.errorMessage);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
        return;
      }
      
      // Get username from storage
      try {
        const storedUsername = await EncryptedStorage.getItem('username');
        console.log('Retrieved username for image save:', storedUsername);
        
        if (!storedUsername) {
          console.log('No username found for image save');
          Alert.alert('Error', 'Could not identify user. Please try again later.');
          return;
        }
        
        // Get image URI
        const selectedImageUri = result.assets && result.assets[0] && result.assets[0].uri;
        if (!selectedImageUri) {
          console.log('No image URI found in picker result');
          return;
        }
        
        console.log('Selected image URI:', selectedImageUri);
        
        // Update profile image in context for immediate UI feedback
        updateProfile({ profileImage: selectedImageUri });
        setProfileImage(selectedImageUri);
        
        // Save image to AsyncStorage for persistence across logins
        await AsyncStorage.setItem(`profileImage_${storedUsername}`, selectedImageUri);
        console.log('Saved profile image to AsyncStorage with key:', `profileImage_${storedUsername}`);
        
        // Update user's profile in allUsers array
        const allUsersString = await AsyncStorage.getItem('allUsers');
        if (allUsersString) {
          const allUsers = JSON.parse(allUsersString);
          
          // Find and update user in allUsers array
          const updatedUsers = allUsers.map(user => {
            if (user.username === storedUsername) {
              console.log('Updating user profile image in allUsers array');
              return {
                ...user,
                profileImage: selectedImageUri
              };
            }
            return user;
          });
          
          // Save updated allUsers back to AsyncStorage
          await AsyncStorage.setItem('allUsers', JSON.stringify(updatedUsers));
          console.log('Updated profile image in allUsers array');
          
          // Also update the user profile in EncryptedStorage
          const userProfile = updatedUsers.find(user => user.username === storedUsername);
          if (userProfile) {
            await EncryptedStorage.setItem('userProfile', JSON.stringify(userProfile));
            console.log('Updated profile image in EncryptedStorage userProfile');
          }
        }
        
        Alert.alert('Success', 'Profile image updated successfully');
      } catch (error) {
        console.error('Error saving profile image:', error);
        Alert.alert('Error', 'Failed to save profile image. Please try again.');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  return (
    <Button title="Pick Image" onPress={pickImage} />
  );
};

export default UserProfileScreen; 