import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TopNav from './components/TopNav';
import BottomBar from './components/BottomBar';
import HomeScreen from './screens/HomeScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const Tabs = () => (
  <View style={styles.main}>
    <TopNav />
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={props => <BottomBar {...props} />}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="MyEvents" component={MyEventsScreen} />
      <Tab.Screen name="CreateEvent" component={CreateEventScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  </View>
);

const styles = StyleSheet.create({ main: { flex: 1, backgroundColor: '#fff' } });

export default Tabs;
