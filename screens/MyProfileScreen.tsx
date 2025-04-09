import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

const MyProfileScreen = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        console.log('Loading profile image...');
        
        // First try to get the username
        const username = await EncryptedStorage.getItem('username');
        console.log('Username from storage:', username);
        
        if (username) {
          // Try to get the username-specific profile image
          const userSpecificImage = await AsyncStorage.getItem(`profileImage_${username}`);
          console.log('User specific image:', userSpecificImage);
          
          if (userSpecificImage) {
            console.log('Setting user specific image');
            setProfileImage(userSpecificImage);
            return;
          }
        }
        
        // If no username-specific image, try the generic one
        const genericImage = await AsyncStorage.getItem('profileImage');
        console.log('Generic image:', genericImage);
        
        if (genericImage) {
          console.log('Setting generic image');
          setProfileImage(genericImage);
        }
        
        // Finally, try to get from encrypted storage
        const userProfileString = await EncryptedStorage.getItem('userProfile');
        if (userProfileString) {
          const userProfile = JSON.parse(userProfileString);
          console.log('Profile image from encrypted storage:', userProfile.profileImage);
          if (userProfile.profileImage) {
            console.log('Setting image from encrypted storage');
            setProfileImage(userProfile.profileImage);
          }
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    loadProfileImage();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {profileImage ? (
          <Image
            source={{ uri: profileImage }}
            style={styles.profileImage}
            onError={(e) => console.error('Error loading image:', e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Choose Image</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 0,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'navy',
  },
  placeholderContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: 'navy',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    color: 'navy',
    fontSize: 16,
  },
});

export default MyProfileScreen;

 