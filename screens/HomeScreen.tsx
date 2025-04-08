import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatButton from '../components/ChatButton';

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
        <ChatButton 
          eventId="home"
          isPremium={false}
          isDesigner={false}
          username={currentUsername}
        />
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
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 16,
    color: 'gray',
  },
});

export default HomeScreen;

