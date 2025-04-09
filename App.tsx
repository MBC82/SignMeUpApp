import React, { useState, useEffect } from 'react';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import EventDetailsScreen from './screens/EventDetailsScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import { ProfileProvider, ProfileContext } from './ProfileContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EncryptedStorageProvider } from './contexts/EncryptedStorageContext';
import { StyleSheet, View, ActivityIndicator, Text, StatusBar, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedSignUpScreen from './screens/EnhancedSignUpScreen';
import SignUpScreen from './screens/SignUpScreen';
import EncryptedStorage from 'react-native-encrypted-storage';
import EventSignUpScreen from './screens/EventSignUpScreen';
import { ChatScreen } from './screens/ChatScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import TopNav from './components/TopNav';

type EventDate = {
  date: string;
  slots: string[];
};

export type RootStackParamList = {
  Home: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  MyEvents: undefined;
  ProfileSetup: { skipWelcome?: boolean };
  UserProfile: { username?: string; isOwnProfile?: boolean };
  EnhancedSignUp: undefined;
  SignUpScreen: {
    eventName: string;
    location: string;
    organizer: string;
    address: string;
    eventTime?: string;
    neededItems?: string[];
    dates?: EventDate[];
    timeSlots?: any[];
    bgColor?: string;
    fontColor?: string;
    fontSize?: number;
    fontType?: string;
    tileColor?: string;
    backgroundImage?: string | null;
    index?: string;
  };
  EventSignUp: {
    eventId: string;
    id: string;
    username: string;
    eventName: string;
    location: string;
    organizer: string;
    address: string;
    eventTime?: string;
    neededItems?: string[];
    dates?: EventDate[];
    timeSlots?: any[];
    bgColor?: string;
    fontColor?: string;
    fontSize?: number;
    fontType?: string;
    tileColor?: string;
    textNotificationsEnabled?: boolean;
    organizerPhone?: string;
    emailNotificationsEnabled?: boolean;
    organizerEmail?: string;
    globalNote?: string;
    slotLabels?: Record<string, string>;
    backgroundImage?: string | null;
    textShadowEnabled?: boolean;
    isTimeSlot?: boolean;
    isNewEvent?: boolean;
    isPreview?: boolean;
    headerTileColor?: string;
    headerFontColor?: string;
    screenBgColor?: string;
    modalFontColor?: string;
    modalFontSize?: number;
    modalFontType?: string;
    modalTileColor?: string;
    isPremium?: boolean;
    isDesigner?: boolean;
  };
  Chat: { eventId: string };
  Notifications: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const BottomNavBar = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { profile } = React.useContext(ProfileContext);
  const currentRoute = navigation.getState().routes[navigation.getState().routes.length - 1].name;

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Check both storage locations for login status
        const encryptedLoginStatus = await EncryptedStorage.getItem('isLoggedIn');
        const asyncLoginStatus = await AsyncStorage.getItem('isLoggedIn');
        
        console.log('Login status from encrypted storage:', encryptedLoginStatus);
        console.log('Login status from AsyncStorage:', asyncLoginStatus);
        
        // Consider logged in if either storage has "true" status
        const loggedIn = encryptedLoginStatus === 'true' || asyncLoginStatus === 'true';
        console.log('Combined login status:', loggedIn);
        
        setIsLoggedIn(loggedIn);
        
        // Only clear profile image if explicitly logged out
        if (!loggedIn) {
          setProfileImage(null);
        }
      } catch (error) {
        console.log('Error checking login status:', error);
        setIsLoggedIn(false);
        setProfileImage(null);
      }
    };

    const loadProfileImage = async () => {
      try {
        // First check if user is logged in
        if (!isLoggedIn) {
          console.log('Not logged in, not loading profile image');
          setProfileImage(null);
          return;
        }
        
        // Then check if we have a profile image in context
        if (profile.profileImage) {
          console.log('Loading profile image from context');
          setProfileImage(profile.profileImage);
          return;
        }

        // Check generic profile image in AsyncStorage
        const genericProfileImage = await AsyncStorage.getItem('profileImage');
        if (genericProfileImage) {
          console.log('Loading generic profile image from AsyncStorage');
          setProfileImage(genericProfileImage);
          return;
        }

        // Try user-specific profile image
        const username = await EncryptedStorage.getItem('username');
        if (username) {
          const savedImage = await AsyncStorage.getItem(`profileImage_${username}`);
          if (savedImage) {
            console.log('Loading user-specific profile image from AsyncStorage');
            setProfileImage(savedImage);
          }
        }
      } catch (error) {
        console.log('Error loading profile image:', error);
        setProfileImage(null);
      }
    };

    checkLoginStatus();
    loadProfileImage();

    // Set up event listener for changes
    const eventListener = navigation.addListener('focus', () => {
      checkLoginStatus();
      loadProfileImage();
    });

    return () => {
      eventListener();
    };
  }, [navigation, profile.profileImage, isLoggedIn]);

  // Also update profile image when profile context changes
  useEffect(() => {
    if (isLoggedIn && profile.profileImage) {
      setProfileImage(profile.profileImage);
    } else if (!isLoggedIn) {
      setProfileImage(null);
    }
  }, [profile.profileImage, isLoggedIn]);

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

      {/* Profile Button */}
      <TouchableOpacity onPress={handleProfilePress} style={styles.navButton}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {isLoggedIn && profileImage ? (
            <Image 
              source={{ uri: profileImage }} 
              style={styles.profileImageNav}
              resizeMode="cover"
              onError={(e) => {
                console.log('Error loading profile image:', e.nativeEvent.error);
                setProfileImage(null);
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

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isDesigner, setIsDesigner] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const encryptedLoginStatus = await EncryptedStorage.getItem('isLoggedIn');
        const asyncLoginStatus = await AsyncStorage.getItem('isLoggedIn');
        const loggedIn = encryptedLoginStatus === 'true' || asyncLoginStatus === 'true';
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          const savedUsername = await EncryptedStorage.getItem('username');
          setUsername(savedUsername);
          
          const premiumStatus = await AsyncStorage.getItem('isPremium');
          const designerStatus = await AsyncStorage.getItem('isDesigner');
          setIsPremium(premiumStatus === 'true');
          setIsDesigner(designerStatus === 'true');
        }
      } catch (error) {
        console.log('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="gold" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <ProfileProvider>
        <LanguageProvider>
          <ThemeProvider>
            <EncryptedStorageProvider>
              <StatusBar barStyle="dark-content" />
              <View style={styles.mainContainer}>
                <TopNav 
                  isPremium={isPremium}
                  isDesigner={isDesigner}
                  username={username || undefined}
                />
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen name="Home" component={HomeScreen} />
                  <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
                  <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
                  <Stack.Screen name="MyEvents" component={MyEventsScreen} />
                  <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
                  <Stack.Screen name="UserProfile" component={UserProfileScreen} />
                  <Stack.Screen name="EnhancedSignUp" component={EnhancedSignUpScreen} />
                  <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                  <Stack.Screen name="EventSignUp" component={EventSignUpScreen} />
                  <Stack.Screen name="Chat" component={ChatScreen} />
                  <Stack.Screen name="Notifications" component={NotificationsScreen} />
                </Stack.Navigator>
                <BottomNavBar />
              </View>
            </EncryptedStorageProvider>
          </ThemeProvider>
        </LanguageProvider>
      </ProfileProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
  },
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

export default App;
