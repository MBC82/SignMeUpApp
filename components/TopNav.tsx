import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const TopNav = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isPremium, setIsPremium] = useState(false);
  const [isDesigner, setIsDesigner] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const username = await AsyncStorage.getItem('username');
        console.log('TopNav - Loaded username:', username);
        if (username) {
          setCurrentUsername(username);
          const premium = await AsyncStorage.getItem('isPremium');
          const designer = await AsyncStorage.getItem('isDesigner');
          console.log('TopNav - Raw premium value:', premium);
          console.log('TopNav - Raw designer value:', designer);
          const isPremiumValue = premium === 'true';
          const isDesignerValue = designer === 'true';
          console.log('TopNav - Parsed premium:', isPremiumValue);
          console.log('TopNav - Parsed designer:', isDesignerValue);
          setIsPremium(isPremiumValue);
          setIsDesigner(isDesignerValue);
        }
      } catch (error) {
        console.error('TopNav - Error loading user data:', error);
      }
    };

    const checkUnreadMessages = async () => {
      try {
        const unreadMessages = await AsyncStorage.getItem('unreadMessages');
        setHasUnreadMessages(unreadMessages === 'true');
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    };

    loadUserData();
    checkUnreadMessages();
  }, []);

  const shouldShowChat = isPremium || isDesigner || currentUsername === 'mbc82';
  console.log('TopNav - Chat visibility check:', {
    shouldShowChat,
    isPremium,
    isDesigner,
    currentUsername,
    condition: `(${isPremium} || ${isDesigner} || ${currentUsername} === 'mbc82')`
  });

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.iconWrapper}>
            <MaterialIcons name="notifications" size={28} color="navy" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => {
            AsyncStorage.setItem('unreadMessages', 'false');
            setHasUnreadMessages(false);
            navigation.navigate('Chat', { eventId: 'global' });
          }}
        >
          <View style={styles.iconWrapper}>
            <MaterialIcons name="chat" size={28} color="navy" />
            {hasUnreadMessages && <View style={styles.notificationDot} />}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: 'gold',
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 5,
    marginTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 30,
    paddingBottom: 10,
  },
  iconButton: {
    marginLeft: 0,
    padding: 8,
    marginBottom: -5,
  },
  iconWrapper: {
    // Removed shadow styles
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default TopNav; 