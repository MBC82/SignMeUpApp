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
import { StyleSheet, View, ActivityIndicator, Text, StatusBar, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedSignUpScreen from './screens/EnhancedSignUpScreen';
import SignUpScreen from './screens/SignUpScreen';
import EncryptedStorage from 'react-native-encrypted-storage';

type EventDate = {
  date: string;
  slots: string[];
};

export type RootStackParamList = {
  Home: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  MyEvents: undefined;
  ProfileSetup: undefined;
  EnhancedSignUp: {
    eventId: string;
    id: string;
    username: string;
    eventName: string;
    location: string;
    organizer: string;
    address: string;
    eventTime: string;
    neededItems: string[];
    dates: EventDate[];
    timeSlots: any[];
    bgColor: string;
    fontColor: string;
    fontSize: number;
    fontType: string;
    tileColor: string;
    textNotificationsEnabled: boolean;
    organizerPhone: string;
    emailNotificationsEnabled: boolean;
    organizerEmail: string;
    globalNote: string;
    slotLabels: Record<string, string>;
    backgroundImage: string | null;
    textShadowEnabled: boolean;
    isTimeSlot: boolean;
    isNewEvent: boolean;
    isPreview: boolean;
    showThemes: boolean;
  };
  SignUpScreen: {
    eventId: string;
    id: string;
    username: string;
    eventName: string;
    location: string;
    organizer: string;
    address: string;
    eventTime: string;
    neededItems: string[];
    dates: EventDate[];
    timeSlots: any[];
    bgColor: string;
    fontColor: string;
    fontSize: number;
    fontType: string;
    tileColor: string;
    textNotificationsEnabled: boolean;
    organizerPhone: string;
    emailNotificationsEnabled: boolean;
    organizerEmail: string;
    globalNote: string;
    slotLabels: Record<string, string>;
    backgroundImage: string | null;
    textShadowEnabled: boolean;
    isTimeSlot: boolean;
    isNewEvent: boolean;
    isPreview: boolean;
    showThemes: boolean;
  };
  UserProfile: {
    username?: string;
    isOwnProfile?: boolean;
  };
  EventSignUp: { eventId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const BottomNavBar = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const { profile } = React.useContext(ProfileContext);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        console.log('Login status:', isLoggedIn);
        setIsLoggedIn(isLoggedIn === 'true');
      } catch (error) {
        console.log('Error checking login status:', error);
        setIsLoggedIn(false);
      }
    };

    const loadProfileImage = async () => {
      try {
        // First check if we have a profile image in context
        if (profile.profileImage) {
          setProfileImage(profile.profileImage);
          return;
        }

        // If not in context, try to get from encrypted storage
        const username = await EncryptedStorage.getItem('username');
        if (username) {
          const savedImage = await AsyncStorage.getItem(`profileImage_${username}`);
          if (savedImage) {
            setProfileImage(savedImage);
          }
        }
      } catch (error) {
        console.log('Error loading profile image:', error);
      }
    };

    checkLoginStatus();
    loadProfileImage();

    // Set up event listener for profile changes
    const eventListener = navigation.addListener('focus', () => {
      checkLoginStatus();
      loadProfileImage();
    });

    return () => {
      eventListener();
    };
  }, [navigation, profile.profileImage]);

  // Also update profile image when profile context changes
  useEffect(() => {
    if (profile.profileImage) {
      setProfileImage(profile.profileImage);
    }
  }, [profile.profileImage]);

  const handleProfilePress = () => {
    if (isLoggedIn) {
      navigation.navigate('UserProfile', {});
    } else {
      navigation.navigate('ProfileSetup');
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
        {isLoggedIn && profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImageNav} />
        ) : (
          <MaterialIcons name="account-circle" size={30} color="navy" />
        )}
        <Text style={styles.iconLabel}>My Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ProfileProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" />
            <View style={styles.container}>
              <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                  headerStyle: {
                    backgroundColor: '#ffffff',
                  },
                  headerTintColor: '#000000',
                  headerTitleStyle: {
                    fontWeight: 'bold',
                  },
                  headerShown: false,
                }}
              >
                <Stack.Screen 
                  name="Home" 
                  component={HomeScreen}
                  options={{
                    title: 'SignMeUp'
                  }}
                />
                <Stack.Screen 
                  name="EventDetails" 
                  component={EventDetailsScreen as any}
                  options={{
                    title: 'Event Details'
                  }}
                />
                <Stack.Screen 
                  name="CreateEvent" 
                  component={CreateEventScreen as any}
                  options={{
                    title: 'Create Event'
                  }}
                />
                <Stack.Screen 
                  name="MyEvents" 
                  component={MyEventsScreen}
                  options={{
                    title: 'My Events'
                  }}
                />
                <Stack.Screen 
                  name="EnhancedSignUp" 
                  component={EnhancedSignUpScreen}
                  options={{
                    title: 'Sign Up'
                  }}
                />
                <Stack.Screen 
                  name="ProfileSetup" 
                  component={ProfileSetupScreen}
                  options={{
                    title: 'Profile'
                  }}
                />
                <Stack.Screen 
                  name="UserProfile" 
                  component={UserProfileScreen}
                  options={{
                    title: 'My Profile'
                  }}
                />
                <Stack.Screen 
                  name="SignUpScreen" 
                  component={SignUpScreen}
                  options={{
                    title: 'Sign Up'
                  }}
                />
              </Stack.Navigator>
              <BottomNavBar />
            </View>
          </NavigationContainer>
        </ProfileProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
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
  },
});

export default App;
