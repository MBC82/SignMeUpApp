import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { RootStackParamList } from '../App';
import { ProfileContext } from '../ProfileContext';
import { getProfileImage, isTemporaryFile, verifyImageExists } from '../utils/ImageUtils';
import { clearLoginState } from '../utils/StorageUtils';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const BottomNavBar = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useContext(ProfileContext);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Simple silent profile image validation
  const validateImageUri = (uri: string | null | undefined): boolean => {
    if (!uri) return false;
    if (typeof uri !== 'string') return false;
    return uri.startsWith('http') || uri.startsWith('file://');
  };

  // Main effect to check login status and load profile image
  useEffect(() => {
    // Just use the profile state directly without AsyncStorage or disk checks
    const loggedIn = !!profile?.username;
    setIsLoggedIn(loggedIn);
    
    if (loggedIn && profile.profileImage && validateImageUri(profile.profileImage)) {
      setProfileImage(profile.profileImage);
    } else {
      setProfileImage(null);
    }
    
    setImageLoadError(false);
  }, [profile]);

  const handleProfilePress = async () => {
    // Always navigate to correct screen based on login state
    if (isLoggedIn) {
      navigation.navigate('UserProfile' as never);
    } else {
      try {
        await AsyncStorage.setItem('isLoggedIn', 'false');
      } catch (e) {
        // Ignore errors
      }
      navigation.navigate('ProfileSetup' as never);
    }
  };

  const handleProfileLongPress = () => {
    Alert.alert(
      'Storage Utility',
      'Do you want to clear app storage and logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Open Utility',
          onPress: () => navigation.navigate('ClearStorage' as never)
        }
      ]
    );
  };

  // If profileImage is non-null AND isLoggedIn is true AND no image load error, show the profile image
  const showProfileImage = isLoggedIn && profileImage !== null && !imageLoadError;

  // Image load error handler
  const handleImageError = () => {
    setImageLoadError(true);
    setProfileImage(null);
  };

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

      <TouchableOpacity 
        onPress={handleProfilePress} 
        onLongPress={handleProfileLongPress}
        delayLongPress={1000}
        style={styles.navButton}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {showProfileImage ? (
            <Image 
              source={{ uri: profileImage || undefined }} 
              style={styles.profileImageNav}
              resizeMode="cover"
              onError={handleImageError}
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