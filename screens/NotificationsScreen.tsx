import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // Empty notifications array since there are no signups yet
  const notifications: { id: string; message: string; timestamp: string }[] = [];

  return (
    <ImageBackground
      source={require('../ios/assets/blue.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={28} color="navy" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
      </View>
      <ScrollView style={styles.container}>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <View key={notification.id} style={styles.notificationCard}>
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.timestamp}>{notification.timestamp}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="notifications-none" size={64} color="white" />
            <Text style={styles.emptyStateText}>No notifications yet</Text>
            <Text style={styles.emptyStateSubText}>
              You'll see notifications here when people sign up for your events
            </Text>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'gold',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'navy',
    flex: 1,
  },
  notificationCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  message: {
    fontSize: 16,
    color: 'navy',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    opacity: 0.8,
  },
});

export default NotificationsScreen; 