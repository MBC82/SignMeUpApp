import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

// Add this helper function at the top of the file
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// Set login status
export const setLoginStatus = async (isLoggedIn, username) => {
  try {
    await AsyncStorage.setItem('isLoggedIn', isLoggedIn ? 'true' : 'false');
    
    if (isLoggedIn && username) {
      // Set the username
      await safeSetItem('username', username);
      
      // Also store the username in AsyncStorage directly as a backup
      await AsyncStorage.setItem('current_username', username);
    } else {
      // Clear the username
      await bypassRemoveItem('username');
      await AsyncStorage.removeItem('current_username');
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