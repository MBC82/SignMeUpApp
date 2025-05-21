import { initializeApp, getApp } from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQvzXJ-qc66HmYCxec6LJqGNvX2VNQHpg",
  projectId: "signmeup-e5e0c",
  storageBucket: "signmeup-e5e0c.firebasestorage.app",
  messagingSenderId: "895428834263",
  appId: "1:895428834263:ios:370a9db4cf3fbc98189192",
  databaseURL: "https://signmeup-e5e0c.firebaseio.com"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If app is already initialized, get the existing app
  app = getApp();
}

// Initialize Firebase services
const storageService = storage();
const firestoreService = firestore();
const authService = auth();
const messagingService = messaging();

// Export services
export { app, storageService, firestoreService, authService, messagingService };

// Authentication functions
export const createUser = async (email: string, password: string) => {
  try {
    const userCredential = await authService.createUserWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await authService.signInWithEmailAndPassword(email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await authService.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// User profile functions
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    await firestoreService.collection('users').doc(userId).set(profileData, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (userId: string, imageUri: string) => {
  try {
    // Create a unique filename with timestamp
    const timestamp = new Date().getTime();
    const filename = `profile_${userId}_${timestamp}.jpg`;
    const reference = storageService.ref(`profile_images/${userId}/${filename}`);
    
    // Upload the file
    await reference.putFile(imageUri);
    
    // Get the download URL
    const downloadURL = await reference.getDownloadURL();
    
    // Cache the URL in AsyncStorage
    await AsyncStorage.setItem(`profileImage_${userId}`, downloadURL);
    await AsyncStorage.setItem('profileImage', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

export const getProfileImageUrl = async (userId: string) => {
  try {
    // First try to get from AsyncStorage
    const cachedUrl = await AsyncStorage.getItem(`profileImage_${userId}`);
    if (cachedUrl) {
      return cachedUrl;
    }
    
    // If not in cache, try to get from Firebase
    const reference = storageService.ref(`profile_images/${userId}`);
    const files = await reference.listAll();
    
    if (files.items.length > 0) {
      // Get the most recent file
      const latestFile = files.items[files.items.length - 1];
      const downloadURL = await latestFile.getDownloadURL();
      
      // Cache the URL
      await AsyncStorage.setItem(`profileImage_${userId}`, downloadURL);
      await AsyncStorage.setItem('profileImage', downloadURL);
      
      return downloadURL;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile image URL:', error);
    return null;
  }
};

// Event functions
export const createEvent = async (eventData: any) => {
  try {
    const docRef = await firestoreService.collection('events').add({
      ...eventData,
      createdAt: firestore.Timestamp.now(),
      participants: [eventData.username],
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const getEvent = async (eventId: string) => {
  try {
    const doc = await firestoreService.collection('events').doc(eventId).get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error getting event:', error);
    throw error;
  }
};

// Chat functions
export const sendMessage = async (eventId: string, messageData: any) => {
  try {
    const messageRef = firestoreService.collection('events').doc(eventId).collection('chat').doc();
    
    await messageRef.set({
      ...messageData,
      timestamp: firestore.Timestamp.now(),
    });
    
    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getMessages = (eventId: string, callback: (messages: any[]) => void) => {
  return firestoreService
    .collection('events')
    .doc(eventId)
    .collection('chat')
    .orderBy('timestamp', 'asc')
    .onSnapshot((snapshot) => {
      const messages: any[] = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      callback(messages);
    });
};

// Push notification functions
export const requestNotificationPermission = async () => {
  try {
    const authStatus = await messagingService.requestPermission();
    return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
           authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

export const getFCMToken = async () => {
  try {
    return await messagingService.getToken();
  } catch (error) {
    console.error('Error getting FCM token:', error);
    throw error;
  }
};

export const subscribeToEventNotifications = async (eventId: string, userId: string) => {
  try {
    const fcmToken = await getFCMToken();
    await firestoreService
      .collection('events')
      .doc(eventId)
      .collection('notificationSubscribers')
      .doc(userId)
      .set({
        fcmToken,
        subscribedAt: firestore.Timestamp.now(),
      });
    return true;
  } catch (error) {
    console.error('Error subscribing to event notifications:', error);
    throw error;
  }
}; 