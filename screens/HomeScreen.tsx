import React, { useState, useEffect } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [isDesigner, setIsDesigner] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) {
          setProfileImage(savedImage);
        }
        const username = await AsyncStorage.getItem('username');
        console.log('Loaded username:', username);
        if (username) {
          setCurrentUsername(username);
          console.log('Set currentUsername to:', username);
        }
        const premium = await AsyncStorage.getItem('isPremium');
        if (premium) {
          setIsPremium(premium === 'true');
        }
        const designer = await AsyncStorage.getItem('isDesigner');
        if (designer) {
          setIsDesigner(designer === 'true');
        }
      } catch (error) {
        console.log('Error loading user data:', error);
      }
    };

    if (isFocused) {
      loadUserData();
    }
  }, [isFocused]);

  const shouldShowChat = isPremium || isDesigner || currentUsername === 'mbc82';

  return (
    <View style={styles.container}>
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
    height: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
});

export default HomeScreen;

