import { Platform } from 'react-native';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';

// Initialize Firebase
export const initializeFirebase = async () => {
  try {
    // Request permission for notifications (iOS)
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      
      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
    }

    // Get the FCM token
    const fcmToken = await messaging().getToken();
    console.log('FCM Token:', fcmToken);
    
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};

// Chat Service
export const ChatService = {
  // Send a message
  sendMessage: async (eventId: string, message: string, senderId: string, senderName: string) => {
    try {
      const chatRef = database().ref(`chats/${eventId}`);
      const newMessageRef = chatRef.push();
      
      await newMessageRef.set({
        message,
        senderId,
        senderName,
        timestamp: database.ServerValue.TIMESTAMP,
      });
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  },

  // Get messages for an event
  getMessages: (eventId: string, callback: (messages: any[]) => void) => {
    const chatRef = database().ref(`chats/${eventId}`);
    
    chatRef.on('value', (snapshot) => {
      const messages: any[] = [];
      snapshot.forEach((childSnapshot) => {
        messages.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
        return true;
      });
      callback(messages);
    });

    // Return unsubscribe function
    return () => chatRef.off();
  },

  // Mark messages as read
  markAsRead: async (eventId: string, userId: string) => {
    try {
      const readRef = database().ref(`chats/${eventId}/read/${userId}`);
      await readRef.set(database.ServerValue.TIMESTAMP);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  },
}; 