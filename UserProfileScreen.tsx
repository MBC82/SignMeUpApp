import React, { useState } from 'react';
import { Alert, Button } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

const UserProfileScreen = () => {
  const [profileImage, setProfileImage] = useState('');

  const pickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false, // Don't include base64 to reduce memory usage
      });
      
      if (result.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      
      if (result.errorCode) {
        throw new Error(`Image picker error: ${result.errorMessage}`);
      }
      
      if (result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        console.log('Selected image URI:', selectedImage);
        
        try {
          // Update the profile image in state first
          updateProfile({ profileImage: selectedImage });
          
          // Get the username
          const username = await EncryptedStorage.getItem('username');
          if (username) {
            // Cast username to string to satisfy TypeScript type check
            await AsyncStorage.setItem(`profileImage_${username as string}`, selectedImage);
            
            // Also save to general profileImage for the bottom nav
            await AsyncStorage.setItem('profileImage', selectedImage);
            
            console.log('Successfully saved profile image to AsyncStorage');
          } else {
            console.warn('Username is undefined, cannot save profile image');
          }
          
          // Also update the profile in the encrypted storage
          const userProfileString = await EncryptedStorage.getItem('userProfile');
          if (userProfileString) {
            const userProfile = JSON.parse(userProfileString);
            userProfile.profileImage = selectedImage;
            await EncryptedStorage.setItem('userProfile', JSON.stringify(userProfile));
          }
        } catch (storageError) {
          console.error('Error saving profile image:', storageError);
          // Still keep the image in the UI even if storage fails
          Alert.alert(
            'Warning',
            'Your profile image has been set, but might not persist after restarting the app.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  return (
    <Button title="Pick Image" onPress={pickImage} />
  );
};

export default UserProfileScreen; 