import React, { useState, useEffect } from 'react';
import { initializeFirebase } from './firebaseInit';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, ActivityIndicator, Text, StatusBar } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import EventDetailsScreen from './screens/EventDetailsScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import { ProfileProvider } from './ProfileContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EncryptedStorageProvider } from './contexts/EncryptedStorageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EnhancedSignUpScreen from './screens/EnhancedSignUpScreen';
import SignUpScreen from './screens/SignUpScreen';
import EventSignUpScreen from './screens/EventSignUpScreen';
import { ChatScreen } from './screens/ChatScreen';
import RecentChatsScreen from './screens/RecentChatsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import TopNav from './components/TopNav';
import BottomNavBar from './components/BottomNavBar';

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
  UserProfile: { userId: string };
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
  Chat: { eventId: string; eventName: string };
  RecentChats: undefined;
  Notifications: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

type ScreenProps = {
  navigation: any;
  route: any;
};

const App = () => {
  const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isDesigner, setIsDesigner] = useState(false);
  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing Firebase...');
        await initializeFirebase();
        console.log('Firebase initialized successfully');
        setIsFirebaseInitialized(true);

        // Load user data
        const savedUsername = await AsyncStorage.getItem('username');
        const premium = await AsyncStorage.getItem('isPremium');
        const designer = await AsyncStorage.getItem('isDesigner');
        
        if (savedUsername) setUsername(savedUsername);
        if (premium) setIsPremium(premium === 'true');
        if (designer) setIsDesigner(designer === 'true');
      } catch (error) {
        console.error('Error initializing app:', error);
        // Don't set isFirebaseInitialized to true if initialization failed
      }
    };

    initializeApp();
  }, []);

  if (!isFirebaseInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Initializing app...</Text>
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
                  username={username}
                />
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                  }}
                >
                  <Stack.Screen 
                    name="Home" 
                    component={HomeScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="EventDetails" 
                    component={EventDetailsScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="CreateEvent" 
                    component={CreateEventScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="MyEvents" 
                    component={MyEventsScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="ProfileSetup" 
                    component={ProfileSetupScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="UserProfile" 
                    component={UserProfileScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="EnhancedSignUp" 
                    component={EnhancedSignUpScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="SignUpScreen" 
                    component={SignUpScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="EventSignUp" 
                    component={EventSignUpScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="Chat" 
                    component={ChatScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="RecentChats" 
                    component={RecentChatsScreen as React.ComponentType<ScreenProps>} 
                  />
                  <Stack.Screen 
                    name="Notifications" 
                    component={NotificationsScreen as React.ComponentType<ScreenProps>} 
                  />
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default App;
