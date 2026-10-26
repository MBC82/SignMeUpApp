import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { EventsProvider } from './src/context/EventsContext';
import Tabs from './src/Tabs';

const App = () => (
  <SafeAreaProvider>
    <EventsProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <Tabs />
      </NavigationContainer>
    </EventsProvider>
  </SafeAreaProvider>
);

export default App;
