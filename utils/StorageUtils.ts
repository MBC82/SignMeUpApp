import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { Platform } from 'react-native';

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
    const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
    const username = await safeGetItem('username');
    
    return {
      isLoggedIn: isLoggedIn === 'true',
      username
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
    
    // Try with EncryptedStorage first
    try {
      await EncryptedStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
    } catch (encryptedError) {
      console.warn('EncryptedStorage write failed:', encryptedError);
    }
      
    // Also try AsyncStorage as backup with retry mechanism
    let asyncStorageSuccess = false;
    for (let i = 0; i < 3; i++) {
      try {
        await AsyncStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
        asyncStorageSuccess = true;
        break;
      } catch (asyncError) {
        console.warn(`AsyncStorage write attempt ${i+1} failed:`, asyncError);
        await delay(300);
      }
    }
    
    // Set username with retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        if (isLoggedIn && username) {
          // Try EncryptedStorage first
          try {
            await EncryptedStorage.setItem('username', username);
          } catch (encryptedError) {
            console.warn('EncryptedStorage username write failed:', encryptedError);
          }
          
          // Try AsyncStorage backup with retry
          for (let i = 0; i < 3; i++) {
            try {
              await AsyncStorage.setItem('current_username', username);
              await AsyncStorage.setItem('fallback_username', username);
              break;
            } catch (asyncError) {
              console.warn(`AsyncStorage username write attempt ${i+1} failed:`, asyncError);
              await delay(300);
            }
          }
        } else {
          // Clear the username
          try {
            await EncryptedStorage.removeItem('username');
          } catch (e) {}
          
          try {
            await AsyncStorage.removeItem('current_username');
            await AsyncStorage.removeItem('fallback_username');
          } catch (e) {}
        }
        
        return true;
      } catch (error) {
        console.warn(`Attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        
        if (retryCount === maxRetries) {
          console.error('All retry attempts failed:', error);
          return false;
        }
        
        // Wait a bit before retrying
        await delay(1000);
      }
    }
    
    return asyncStorageSuccess;
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

// Update the clearLoginStatus function to use the bypass method
export const clearLoginStatus = async () => {
  try {
    await AsyncStorage.setItem('isLoggedIn', 'false');
    await bypassRemoveItem('username');
    return true;
  } catch (error) {
    console.error('Error clearing login status:', error);
    return false;
  }
}; 