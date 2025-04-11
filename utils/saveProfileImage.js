import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Force directory creation
const createDirectories = async () => {
  try {
    // First, write a dummy key to ensure directory exists
    const tempKey = '_dir_init_' + Date.now();
    await AsyncStorage.setItem(tempKey, 'init');
    await AsyncStorage.getItem(tempKey);
    await AsyncStorage.removeItem(tempKey);
    
    // Explicitly write an empty profile image
    await AsyncStorage.setItem('profileImage_dummy', '');
    await AsyncStorage.removeItem('profileImage_dummy');
    
    return true;
  } catch (e) {
    console.error('Error creating directories:', e);
    return false;
  }
};

// Initialize when module loads
createDirectories();

/**
 * Helper to ensure file:// URLs are properly formatted
 */
export const normalizeFileUri = (uri) => {
  if (!uri) return null;
  
  // Clean the URI to avoid issues
  if (typeof uri !== 'string') {
    return null;
  }
  
  // Add proper file:// prefix if missing
  if (uri.startsWith('/') && !uri.startsWith('file://')) {
    return `file://${uri}`;
  }
  
  // Fix file paths with too many slashes
  if (uri.startsWith('file:////')) {
    return uri.replace('file:////', 'file:///');
  }
  
  // Return the uri as is if it's already properly formatted
  return uri;
};

/**
 * Ensures profile image is properly stored in all needed locations
 */
export const fixProfileImage = async () => {
  try {
    // Force create directories first
    await createDirectories();
    
    // Get username
    const username = await AsyncStorage.getItem('username');
    console.log('App initialization - Checking profile image for user:', username);
    
    if (!username) {
      return null;
    }
    
    try {
      // Check available profile images with error handling
      const profileImage = await AsyncStorage.getItem('profileImage');
      const userProfileImage = await AsyncStorage.getItem(`profileImage_${username}`);
      
      console.log('Available images:', {
        generic: profileImage ? 'exists' : 'missing',
        user: userProfileImage ? 'exists' : 'missing'
      });
      
      // Use the best available image
      let bestImage = profileImage || userProfileImage;
      
      if (bestImage) {
        // Normalize the URI
        bestImage = normalizeFileUri(bestImage);
        
        // Save to all locations with error handling
        try { await AsyncStorage.setItem('profileImage', bestImage); } catch (e) {}
        try { await AsyncStorage.setItem(`profileImage_${username}`, bestImage); } catch (e) {}
        
        return bestImage;
      }
    } catch (e) {
      console.warn('Error during profile image check:', e);
    }
    
    return null;
  } catch (error) {
    console.error('Error backing up profile image:', error);
    return null;
  }
};

/**
 * Clear all profile images from storage
 */
export const clearProfileImages = async () => {
  try {
    await AsyncStorage.removeItem('profileImage');
    await AsyncStorage.removeItem('profileImage_backup');
    
    const username = await AsyncStorage.getItem('username');
    if (username) {
      await AsyncStorage.removeItem(`profileImage_${username}`);
    }
    
    console.log('Cleared all profile images');
  } catch (error) {
    console.error('Error clearing profile images:', error);
  }
};

/**
 * Function to directly save a profile image
 */
export const saveProfileImageDirectly = async (imageUri) => {
  try {
    // Force create directories first
    await createDirectories();
    
    // Normalize the URI
    const normalizedUri = normalizeFileUri(imageUri);
    
    if (!normalizedUri) {
      console.warn('Invalid image URI provided');
      return null;
    }
    
    // Get username
    let username;
    try {
      username = await AsyncStorage.getItem('username');
    } catch (e) {
      console.warn('Error getting username:', e);
    }
    
    // Save to all locations with error handling
    const saveOperations = [];
    
    // Main profile image
    saveOperations.push(
      AsyncStorage.setItem('profileImage', normalizedUri)
        .catch(e => console.warn('Failed to save main profile image:', e))
    );
    
    // User-specific profile image
    if (username) {
      saveOperations.push(
        AsyncStorage.setItem(`profileImage_${username}`, normalizedUri)
          .catch(e => console.warn(`Failed to save profile image for ${username}:`, e))
      );
    }
    
    // Wait for all operations to complete
    await Promise.all(saveOperations);
    
    return normalizedUri;
  } catch (error) {
    console.error('Error during profile image save:', error);
    return null;
  }
};
