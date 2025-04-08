import React, { createContext, useContext } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';

interface EncryptedStorageContextType {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

const EncryptedStorageContext = createContext<EncryptedStorageContextType | undefined>(undefined);

export const EncryptedStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getItem = async (key: string): Promise<string | null> => {
    try {
      return await EncryptedStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from encrypted storage:', error);
      return null;
    }
  };

  const setItem = async (key: string, value: string): Promise<void> => {
    try {
      await EncryptedStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in encrypted storage:', error);
    }
  };

  const removeItem = async (key: string): Promise<void> => {
    try {
      await EncryptedStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from encrypted storage:', error);
    }
  };

  return (
    <EncryptedStorageContext.Provider value={{ getItem, setItem, removeItem }}>
      {children}
    </EncryptedStorageContext.Provider>
  );
};

export const useEncryptedStorage = () => {
  const context = useContext(EncryptedStorageContext);
  if (context === undefined) {
    throw new Error('useEncryptedStorage must be used within an EncryptedStorageProvider');
  }
  return context;
}; 