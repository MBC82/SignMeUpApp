import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.log('Error loading profile image:', error);
      }
    };

    if (isFocused) {
      loadProfileImage();
    }
  }, [isFocused]);

  return (
    <ImageBackground
      source={require('../ios/assets/home.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      {/* Main Content Area */}
      <View style={styles.content}>
        <Text style={styles.title}></Text>
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} style={styles.navButton}>
          <MaterialIcons name="home" size={30} color="navy" />
          <Text style={styles.iconLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('MyEventsScreen')} style={styles.navButton}>
          <MaterialIcons name="calendar-today" size={30} color="navy" />
          <Text style={styles.iconLabel}>My Events</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('CreateEventScreen')} style={styles.navButton}>
          <MaterialIcons name="event" size={30} color="navy" />
          <Text style={styles.iconLabel}>Create Event</Text>
        </TouchableOpacity>

        {/* Profile Button */}
        <TouchableOpacity onPress={() => navigation.navigate('ProfileSetupScreen')} style={styles.navButton}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImageNav} />
          ) : (
            <MaterialIcons name="account-circle" size={30} color="navy" />
          )}
          <Text style={styles.iconLabel}>My Profile</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileText: {
    fontSize: 20,
    color: 'navy',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF', // Adjust this color to match your desired style
  },
  subTitle: {
    fontSize: 16,
    color: 'gray',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 8,
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
  },
});

export default HomeScreen;