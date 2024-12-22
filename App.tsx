import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import EventDetailsScreen from './screens/EventDetailsScreen';
import SignUpScreen from './screens/SignUpScreen';
import ProfileSetupScreen from './screens/ProfileSetupScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import { ProfileProvider } from './ProfileContext';

// Define the types for the screens
export type RootStackParamList = {
  HomeScreen: undefined;
  CreateEventScreen: undefined;
  EventDetailsScreen: undefined;
  SignUpScreen: undefined;
  ProfileSetupScreen: undefined;
  MyEventsScreen: undefined;
};

const Stack = createStackNavigator();

const App = () => {
  return (
    <ProfileProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="HomeScreen">
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CreateEventScreen"
            component={CreateEventScreen}
            options={{ title: 'Create an Event' }}
          />
          <Stack.Screen
            name="EventDetailsScreen"
            component={EventDetailsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignUpScreen"
            component={SignUpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProfileSetupScreen"
            component={ProfileSetupScreen}
            options={{ title: 'Profile Setup' }}
          />
          <Stack.Screen
            name="MyEventsScreen"
            component={MyEventsScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ProfileProvider>
  );
};

export default App;
