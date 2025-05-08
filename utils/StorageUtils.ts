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

// -------- NEW CHUNKING & COMPRESSION FUNCTIONS --------

// Maximum size for a single chunk (in characters)
const MAX_CHUNK_SIZE = 100000; // ~100KB per chunk

/**
 * Stores a large object by breaking it into chunks
 * @param key The base key to store the data under
 * @param value The object or string to store
 * @returns Promise<boolean> Whether the operation was successful
 */
export const storeWithChunking = async (key: string, value: any): Promise<boolean> => {
  try {
    // Convert object to string if needed
    const valueString = typeof value === 'string' ? value : JSON.stringify(value);
    
    // Clear any existing chunks for this key
    await clearChunks(key);
    
    // If the value is small enough, store it directly
    if (valueString.length < MAX_CHUNK_SIZE) {
      await AsyncStorage.setItem(key, valueString);
      return true;
    }
    
    // Split the value into chunks
    const chunks = [];
    let index = 0;
    while (index < valueString.length) {
      chunks.push(valueString.slice(index, index + MAX_CHUNK_SIZE));
      index += MAX_CHUNK_SIZE;
    }
    
    // Store metadata about the chunks
    await AsyncStorage.setItem(`${key}_meta`, JSON.stringify({
      chunks: chunks.length,
      totalSize: valueString.length,
      isChunked: true,
      timestamp: Date.now()
    }));
    
    // Store each chunk
    for (let i = 0; i < chunks.length; i++) {
      await AsyncStorage.setItem(`${key}_chunk_${i}`, chunks[i]);
    }
    
    console.log(`Stored ${chunks.length} chunks for key ${key}`);
    return true;
  } catch (error) {
    console.error(`Error storing chunked data for key ${key}:`, error);
    return false;
  }
};

/**
 * Retrieves a potentially chunked value from storage
 * @param key The key to retrieve
 * @returns Promise<any> The retrieved value, or null if not found
 */
export const retrieveWithChunking = async (key: string): Promise<any> => {
  try {
    // Check if this is a chunked value
    const metaString = await AsyncStorage.getItem(`${key}_meta`);
    
    if (!metaString) {
      // Not chunked, retrieve normally
      return await AsyncStorage.getItem(key);
    }
    
    const meta = JSON.parse(metaString);
    
    if (!meta.isChunked) {
      return await AsyncStorage.getItem(key);
    }
    
    // Retrieve all chunks
    let fullValue = '';
    for (let i = 0; i < meta.chunks; i++) {
      const chunk = await AsyncStorage.getItem(`${key}_chunk_${i}`);
      if (chunk) {
        fullValue += chunk;
      } else {
        console.error(`Missing chunk ${i} for key ${key}`);
      }
    }
    
    // Try to parse as JSON if it looks like JSON
    if (fullValue.startsWith('{') || fullValue.startsWith('[')) {
      try {
        return JSON.parse(fullValue);
      } catch (e) {
        // Not valid JSON, return as string
        return fullValue;
      }
    }
    
    return fullValue;
  } catch (error) {
    console.error(`Error retrieving chunked data for key ${key}:`, error);
    return null;
  }
};

/**
 * Clears all chunks for a given key
 * @param key The base key to clear chunks for
 */
export const clearChunks = async (key: string): Promise<void> => {
  try {
    const metaString = await AsyncStorage.getItem(`${key}_meta`);
    if (!metaString) return;
    
    const meta = JSON.parse(metaString);
    
    if (meta.isChunked) {
      // Remove all chunks
      for (let i = 0; i < meta.chunks; i++) {
        await AsyncStorage.removeItem(`${key}_chunk_${i}`);
      }
      
      // Remove the metadata
      await AsyncStorage.removeItem(`${key}_meta`);
    }
  } catch (error) {
    console.error(`Error clearing chunks for key ${key}:`, error);
  }
};

/**
 * Handle image data specifically, with compression for large base64 images
 * @param key The key to store the image under
 * @param imageUri The image URI to store
 */
