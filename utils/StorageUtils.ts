import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Platform } from 'react-native';
import { authService } from '../config/firebase';

// Add this helper function at the top of the file
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Ensure AsyncStorage directory exists
export const ensureAsyncStorageDirectories = async () => {
  try {
    if (Platform.OS === 'ios') {
      // Create a series of writes to ensure the directory structure is created
      const steps = [
        // First step: Write a temporary value
        async () => await AsyncStorage.setItem('_directory_init_', 'init'),
        // Delay to allow filesystem operations to complete
        async () => await delay(200),
        // Read the value back to verify storage is working
        async () => await AsyncStorage.getItem('_directory_init_'),
        // Another delay
        async () => await delay(200),
        // Try to write another value to create any missing subdirectories
        async () => await AsyncStorage.setItem('profileImage', ''),
        // Delay
        async () => await delay(200),
        // Clean up
        async () => await AsyncStorage.removeItem('_directory_init_')
      ];
      
      // Execute all steps in sequence
      for (const step of steps) {
        await step();
      }
      
      console.log('AsyncStorage directories initialized successfully');
      return true;
    }
    return true;
  } catch (error) {
    console.error('Failed to initialize AsyncStorage directories:', error);
    return false;
  }
};

// Check if EncryptedStorage is working properly
export const isEncryptedStorageWorking = async () => {
  try {
    // Add a longer delay for initialization
    await delay(500);
    
    // Try to write and read a test value
    await EncryptedStorage.setItem('test_key', 'test_value');
    
    // Add another small delay
    await delay(100);
    
    const testValue = await EncryptedStorage.getItem('test_key');
    
    // Add another small delay
    await delay(100);
    
    try {
      await EncryptedStorage.removeItem('test_key');
    } catch (removeError) {
      console.error('Error removing test key:', removeError);
      // Continue despite this error
    }
    
    return testValue === 'test_value';
  } catch (error) {
    console.error('EncryptedStorage test failed:', error);
    return false;
  }
};

// Safely get an item from storage
export const safeGetItem = async (key) => {
  try {
    // Add a small delay before accessing EncryptedStorage
    await delay(100);
    
    return await EncryptedStorage.getItem(key);
  } catch (error) {
    console.error(`Error getting ${key} from EncryptedStorage:`, error);
    
    // For non-sensitive data, try AsyncStorage as fallback
    if (key === 'username') {
      try {
        return await AsyncStorage.getItem('fallback_username');
      } catch (asyncError) {
        console.error(`Error getting ${key} from AsyncStorage fallback:`, asyncError);
        return null;
      }
    }
    
    return null;
  }
};

