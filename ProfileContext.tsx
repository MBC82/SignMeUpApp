import React, { createContext, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Alert } from 'react-native';
import { safeGetItem, safeSetItem, bypassRemoveItem, clearLoginState, logoutUser } from './utils/StorageUtils';

type Profile = {
  name: string;
  username?: string;
  email: string;
  phone: string;
  profileImage: string | null;
  memberSince: string;
};

type ProfileContextType = {
  profile: Profile;
  updateProfile: (updatedProfile: Partial<Profile>) => void;
  signOut: (navigation: any) => void;
  checkLoginStatus: () => Promise<boolean>;
  clearLoginState: () => Promise<boolean>;
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
  checkLoginStatus: async () => false,
  clearLoginState: async () => false,
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

  const checkLoginStatus = async (): Promise<boolean> => {
    try {
      // Check both Encrypted and regular storage
      const encryptedLoginStatus = await EncryptedStorage.getItem('isLoggedIn');
      const asyncLoginStatus = await AsyncStorage.getItem('isLoggedIn');
      
      // Check if username exists in either storage
      const encryptedUsername = await EncryptedStorage.getItem('username');
      const asyncUsername = await AsyncStorage.getItem('username');
      
      // User is logged in if both conditions are met:
      // 1. Login status is 'true' in either storage
      // 2. Username exists in either storage
      const isLoggedIn = 
        (encryptedLoginStatus === 'true' || asyncLoginStatus === 'true') && 
        (!!encryptedUsername || !!asyncUsername);
      
      return isLoggedIn;
    } catch (error) {
      return false;
    }
  };

  const loadProfile = async () => {
    try {
      const username = await safeGetItem('username');
      
      if (!username) {
        return null;
      }
      
      const allUsersString = await safeGetItem('allUsers');
      const allUsers = allUsersString ? JSON.parse(allUsersString) : [];
      
      const userProfile = allUsers.find((user: any) => user.username === username);
      
      if (userProfile) {
        return userProfile;
      }
      
      return null;
    } catch (error) {
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
      
      return true;
    } catch (error) {
      return false;
    }
  };

  const signOut = async (navigation: any) => {
    try {
      // Log out the user
      await logoutUser();
      
      // Reset the profile state
      setProfile({
        name: '',
        username: '',
        email: '',
        phone: '',
        profileImage: null,
        memberSince: '',
      });
      
      // Navigate to login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileSetup' }],
      });
    } catch (error) {
      // Still navigate to login screen even on error
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileSetup' }],
      });
    }
  };

  return (
    <ProfileContext.Provider value={{ 
      profile, 
      updateProfile: (updatedProfile) => {
        setProfile((prev) => ({ ...prev, ...updatedProfile }));
      }, 
      signOut,
      checkLoginStatus,
      clearLoginState
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export default ProfileContext;
