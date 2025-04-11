import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, StatusBar, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface TopNavProps {
  isPremium?: boolean;
  isDesigner?: boolean;
  username?: string;
}

const TopNav: React.FC<TopNavProps> = ({ isPremium: propIsPremium, isDesigner: propIsDesigner, username: propUsername }) => {
  const navigation = useNavigation<NavigationProp>();
  const [isPremium, setIsPremium] = useState(propIsPremium || false);
  const [isDesigner, setIsDesigner] = useState(propIsDesigner || false);
  const [currentUsername, setCurrentUsername] = useState(propUsername || '');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  // Validate image URI to avoid errors
  const validateImageUri = (uri: string | null): boolean => {
    if (!uri) return false;
    return uri.startsWith('file://') || uri.startsWith('http://') || uri.startsWith('https://');
  };

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
          
          // Load profile image
          setImageLoadError(false);
          try {
            const savedImage = await AsyncStorage.getItem('profileImage');
            if (savedImage && validateImageUri(savedImage)) {
              setProfileImage(savedImage);
            } else {
              const userImage = await AsyncStorage.getItem(`profileImage_${username}`);
              if (userImage && validateImageUri(userImage)) {
                setProfileImage(userImage);
                await AsyncStorage.setItem('profileImage', userImage);
              }
            }
          } catch (err) {
            console.warn('TopNav - Error loading profile image:', err);
          }
        } else {
          setProfileImage(null);
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

    if (!propIsPremium && !propIsDesigner && !propUsername) {
      loadUserData();
    }
    checkUnreadMessages();
  }, [propIsPremium, propIsDesigner, propUsername]);

  const shouldShowChat = isPremium || isDesigner || currentUsername === 'mbc82';
  console.log('TopNav - Chat visibility check:', {
    shouldShowChat,
    isPremium,
    isDesigner,
    currentUsername,
    condition: `(${isPremium} || ${isDesigner} || ${currentUsername} === 'mbc82')`
  });

  const showProfileImage = currentUsername && profileImage && !imageLoadError;

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
            navigation.navigate('RecentChats');
          }}
        >
          <View style={styles.iconWrapper}>
            <MaterialIcons name="chat" size={28} color="navy" />
            {hasUnreadMessages && <View style={styles.notificationDot} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <View style={styles.iconWrapper}>
            {showProfileImage ? (
              <Image 
                source={{ uri: profileImage || undefined }} 
                style={styles.profileImage}
                resizeMode="cover"
                onError={() => {
                  console.log('TopNav - Profile image failed to load');
                  setImageLoadError(true);
                }}
              />
            ) : (
              <MaterialIcons name="account-circle" size={28} color="navy" />
            )}
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
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'navy',
    backgroundColor: '#DDDDDD',
  },
}); 