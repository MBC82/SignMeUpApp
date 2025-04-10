import { getAuth } from '@react-native-firebase/auth';
import { getFirestore, FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getStorage } from '@react-native-firebase/storage';
import { getMessaging, AuthorizationStatus } from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import firestore from '@react-native-firebase/firestore';

// Initialize Firebase services
const authService = getAuth();
const firestoreService = getFirestore();
const storageService = getStorage();
const messagingService = getMessaging();

// Export services
export { authService, firestoreService, storageService, messagingService };

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
    const reference = storageService.ref(`profile_images/${userId}`);
    await reference.putFile(imageUri);
    const downloadURL = await reference.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Event functions
export const createEvent = async (eventData: any) => {
  try {
    const docRef = await firestoreService.collection('events').add({
      ...eventData,
      createdAt: firestore.Timestamp.now(),
      participants: [eventData.username],
      status: 'active',
      // Preserve existing event structure
      backgroundImage: eventData.backgroundImage,
      bgColor: eventData.bgColor || 'transparent',
      dates: eventData.dates || [],
      editedTiles: eventData.editedTiles || {},
      emailNotificationsEnabled: eventData.emailNotificationsEnabled || false,
      eventTime: eventData.eventTime || '',
      fontColor: eventData.fontColor || 'black',
      fontSize: eventData.fontSize || 16,
      fontType: eventData.fontType || 'Marker Felt',
      globalNote: eventData.globalNote || '',
      headerFontColor: eventData.headerFontColor || 'black',
      headerTileColor: eventData.headerTileColor || 'lightpink',
      isEditing: eventData.isEditing || false,
      isNewEvent: eventData.isNewEvent || true,
      isPreview: eventData.isPreview || false,
      isTimeSlot: eventData.isTimeSlot || false,
      location: eventData.location || '',
      modalFontColor: eventData.modalFontColor || 'black',
      modalFontSize: eventData.modalFontSize || 16,
      modalFontType: eventData.modalFontType || 'Marker Felt',
      modalTileColor: eventData.modalTileColor || 'lightpink',
      neededItems: eventData.neededItems || [],
      organizer: eventData.organizer || '',
      organizerEmail: eventData.organizerEmail || '',
      organizerPhone: eventData.organizerPhone || '',
      screenBgColor: eventData.screenBgColor || 'transparent',
      slotLabels: eventData.slotLabels || {},
      textNotificationsEnabled: eventData.textNotificationsEnabled || false,
      textShadowEnabled: eventData.textShadowEnabled || false,
      tileColor: eventData.tileColor || 'lightpink',
      tileNames: eventData.tileNames || [],
      timeSlots: eventData.timeSlots || []
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
    const messageRef = firestoreService
      .collection('events')
      .doc(eventId)
      .collection('chat')
      .doc();
    
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
    .onSnapshot((snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      const messages: any[] = [];
      snapshot.forEach((doc: FirebaseFirestoreTypes.DocumentSnapshot) => {
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
    return authStatus === AuthorizationStatus.AUTHORIZED ||
           authStatus === AuthorizationStatus.PROVISIONAL;
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