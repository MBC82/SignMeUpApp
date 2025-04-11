import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { RootStackParamList } from '../App';
import { ProfileContext } from '../ProfileContext';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const BottomNavBar = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useContext(ProfileContext);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Validate image URI to avoid errors
  const validateImageUri = (uri: string | null): boolean => {
    if (!uri) return false;
    
    // Check if it's a valid string URI
    if (typeof uri !== 'string') return false;
    
    // Check if it has a valid scheme
    return uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://');
  };

  // Main effect to check login status and load profile image
  useEffect(() => {
    const checkLoginAndLoadImage = async () => {
      try {
        // Reset error state on each check
        setImageLoadError(false);
        
        // Check login status
        const encryptedLoginStatus = await EncryptedStorage.getItem('isLoggedIn');
        const asyncLoginStatus = await AsyncStorage.getItem('isLoggedIn');
        const isUserLoggedIn = encryptedLoginStatus === 'true' || asyncLoginStatus === 'true';
        
        console.log('BOTTOM NAV - Login status:', isUserLoggedIn);
        
        // Set login state first
        setIsLoggedIn(isUserLoggedIn);
        
        // Clear the profile image if not logged in
        if (!isUserLoggedIn) {
          setProfileImage(null);
          return;
        }
        
        // Use profile.profileImage first if available
        if (profile && profile.profileImage && validateImageUri(profile.profileImage)) {
          console.log('BOTTOM NAV - Using profile image from context');
          setProfileImage(profile.profileImage);
          return;
        }
        
        // Otherwise, try to get from AsyncStorage
        const savedImage = await AsyncStorage.getItem('profileImage');
        console.log('BOTTOM NAV - Profile image from AsyncStorage:', savedImage ? 'found' : 'not found');
        
        if (savedImage && validateImageUri(savedImage)) {
          setProfileImage(savedImage);
          return;
        }
        
        // Try username-specific image as final fallback
        try {
          const username = await AsyncStorage.getItem('username') || 
                         await EncryptedStorage.getItem('username');
                         
          if (username) {
            const userImage = await AsyncStorage.getItem(`profileImage_${username}`);
            if (userImage && validateImageUri(userImage)) {
              console.log('BOTTOM NAV - Found user-specific image');
              setProfileImage(userImage);
              
              // Save it to the main key for next time
              await AsyncStorage.setItem('profileImage', userImage);
              return;
            }
          }
        } catch (err) {
          console.warn('BOTTOM NAV - Error loading user-specific image:', err);
        }
        
        // No valid image found
        setProfileImage(null);
      } catch (error) {
        console.error('BOTTOM NAV - Error:', error);
        setProfileImage(null);
      }
    };
    
    // Initial check
    checkLoginAndLoadImage();
    
    // Set up listener for when screen is focused
    const unsubscribe = navigation.addListener('focus', () => {
      checkLoginAndLoadImage();
    });
    
    return () => unsubscribe();
  }, [navigation, profile]);

  const handleProfilePress = () => {
    if (isLoggedIn) {
      navigation.navigate('UserProfile' as never);
    } else {
      navigation.navigate('ProfileSetup', { skipWelcome: false });
    }
  };

  // If profileImage is non-null AND isLoggedIn is true AND no image load error, show the profile image
  const showProfileImage = isLoggedIn && profileImage !== null && !imageLoadError;

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.navButton}>
        <MaterialIcons name="home" size={30} color="navy" />
        <Text style={styles.iconLabel}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('MyEvents')} style={styles.navButton}>
        <MaterialIcons name="calendar-today" size={30} color="navy" />
        <Text style={styles.iconLabel}>My Events</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('CreateEvent')} style={styles.navButton}>
        <MaterialIcons name="event" size={30} color="navy" />
        <Text style={styles.iconLabel}>Create Event</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleProfilePress} style={styles.navButton}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {showProfileImage ? (
            <Image 
              source={{ uri: profileImage || undefined }} 
              style={styles.profileImageNav}
              resizeMode="cover"
              onError={() => {
                console.log('BOTTOM NAV - Image failed to load');
                setImageLoadError(true);
              }}
            />
          ) : (
            <MaterialIcons 
              name="account-circle" 
              size={30} 
              color="navy"
              style={{ marginBottom: 4 }} 
            />
          )}
          <Text style={styles.iconLabel}>My Profile</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 80,
    backgroundColor: 'gold',
    paddingBottom: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    color: 'navy',
    fontSize: 12,
    marginTop: 2,
  },
  profileImageNav: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 2,
    borderWidth: 1,
    borderColor: 'navy',
    marginTop: 3,
    backgroundColor: '#DDDDDD',
  },
});

export default BottomNavBar; 