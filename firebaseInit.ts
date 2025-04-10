import { initializeApp, getApp, getApps } from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCQvzXJ-qc66HmYCxec6LJqGNvX2VNQHpg",
  projectId: "signmeup-e5e0c",
  storageBucket: "signmeup-e5e0c.firebasestorage.app",
  messagingSenderId: "895428834263",
  appId: "1:895428834263:ios:370a9db4cf3fbc98189192",
  databaseURL: "https://signmeup-e5e0c.firebaseio.com"
};

let isInitializing = false;
let initializationPromise: Promise<any> | null = null;

export const initializeFirebase = async () => {
  if (isInitializing) {
    return initializationPromise;
  }

  isInitializing = true;
  initializationPromise = (async () => {
    try {
      console.log('Initializing Firebase...');
      const apps = getApps();
      if (apps.length > 0) {
        console.log('Firebase already initialized');
        return getApp();
      }
      
      const app = await initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
      return app;
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      isInitializing = false;
      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
};

// Initialize Firebase immediately
const app = initializeFirebase();
export { app }; 