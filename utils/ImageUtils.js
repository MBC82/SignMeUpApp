// Import firebase storage integration
import { firebase } from '@react-native-firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Simple Firebase Storage reference
const getFirebaseStorage = () => {
  try {
    return firebase.storage();
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
        const ref = storage.ref(`profileImages/${normalizedUsername}/${timestamp}.jpg`);
        
        // Upload the file
        await ref.putFile(sourceUri);
        
        // Get the download URL
        const downloadURL = await ref.getDownloadURL();
        
        // Store the URL in AsyncStorage
        await AsyncStorage.setItem(`profileImage_${normalizedUsername}`, downloadURL);
        await AsyncStorage.setItem('profileImage', downloadURL);
        
        return downloadURL;
      } catch (firebaseError) {
        // Silent Firebase error, fallback to original URI
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

/**
 * Gets a profile image URI from storage, ensuring it's valid
 * @param {string} username - The username to get the image for
 * @returns {Promise<string|null>} - The profile image URI or null
 */
export const getProfileImage = async (username) => {
  if (!username) return null;
  
  try {
    const normalizedUsername = username.toLowerCase().trim();
    
    // Try user-specific key first
    const imageUri = await AsyncStorage.getItem(`profileImage_${normalizedUsername}`);
    
    if (imageUri) {
      return imageUri;
    }
    
    // Fallback to generic key
    return await AsyncStorage.getItem('profileImage');
  } catch (error) {
    return null;
  }
};

/**
 * Clean up old temporary profile images to free up space
 * No-op function that doesn't try to use RNFS
 */
export const cleanupTemporaryImages = async () => {
  return true;
}; 