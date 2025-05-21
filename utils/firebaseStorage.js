import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { initializeFirebase } from '../firebaseInit';

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

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
 * Upload a profile image to Firebase Storage
 * @param {string} username - The username to associate with the image
 * @param {string} imageUri - The local URI of the image
 * @returns {Promise<string|null>} - The download URL or null if failed
 */
export const uploadProfileImage = async (username, imageUri) => {
  try {
    const storage = getStorage();
    const timestamp = new Date().getTime();
    const filename = `profile_${username}_${timestamp}.jpg`;
    const storageRef = ref(storage, `profile_images/${username}/${filename}`);
    
    // Convert URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Upload the blob
    await uploadBytes(storageRef, blob);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Cache the URL with timestamp
    const cacheData = {
      url: downloadURL,
      timestamp: Date.now()
    };
    await AsyncStorage.setItem(`profileImage_${username}`, JSON.stringify(cacheData));
    await AsyncStorage.setItem('profileImage', JSON.stringify(cacheData));
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

/**
 * Get the profile image URL for a user
 * @param {string} username - The username to get the image for
 * @returns {Promise<string|null>} - The image URL or null if not found
 */
export const getProfileImageUrl = async (username) => {
  try {
    // First try to get from cache
    const cachedData = await AsyncStorage.getItem(`profileImage_${username}`);
    if (cachedData) {
      const { url, timestamp } = JSON.parse(cachedData);
      // Check if cache is still valid
      if (Date.now() - timestamp < CACHE_DURATION) {
        return url;
      }
    }
    
    // If not in cache or cache expired, try Firebase
    const storage = getStorage();
    const storageRef = ref(storage, `profile_images/${username}`);
    
    try {
      const files = await listAll(storageRef);
      if (files.items.length > 0) {
        // Get the most recent file
        const latestFile = files.items[files.items.length - 1];
        const downloadURL = await getDownloadURL(latestFile);
        
        // Cache the new URL
        const cacheData = {
          url: downloadURL,
          timestamp: Date.now()
        };
        await AsyncStorage.setItem(`profileImage_${username}`, JSON.stringify(cacheData));
        await AsyncStorage.setItem('profileImage', JSON.stringify(cacheData));
        
        return downloadURL;
      }
    } catch (error) {
      console.error('Error listing Firebase files:', error);
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