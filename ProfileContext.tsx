import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Alert } from 'react-native';
import { safeGetItem, safeSetItem, bypassRemoveItem } from './utils/StorageUtils';

type Profile = {
  name: string;
  username: string;
  email: string;
  phone: string;
  profileImage: string | null;
  memberSince: string;
};

type ProfileContextType = {
  profile: Profile;
  updateProfile: (updatedProfile: Partial<Profile>) => void;
  signOut: (navigation: any) => void;
};

export const ProfileContext = createContext<ProfileContextType>({
  profile: {
    name: '',
    username: '',
    email: '',
    phone: '',
    profileImage: null,
    memberSince: '',
  },
  updateProfile: () => {},
  signOut: () => {},
});

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile>({
    name: '',
    username: '',
    email: '',
    phone: '',
    profileImage: null,
    memberSince: '',
  });

  const loadProfile = async () => {
    try {
      const username = await safeGetItem('username');
      
      if (!username) {
        console.log('No username found, cannot load profile');
        return null;
      }
      
      const allUsersString = await safeGetItem('allUsers');
      const allUsers = allUsersString ? JSON.parse(allUsersString) : [];
      
      const userProfile = allUsers.find((user: any) => user.username === username);
      
      if (userProfile) {
        console.log('Loaded profile for user:', username);
        return userProfile;
      }
      
      console.log('User profile not found for username:', username);
      return null;
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  };

  const updateProfile = async (profile: any) => {
    try {
      const allUsersString = await safeGetItem('allUsers');
      let allUsers = allUsersString ? JSON.parse(allUsersString) : [];
      
      const userIndex = allUsers.findIndex((user: any) => user.username === profile.username);
      
      if (userIndex >= 0) {
        allUsers[userIndex] = { ...allUsers[userIndex], ...profile };
      } else {
        allUsers.push(profile);
      }
      
      await safeSetItem('allUsers', JSON.stringify(allUsers));
      
      console.log('Updated profile for user:', profile.username);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const signOut = async (navigation: any) => {
    try {
      // Get the username before signing out
      const username = await EncryptedStorage.getItem('username');
      
      // Instead of removing items from EncryptedStorage, just set them to empty or null values
      try {
        await EncryptedStorage.setItem('userProfile', JSON.stringify({}));
        await EncryptedStorage.setItem('isLoggedIn', 'false');
      } catch (error) {
        console.warn('Error updating EncryptedStorage:', error);
      }
      
      // Clear AsyncStorage items - but DON'T clear the profile image
      try {
        if (username) {
          // DON'T remove the profile image, so the next login can find it
          // await AsyncStorage.removeItem(`profileImage_${username}`);
          
          await AsyncStorage.multiRemove([
            'isLoggedIn',
            'memberSince',
            `submittedEvents_${username}`,
            `eventSignups_${username}`,
            `draftEvents_${username}`
          ]);
        } else {
          await AsyncStorage.removeItem('isLoggedIn');
          await AsyncStorage.removeItem('memberSince');
        }
      } catch (asyncError) {
        console.warn('Error clearing AsyncStorage:', asyncError);
      }
      
      // Also try clearing any stored username
      try {
        await EncryptedStorage.setItem('username', '');
        await AsyncStorage.removeItem('current_username');
        await AsyncStorage.removeItem('fallback_username');
      } catch (error) {
        console.warn('Error clearing username:', error);
      }
      
      // Reset profile context
      setProfile({
        name: '',
        username: '',
        email: '',
        phone: '',
        profileImage: null,
        memberSince: '',
      });
      
      // Navigate to ProfileSetupScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileSetup' }],
      });
    } catch (error) {
      console.error('Error during sign out:', error);
      
      // Force sign out even if there are errors
      setProfile({
        name: '',
        username: '',
        email: '',
        phone: '',
        profileImage: null,
        memberSince: '',
      });
      
      // Navigate to ProfileSetupScreen regardless of errors
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileSetup' }],
      });
      
      // Show a less alarming message
      Alert.alert('Sign Out', 'You have been signed out, but some data cleanup may not have completed.');
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      updateProfile: (updatedProfile) => {
        console.log('Updating profile in context:', updatedProfile);
        // Update the local state
        setProfile((prev) => {
          const newProfile = { ...prev, ...updatedProfile };
          console.log('New profile state:', newProfile);
          return newProfile;
        });
      }, 
      signOut 
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
