import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const BottomNavBar = () => {
  const navigation = useNavigation<NavigationProp>();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const encryptedLoginStatus = await EncryptedStorage.getItem('isLoggedIn');
        const asyncLoginStatus = await AsyncStorage.getItem('isLoggedIn');
        const loggedIn = encryptedLoginStatus === 'true' || asyncLoginStatus === 'true';
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          const savedImage = await AsyncStorage.getItem('profileImage');
          if (savedImage) {
            setProfileImage(savedImage);
          }
        } else {
          setProfileImage(null);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
        setProfileImage(null);
      }
    };

    checkLoginStatus();
  }, []);

  const handleProfilePress = () => {
    if (isLoggedIn) {
      navigation.navigate('UserProfile');
    } else {
      navigation.navigate('ProfileSetup', { skipWelcome: false });
    }
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

      <TouchableOpacity onPress={handleProfilePress} style={styles.navButton}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {isLoggedIn && profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.profileImageNav}
              resizeMode="cover"
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
  },
});

export default BottomNavBar; 