export const storeProfileImage = async (key: string, imageUri: string): Promise<boolean> => {
  // For profile images, we'll keep them un-chunked but maybe implement size limits
  try {
    // If it's a base64 image and very large, we'll store it using chunking
    if (imageUri.startsWith('data:image') && imageUri.length > MAX_CHUNK_SIZE) {
      return await storeWithChunking(key, imageUri);
    }
    
    // For regular URIs just store directly
    await AsyncStorage.setItem(key, imageUri);
    return true;
  } catch (error) {
    console.error(`Error storing profile image for key ${key}:`, error);
    return false;
  }
};

// Define an interface for Event to avoid 'any' type
export interface EventData {
  id?: string;
  eventId?: string;
  backgroundImage?: string | null;
  createdAt?: number | string;
  [key: string]: any; // For any other properties
}

/**
 * Store event data using chunking for large events
 */
export const storeEventData = async (username: string, events: EventData[], isDraft: boolean = false): Promise<boolean> => {
  const key = isDraft ? `draftEvents_${username}` : `submittedEvents_${username}`;
  
  try {
    // If too many events, limit to most recent 50
    if (events.length > 50) {
      console.warn(`Limiting ${key} to most recent 50 events (was ${events.length})`);
      // Sort by creation time descending and take first 50
      events = events
        .sort((a, b) => {
          const aTime = a.createdAt ? (typeof a.createdAt === 'number' ? a.createdAt : 0) : 0;
          const bTime = b.createdAt ? (typeof b.createdAt === 'number' ? b.createdAt : 0) : 0;
          return bTime - aTime;
        })
        .slice(0, 50);
    }
    
    // Remove large image data if needed
    const compressedEvents = events.map((event: EventData) => {
      // Create a copy of the event
      const compressedEvent = {...event};
      
      // If backgroundImage is very large, store it separately
      if (typeof compressedEvent.backgroundImage === 'string' && 
          compressedEvent.backgroundImage.length > 10000) {
        
        // Store the image separately
        const imageKey = `event_${compressedEvent.id || compressedEvent.eventId}_bg_image`;
        storeProfileImage(imageKey, compressedEvent.backgroundImage);
        
        // Replace with a reference
        compressedEvent.backgroundImage = `__ref__${imageKey}`;
      }
      
      return compressedEvent;
    });
    
    // Store using chunking if needed
    return await storeWithChunking(key, compressedEvents);
  } catch (error) {
    console.error(`Error storing event data for ${key}:`, error);
    return false;
  }
};

/**
 * Retrieve event data with support for chunked storage
 */
export const retrieveEventData = async (username: string, isDraft: boolean = false): Promise<EventData[]> => {
  const key = isDraft ? `draftEvents_${username}` : `submittedEvents_${username}`;
  
  try {
    // Get the events, handling chunking
    const eventsData = await retrieveWithChunking(key);
    
    if (!eventsData) {
      return [];
    }
    
    // Parse the events if they're a string
    const events = typeof eventsData === 'string' ? JSON.parse(eventsData) : eventsData;
    
    // Process any image references
    const processedEvents = await Promise.all(events.map(async (event: EventData) => {
      const processedEvent = {...event};
      
      // Check if backgroundImage is a reference
      if (typeof processedEvent.backgroundImage === 'string' && 
          processedEvent.backgroundImage.startsWith('__ref__')) {
        
        // Get the image key from the reference
        const imageKey = processedEvent.backgroundImage.substring(7);
        try {
          // Retrieve the image
          const imageData = await retrieveWithChunking(imageKey);
          if (imageData) {
            processedEvent.backgroundImage = imageData;
          } else {
            // If image not found, use null
            processedEvent.backgroundImage = null;
          }
        } catch (e) {
          console.error(`Error retrieving image for key ${imageKey}:`, e);
          processedEvent.backgroundImage = null;
        }
      }
      
      return processedEvent;
    }));
    
    return processedEvents;
  } catch (error) {
    console.error(`Error retrieving event data for ${key}:`, error);
    return [];
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
export const safeGetItem = async (key: string) => {
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
export const safeSetItem = async (key: string, value: string) => {
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
export const safeRemoveItem = async (key: string) => {
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
export const bypassRemoveItem = async (key: string) => {
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