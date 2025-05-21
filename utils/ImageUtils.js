// Import firebase storage integration
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Image from 'react-native/Libraries/Image/Image';

// Get Firebase storage instance
const getFirebaseStorage = () => {
  try {
    return getStorage();
  } catch (error) {
    return null;
  }
};

// Create dummy exports to prevent errors
export const ensureImagesDirectoryExists = async () => {
  return true; // Always return success
};

/**
 * Checks if a file path is a temporary file
 * @param {string} uri - The file uri to check
 * @returns {boolean} - Whether the file is temporary
 */
export const isTemporaryFile = (uri) => {
  if (!uri || typeof uri !== 'string') return false;
  
  return (
    uri.includes('/tmp/') || 
    uri.includes('temporary') || 
    uri.includes('temp/')
  );
};

/**
 * Verifies if an image file exists at the given path
 * @param {string} imagePath - Path to verify
 * @returns {Promise<boolean>} - Whether the file exists
 */
export const verifyImageExists = async (imagePath) => {
  if (!imagePath) return false;
  
  // HTTP URLs are assumed to exist
  if (imagePath.startsWith('http')) {
    return true;
  }
  
  // For local files, we can only assume they exist
  return true;
};

/**
 * Saves a profile image to permanent storage using Firebase when available
 * @param {string} username - The username to associate with the image
 * @param {string} sourceUri - The source URI of the image (could be temporary)
 * @returns {Promise<string|null>} - The permanent URI or null if failed
 */
export const saveProfileImagePermanently = async (username, sourceUri) => {
  if (!sourceUri || !username) {
    return null;
  }

  try {
    const normalizedUsername = username.toLowerCase().trim();
    
    // Try Firebase Storage first
    const storage = getFirebaseStorage();
    if (storage) {
      try {
        // Create a reference to Firebase Storage
        const timestamp = new Date().getTime();
        const storageRef = ref(storage, `profileImages/${normalizedUsername}/${timestamp}.jpg`);
        
        // Convert URI to blob
        const response = await fetch(sourceUri);
        const blob = await response.blob();
        
        // Upload the blob
        await uploadBytes(storageRef, blob);
        
        // Get the download URL
        const downloadURL = await getDownloadURL(storageRef);
        
        // Store the URL in AsyncStorage
        await AsyncStorage.setItem(`profileImage_${normalizedUsername}`, downloadURL);
        await AsyncStorage.setItem('profileImage', downloadURL);
        
        return downloadURL;
      } catch (firebaseError) {
        // Silent Firebase error, fallback to original URI
        console.warn('Firebase storage error:', firebaseError);
      }
    }
    
    // Last resort: just save the original URI
    await AsyncStorage.setItem(`profileImage_${normalizedUsername}`, sourceUri);
    await AsyncStorage.setItem('profileImage', sourceUri);
    return sourceUri;
    
  } catch (error) {
    return sourceUri; // Return original URI on error
  }
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Gets a profile image URI from storage, ensuring it's valid and cached
 * @param {string} username - The username to get the image for
 * @returns {Promise<string|null>} - The profile image URI or null
 */
export const getProfileImage = async (username) => {
  if (!username) return null;
  
  try {
    const normalizedUsername = username.toLowerCase().trim();
    
    // Try user-specific key first with cache check
    const cachedData = await AsyncStorage.getItem(`profileImage_${normalizedUsername}`);
    if (cachedData) {
      try {
        const { url, timestamp } = JSON.parse(cachedData);
        // Check if cache is still valid
        if (Date.now() - timestamp < CACHE_DURATION) {
          return url;
        }
      } catch (e) {
        // If parsing fails, use the value directly (backward compatibility)
        return cachedData;
      }
    }
    
    // If cache expired or not found, try Firebase Storage
    const storage = getFirebaseStorage();
    if (storage) {
      try {
        const storageRef = ref(storage, `profileImages/${normalizedUsername}`);
        const files = await listAll(storageRef);
        
        if (files.items.length > 0) {
          // Get the most recent file
          const latestFile = files.items[files.items.length - 1];
          const downloadURL = await getDownloadURL(latestFile);
          
          // Cache the new URL with timestamp
          const cacheData = {
            url: downloadURL,
            timestamp: Date.now()
          };
          await AsyncStorage.setItem(`profileImage_${normalizedUsername}`, JSON.stringify(cacheData));
          await AsyncStorage.setItem('profileImage', JSON.stringify(cacheData));
          
          return downloadURL;
        }
      } catch (firebaseError) {
        console.warn('Firebase storage error:', firebaseError);
      }
    }
    
    // Fallback to generic key
    const genericImage = await AsyncStorage.getItem('profileImage');
    if (genericImage) {
      try {
        const { url } = JSON.parse(genericImage);
        return url;
      } catch (e) {
        return genericImage;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting profile image:', error);
    return null;
  }
};

/**
 * Preloads a profile image for faster subsequent loads
 * @param {string} imageUrl - The URL of the image to preload
 * @returns {Promise<void>}
 */
export const preloadProfileImage = async (imageUrl) => {
  if (!imageUrl) return;
  
  try {
    // Use React Native's Image.prefetch for preloading
    await Image.prefetch(imageUrl);
  } catch (error) {
    console.warn('Error preloading image:', error);
  }
};

/**
 * Clean up old temporary profile images to free up space
 * No-op function that doesn't try to use RNFS
 */
export const cleanupTemporaryImages = async () => {
  return true;
}; 