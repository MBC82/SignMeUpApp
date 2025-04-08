import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const HomeScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState('');

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) {
          setProfileImage(savedImage);
        }
        const username = await AsyncStorage.getItem('username');
        if (username) {
          setCurrentUsername(username);
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
    <View style={styles.container}>
      <Header username={currentUsername} />
      <ImageBackground
        source={require('../ios/assets/home.jpg')}
        style={styles.background}
        resizeMode="stretch"
      >
        {/* Main Content Area */}
        <View style={styles.content}>
          <Text style={styles.title}></Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    marginTop: 60, // Add margin to account for the TopNavBar
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});

export default HomeScreen;

