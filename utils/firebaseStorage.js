import storage from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirebase } from '../firebaseInit';

// Initialize Firebase if not already initialized
const ensureFirebase = async () => {
  try {
    await initializeFirebase();
    return true;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return false;
  }
};

/**
 * Upload an image to Firebase Storage and return the download URL
 * @param {string} imageUri - The local URI of the image to upload
 * @param {string|null|undefined} username - The username to use in the storage path (optional)
 * @returns {Promise<string|null>} - The download URL of the uploaded image, or null if upload failed
 */
export const uploadProfileImage = async (imageUri, username) => {
  try {
    // Validate parameters
    if (!imageUri) {
      console.warn('Missing imageUri for Firebase upload');
      return null;
    }

    // Use a default username if not provided
    const safeUsername = username || 'anonymous';
    
    // Ensure Firebase is initialized
    const isInitialized = await ensureFirebase();
    if (!isInitialized) {
      console.warn('Firebase not initialized, falling back to AsyncStorage');
      return saveToAsyncStorage(imageUri, safeUsername);
    }

    // Create a unique file name
    const fileName = `profile_${safeUsername}_${Date.now()}.jpg`;
    const storageRef = storage().ref(`profileImages/${safeUsername}/${fileName}`);

    // Upload the file
    await storageRef.putFile(imageUri);

    // Get the download URL
    const downloadURL = await storageRef.getDownloadURL();
    
    // Save the download URL to AsyncStorage as a backup
    await AsyncStorage.setItem('profileImage', downloadURL);
    await AsyncStorage.setItem(`profileImage_${safeUsername}`, downloadURL);
    
    console.log('Image uploaded to Firebase:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image to Firebase:', error);
    
    // Fall back to AsyncStorage if Firebase fails
    const safeUsername = username || 'anonymous';
    return saveToAsyncStorage(imageUri, safeUsername);
  }
};

/**
 * Fallback: Save image URI to AsyncStorage (used when Firebase fails)
 */
const saveToAsyncStorage = async (imageUri, username) => {
  try {
    if (!imageUri) return null;
    
    // Use a default value if username is undefined
    const safeUsername = username || 'anonymous';
    
    // Force directory creation with a write-read-remove sequence
    const tempKey = '_dir_init_' + Date.now();
    await AsyncStorage.setItem(tempKey, 'temp');
    await AsyncStorage.getItem(tempKey);
    await AsyncStorage.removeItem(tempKey);
    
    // Save to multiple locations for redundancy
    try { await AsyncStorage.setItem('profileImage', imageUri); } catch (e) {}
    
    try { await AsyncStorage.setItem(`profileImage_${safeUsername}`, imageUri); } catch (e) {}
    
    return imageUri;
  } catch (error) {
    console.error('Error saving to AsyncStorage:', error);
    return null;
  }
};

/**
 * Get the profile image URL for a user
 * @param {string|null|undefined} username - The username of the user (optional)
 * @returns {Promise<string|null>} - The image URL or null if not found
 */
export const getProfileImageUrl = async (username) => {
  try {
    // First, try to get from AsyncStorage
    const asyncImage = await AsyncStorage.getItem('profileImage');
    if (asyncImage) {
      return asyncImage;
    }
    
    // Use a default username if needed
    const safeUsername = username || 'anonymous';
    
    // Then try username-specific AsyncStorage key
    const userImage = await AsyncStorage.getItem(`profileImage_${safeUsername}`);
    if (userImage) {
      return userImage;
    }
    
    // If not in AsyncStorage, try to fetch from Firebase
    const isInitialized = await ensureFirebase();
    if (!isInitialized) {
      return null;
    }
    
    // Find the most recent profile image in Firebase
    const storageRef = storage().ref(`profileImages/${safeUsername}`);
    try {
      const files = await storageRef.listAll();
      if (files.items.length > 0) {
        // Get the last (most recent) file
        const latestFile = files.items[files.items.length - 1];
        const downloadURL = await latestFile.getDownloadURL();
        
        // Cache the URL in AsyncStorage
        await AsyncStorage.setItem('profileImage', downloadURL);
        await AsyncStorage.setItem(`profileImage_${safeUsername}`, downloadURL);
        
        return downloadURL;
      }
    } catch (e) {
      console.warn('Error listing Firebase files:', e);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile image URL:', error);
    return null;
  }
};

/**
 * Validate and normalize image URI
 * @param {string} uri - The image URI to validate
 * @returns {string|null} - Normalized URI or null if invalid
 */
export const normalizeImageUri = (uri) => {
  if (!uri) return null;
  
  // Clean the URI to avoid issues
  if (typeof uri !== 'string') {
    return null;
  }
  
  // Add proper file:// prefix if missing (for local files)
  if (uri.startsWith('/') && !uri.startsWith('file://')) {
    return `file://${uri}`;
  }
  
  // Fix file paths with too many slashes
  if (uri.startsWith('file:////')) {
    return uri.replace('file:////', 'file:///');
  }
  
  return uri;
}; 