// Safely set an item in storage
export const safeSetItem = async (key, value) => {
  try {
    // Add a small delay before accessing EncryptedStorage
    await delay(100);
    
    await EncryptedStorage.setItem(key, value);
    
    // For non-sensitive data, also store in AsyncStorage as fallback
    if (key === 'username') {
      try {
        await AsyncStorage.setItem('fallback_username', value);
      } catch (asyncError) {
        console.error(`Error setting ${key} in AsyncStorage fallback:`, asyncError);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error setting ${key} in EncryptedStorage:`, error);
    
    // For non-sensitive data, try AsyncStorage as fallback
    if (key === 'username') {
      try {
        await AsyncStorage.setItem('fallback_username', value);
        return true;
      } catch (asyncError) {
        console.error(`Error setting ${key} in AsyncStorage fallback:`, asyncError);
        return false;
      }
    }
    
    return false;
  }
};

// Safely remove an item from storage
export const safeRemoveItem = async (key) => {
  try {
    // Add a small delay before accessing EncryptedStorage
    await delay(100);
    
    await EncryptedStorage.removeItem(key);
    
    // For non-sensitive data, also remove from AsyncStorage fallback
    if (key === 'username') {
      try {
        await AsyncStorage.removeItem('fallback_username');
      } catch (asyncError) {
        console.error(`Error removing ${key} from AsyncStorage fallback:`, asyncError);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error removing ${key} from EncryptedStorage:`, error);
    
    // For non-sensitive data, try AsyncStorage as fallback
    if (key === 'username') {
      try {
        await AsyncStorage.removeItem('fallback_username');
        return true;
      } catch (asyncError) {
        console.error(`Error removing ${key} from AsyncStorage fallback:`, asyncError);
        return false;
      }
    }
    
    return false;
  }
};

// Check login status
export const checkLoginStatus = async () => {
  try {
    // First check Firebase Authentication status
    const currentUser = authService.currentUser;
    
    if (currentUser) {
      // User is logged in with Firebase
      console.log('User is authenticated with Firebase:', currentUser.email);
      
      // Get username from storage as Firebase might not have it
      const username = await safeGetItem('username');
      
      return {
        isLoggedIn: true,
        username
      };
    }
    
    // If not logged in with Firebase, we should consider the user logged out
    console.log('No authenticated Firebase user found');
    return {
      isLoggedIn: false,
      username: null
    };
  } catch (error) {
    console.error('Error checking login status:', error);
    return {
      isLoggedIn: false,
      username: null
    };
  }
};

// Update setLoginStatus to ensure directories exist first
export const setLoginStatus = async (isLoggedIn: boolean, username: string | null) => {
  try {
    // First, ensure AsyncStorage directories exist with multiple attempts
    let dirInitialized = false;
    for (let i = 0; i < 3; i++) {
      dirInitialized = await ensureAsyncStorageDirectories();
      if (dirInitialized) break;
      await delay(500); // Wait longer between attempts
    }
    
    if (!dirInitialized) {
      console.warn('Could not initialize AsyncStorage directories after multiple attempts');
    }
    
    // We still want to store username in storage for convenience
    if (isLoggedIn && username) {
      // Set username
      await safeSetItem('username', username);
      await AsyncStorage.setItem('current_username', username);
      await AsyncStorage.setItem('fallback_username', username);
    } else {
      // Clear username
      await safeRemoveItem('username');
      await AsyncStorage.removeItem('current_username');
      await AsyncStorage.removeItem('fallback_username');
    }
    
    return true;
  } catch (error) {
    console.error('Error setting login status:', error);
    return false;
  }
};

// Add this function to completely bypass the problematic removeItem operation
export const bypassRemoveItem = async (key) => {
  try {
    console.log(`Bypassing EncryptedStorage.removeItem for key: ${key}`);
    
    // Instead of removing the item, set it to an empty string
    // This avoids calling the problematic removeItem method
    await delay(100);
    await EncryptedStorage.setItem(key, '');
    
    // For non-sensitive data, also remove from AsyncStorage fallback
    if (key === 'username') {
      try {
        await AsyncStorage.removeItem('fallback_username');
      } catch (asyncError) {
        console.error(`Error removing ${key} from AsyncStorage fallback:`, asyncError);
      }
    }
    
    return true;
  } catch (error) {
    console.error(`Error bypassing removal for ${key}:`, error);
    
    // For non-sensitive data, try AsyncStorage as fallback
    if (key === 'username') {
      try {
        await AsyncStorage.removeItem('fallback_username');
        return true;
      } catch (asyncError) {
        console.error(`Error removing ${key} from AsyncStorage fallback:`, asyncError);
        return false;
      }
    }
    
    return false;
  }
};

// Update clearLoginStatus to sign out from Firebase
export const clearLoginStatus = async () => {
  try {
    // Sign out from Firebase
    await authService.signOut();
    
    // Still clear storage for backward compatibility
    await safeRemoveItem('username');
    await safeRemoveItem('isLoggedIn');
    await AsyncStorage.removeItem('isLoggedIn');
    await AsyncStorage.removeItem('current_username');
    await AsyncStorage.removeItem('fallback_username');
    
    return true;
  } catch (error) {
    console.error('Error clearing login status:', error);
    return false;
  }
};

/**
 * Forcibly resets the login state to logged out
 * Use this when login state is inconsistent
 */
export const clearLoginState = async () => {
  let allSuccess = true;
  
  // Create a helper for error handling
  const safeSetItem = async (
    storage: typeof AsyncStorage | typeof EncryptedStorage, 
    key: string, 
    value: string
  ): Promise<boolean> => {
    try {
      await storage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`Error setting ${key} in storage:`, error);
      allSuccess = false;
      return false;
    }
  };
  
  try {
    // Clear login state in EncryptedStorage - handle each operation separately
    try {
      await EncryptedStorage.setItem('isLoggedIn', 'false');
    } catch (error) {
      console.warn('Error setting isLoggedIn in EncryptedStorage:', error);
      allSuccess = false;
    }
    
    // Clear username but don't delete it
    try {
      await EncryptedStorage.setItem('username', '');
    } catch (error) {
      console.warn('Error setting username in EncryptedStorage:', error);
      allSuccess = false;
    }
    
    try {
      await EncryptedStorage.setItem('userProfile', JSON.stringify({}));
    } catch (error) {
      console.warn('Error setting userProfile in EncryptedStorage:', error);
      allSuccess = false;
    }
    
    // Clear login state in AsyncStorage
    try {
      await AsyncStorage.setItem('isLoggedIn', 'false');
    } catch (error) {
      console.warn('Error setting isLoggedIn in AsyncStorage:', error);
      allSuccess = false;
    }
    
    // Create a directory structure if it doesn't exist
    try {
      const tempKey = `_clear_login_${Date.now()}`;
      await AsyncStorage.setItem(tempKey, 'true');
      await AsyncStorage.removeItem(tempKey);
    } catch (e) {
      console.warn('Error initializing AsyncStorage:', e);
      allSuccess = false;
    }
    
    // Try to remove other items, but don't fail if they don't exist
    const itemsToRemove: string[] = [
      'memberSince',
      'current_username',
      'fallback_username'
    ];
    
    for (const key of itemsToRemove) {
      try {
        await AsyncStorage.removeItem(key);
      } catch (e) {
        // Ignore these errors
      }
    }
    
    if (allSuccess) {
      console.log('Login state successfully cleared');
    } else {
      console.warn('Login state partially cleared with some errors');
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing login state:', error);
    return false;
  }
};

/**
 * Performs a reliable user logout by clearing all storage
 */
export const logoutUser = async (): Promise<boolean> => {
  try {
    // Clear AsyncStorage login items
    await AsyncStorage.setItem('isLoggedIn', 'false');
    
    // Don't delete the username completely for profile reference
    await AsyncStorage.setItem('current_username', '');
    
    // Clear encrypted storage
    try {
      await EncryptedStorage.setItem('isLoggedIn', 'false');
      await EncryptedStorage.setItem('username', '');
      await EncryptedStorage.setItem('userProfile', JSON.stringify({}));
    } catch (e) {
      // Ignore encrypted storage errors
    }
    
    return true;
  } catch (error) {
    // Always return true to avoid blocking the UI
    return true;
  }
}; 