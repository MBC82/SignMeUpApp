import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StatusBar } from 'react-native';
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
import EncryptedStorage from 'react-native-encrypted-storage';
import EventSignUpScreen from './screens/EventSignUpScreen';
import { ChatScreen } from './screens/ChatScreen';
import RecentChatsScreen from './screens/RecentChatsScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import TopNav from './components/TopNav';
import BottomNavBar from './components/BottomNavBar';

export type RootStackParamList = {
  Home: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  MyEvents: undefined;
  ProfileSetup: { skipWelcome?: boolean };
  UserProfile: { userId: string };
  EnhancedSignUp: undefined;
  SignUpScreen: undefined;
  EventSignUp: { eventId: string };
  Chat: { eventId: string; userId?: string };
  RecentChats: undefined;
  Notifications: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

type ScreenProps = {
  navigation: any;
  route: any;
};

const App = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [isDesigner, setIsDesigner] = useState(false);
  const [username, setUsername] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUsername = await EncryptedStorage.getItem('username');
        const premium = await AsyncStorage.getItem('isPremium');
        const designer = await AsyncStorage.getItem('isDesigner');
        
        setUsername(storedUsername || undefined);
        setIsPremium(premium === 'true');
        setIsDesigner(designer === 'true');
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

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

const styles = {
  mainContainer: {
    flex: 1,
  },
};

export default App;
