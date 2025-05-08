import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  Alert,
  ScrollView,
  FlatList,
  Linking,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import EncryptedStorage from 'react-native-encrypted-storage'; // For secure password storage
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ProfileContext } from '../ProfileContext'; // Import Profile Context
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StatBox from '../components/StatBox';
import ToggleOption from '../components/ToggleOption';
import DropDownPicker from 'react-native-dropdown-picker';
import { useLanguage } from '../contexts/LanguageContext';
import { safeGetItem, safeSetItem, setLoginStatus, clearLoginStatus } from '../utils/StorageUtils';
import ReCAPTCHA from 'react-native-recaptcha-v3';
import { WebView } from 'react-native-webview';
import { authService, createUser, signIn } from '../config/firebase';
import { verifyCaptcha } from '../utils/captchaUtils';
import Slider from '@react-native-community/slider';

// Define the type for the navigation parameters
type RootStackParamList = {
  Home: undefined;
  MyEvents: undefined;
  CreateEvent: undefined;
  ProfileSetup: { skipWelcome?: boolean };
  UserProfile: undefined;
};

type ProfileSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProfileSetup'>;

// Add type declaration for ReCAPTCHA
declare module 'react-native-recaptcha-v3' {
  interface ReCAPTCHAProps {
    siteKey: string;
    baseUrl: string;
    onVerify: (token: string) => void;
    onError?: (error: Error) => void;
  }
  const ReCAPTCHA: React.FC<ReCAPTCHAProps>;
  export default ReCAPTCHA;
}

const ProfileSetupScreen = ({ route }: { route: { params?: { skipWelcome?: boolean } } }) => {
  const navigation = useNavigation<ProfileSetupScreenNavigationProp>();
  const { profile, updateProfile, signOut } = useContext(ProfileContext); // Access ProfileContext
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    loadProfile();
  }, [navigation]);

  useEffect(() => {
    if (route.params?.skipWelcome) {
      setShowLandingPage(false);
      setIsLoginMode(true);
    }
  }, [route.params]);

  useEffect(() => {
    console.log('Current language:', language);
  }, [language]);

  useEffect(() => {
    generateCaptcha();
  }, []);

  const [name, setName] = useState(profile.name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [profileImage, setProfileImage] = useState(profile.profileImage || '');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [userStats, setUserStats] = useState({
    eventsCreated: 0,
    eventsAttended: 0,
    upcomingEvents: 0
  });
  const [preferences, setPreferences] = useState({
    language: 'English',
    notificationsEnabled: true,
    privacySettings: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    },
    paymentMethods: [],
    subscription: 'free' // or 'premium'
  });
  const [connections, setConnections] = useState({
    friends: [],
    pendingRequests: []
  });
  const [contactInfo, setContactInfo] = useState({
    alternateEmail: '',
    address: '',
    emergencyContact: ''
  });
  const [openLanguagePicker, setOpenLanguagePicker] = useState(false);
  const [languages] = useState([
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
    { label: 'Français', value: 'fr' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showConnectionSearch, setShowConnectionSearch] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaCorrectAnswer, setCaptchaCorrectAnswer] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [targetValue, setTargetValue] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [sliderWidth, setSliderWidth] = useState(300);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const storedUsername = await EncryptedStorage.getItem('username');
      const storedPassword = await EncryptedStorage.getItem('password');
      const userProfile = await EncryptedStorage.getItem('userProfile');
      
      if (storedUsername && storedPassword && userProfile) {
        setIsLoginMode(true); // Just set login mode, don't auto-populate data
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      const options = {
        mediaType: 'photo' as const,
        includeBase64: true,
        maxHeight: 300,
        maxWidth: 300,
      };

      const response = await launchImageLibrary(options);
      console.log('Image picker response:', response);
      
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        console.log('Selected image URI:', source.uri);
        
        // Set the profile image with the full URI
        setProfileImage(source.uri || '');
        
        // If we have a username, save the image to AsyncStorage
        if (username) {
          try {
            await AsyncStorage.setItem(`profileImage_${username}`, source.uri);
            console.log('Saved profile image for user:', username);
          } catch (error) {
            console.error('Error saving profile image:', error);
          }
        }
        
        // Log to verify the image was set
        console.log('Profile image set to:', source.uri);
      }
    } catch (error) {
      console.error('Error in handleImagePicker:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSaveProfile = async () => {
    if (!name || !username || !password || !email) {
      Alert.alert('Missing Information', 'Please fill out all required fields.');
      return;
    }

    try {
      console.log('Saving profile with image:', profileImage);
      const lowerUsername = username.toLowerCase();

      // Get all users
      const allUsersString = await safeGetItem('allUsers');
      let allUsers = allUsersString ? JSON.parse(allUsersString) : [];

      // Check if username already exists
      if (allUsers.some((user: any) => user.username === lowerUsername)) {
        Alert.alert('Username Taken', 'This username is already registered. Please choose another.');
        return;
      }
      
      // Create a user in Firebase Authentication
      try {
        const userCredential = await createUser(email, password);
        console.log('Firebase user created:', userCredential.uid);
      } catch (firebaseError: any) {
        console.error('Failed to create Firebase user:', firebaseError.message);
        
        // Show appropriate error message based on the error
        if (firebaseError.code === 'auth/email-already-in-use') {
          Alert.alert('Email Already Used', 'This email is already registered. Please use another email or login.');
        } else if (firebaseError.code === 'auth/weak-password') {
          Alert.alert('Weak Password', 'Please use a stronger password (at least 6 characters).');
        } else {
          Alert.alert('Error', 'Failed to create account. Please try again.');
        }
        return;
      }

      const newProfile = { 
        name, 
        username: lowerUsername,
        email, 
        phone, 
        profileImage: profileImage || '', // Ensure we have a value even if empty
        password, // Ensure password is stored
        memberSince: new Date().toISOString()
      };

      console.log('New profile to save:', JSON.stringify(newProfile));

      // Store user profile and password
      allUsers.push(newProfile);
      await safeSetItem('allUsers', JSON.stringify(allUsers));
      await safeSetItem(`password_${lowerUsername}`, password);

      // Save profile image separately if it exists
      if (profileImage) {
        await AsyncStorage.setItem(`profileImage_${lowerUsername}`, profileImage);
        console.log('Saved profile image for new user:', lowerUsername);
      }

      // Set login status
      await setLoginStatus(true, lowerUsername);

      // Update profile context with the full profile including image
      updateProfile(newProfile);

      // Navigate to MyEventsScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'MyEvents' }],
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      console.log('========== STARTING LOGIN ==========');
      
      if (!username || !password) {
        Alert.alert('Missing Information', 'Please enter both username and password.');
        return;
      }
      
      const lowerUsername = username.toLowerCase();
      console.log('Attempting login for username:', lowerUsername);
      
      // Get email for this username
      const allUsersString = await safeGetItem('allUsers');
      const allUsers = allUsersString ? JSON.parse(allUsersString) : [];
      const userProfile = allUsers.find((user: any) => user.username === lowerUsername);
      
      if (!userProfile || !userProfile.email) {
        console.log('Login failed: User profile not found');
        Alert.alert('Login Failed', 'User not found. Please check your username.');
        return;
      }
      
      const email = userProfile.email;
      
      // Use Firebase Authentication
      try {
        // Make sure we have strings for email and password
        const safeEmail = email || '';
        const safePassword = password || '';
        const userCredential = await signIn(safeEmail, safePassword);
        console.log('Firebase login successful:', userCredential.uid);
      } catch (firebaseError: any) {
        console.error('Firebase authentication failed:', firebaseError.message);
        Alert.alert('Login Failed', 'Invalid username or password');
        return;
      }
      
      console.log('Login successful for user:', lowerUsername);
      
      // Get the saved profile image from AsyncStorage (this takes priority)
      try {
        console.log('Looking for profile image in AsyncStorage');
        const savedProfileImage = await AsyncStorage.getItem(`profileImage_${lowerUsername}`);
        
        if (savedProfileImage) {
          console.log('Found profile image in AsyncStorage:', savedProfileImage.substring(0, 50) + '...');
          // Update the profile image in the userProfile object
          userProfile.profileImage = savedProfileImage;
        } else if (userProfile.profileImage) {
          console.log('Using profile image from allUsers:', userProfile.profileImage.substring(0, 50) + '...');
          // If AsyncStorage doesn't have an image but allUsers does, save it to AsyncStorage
          await AsyncStorage.setItem(`profileImage_${lowerUsername}`, userProfile.profileImage);
        } else {
          console.log('No profile image found for user');
        }
      } catch (imageError) {
        console.warn('Error retrieving profile image:', imageError);
      }
      
      // Store username using the utility function (Firebase already tracks auth state)
      const loginSuccess = await setLoginStatus(true, lowerUsername);
      if (!loginSuccess) {
        console.error('Failed to set login status');
        Alert.alert('Error', 'Failed to complete login. Please try again.');
        return;
      }
      console.log('Set login status to true for user:', lowerUsername);
      
      // Save the user profile to EncryptedStorage for future reference
      try {
        await EncryptedStorage.setItem('userProfile', JSON.stringify(userProfile));
      } catch (profileError) {
        console.warn('Error saving user profile to EncryptedStorage:', profileError);
      }
      
      // Update profile context with the potentially updated user profile
      updateProfile(userProfile);
      
      // Navigate to UserProfileScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserProfile' }],
      });
      
      console.log('========== FINISHED LOGIN ==========');
    } catch (error) {
      console.error('Error logging in:', error);
      Alert.alert('Error', 'Failed to log in. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    try {
      const storedUsername = await EncryptedStorage.getItem('username');
      if (!storedUsername) {
        Alert.alert('No User Found', 'No account is associated with this app.');
        return;
      }
      Alert.alert(
        'Password Reset',
        'Your password has been reset. Use the temporary password: "temp1234" to log in.',
        [{ text: 'OK' }]
      );
      await EncryptedStorage.setItem('password', 'temp1234'); // Reset to temporary password
    } catch (error) {
      console.log('Error resetting password:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      console.log('========== STARTING SIGN OUT ==========');
      
      // Get the current username before clearing it
      const username = await safeGetItem('username');
      
      // Clear login status using the utility function
      await clearLoginStatus();
      
      // Clear all user-specific data
      if (username) {
        await clearAllUserData(username);
      }
      
      // Force clear the state
      setName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhone('');
      setProfileImage('');
      setIsSignedIn(false);
      setIsLoginMode(true);
      setShowLandingPage(true);
      
      // Use context's signOut method
      await signOut(navigation);
      
      // Force a complete reset of the navigation stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'ProfileSetup' }],
      });
      
      console.log('========== FINISHED SIGN OUT ==========');
    } catch (error) {
      console.error('Error during sign out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const updatePrivacySetting = (setting: string, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [setting]: value
      }
    }));
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleAddPaymentMethod = () => {
    Alert.alert('Coming Soon', 'Payment method functionality will be available soon.');
  };

  const handleUpgradeSubscription = async () => {
    try {
      // For testing, use the App Store URL
      const appStoreUrl = 'https://apps.apple.com/';
      await Linking.openURL(appStoreUrl);
    } catch (error) {
      console.log('Error opening App Store:', error);
      Alert.alert(
        'Error',
        'Unable to open App Store. Please try again later or contact support.'
      );
    }
  };

  const searchUsers = async (query: string) => {
    try {
      console.log('Searching for users with query:', query);
      // Get all stored users
      const allUsers = await EncryptedStorage.getItem('allUsers');
      console.log('All users from storage:', allUsers);
      
      if (allUsers) {
        const users = JSON.parse(allUsers);
        // Filter users based on search query
        const filtered = users.filter((user: any) => 
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.username.toLowerCase().includes(query.toLowerCase())
        ).filter((user: any) => user.username !== profile.username);

        console.log('Filtered users:', filtered);
        setSearchResults(filtered);
      }
    } catch (error) {
      console.log('Error searching users:', error);
    }
  };

  const sendConnectionRequest = async (otherUser: any) => {
    try {
      // Get existing connections
      const existingConnections = await EncryptedStorage.getItem('connections') || '{}';
      const connections = JSON.parse(existingConnections);
      
      // Add to pending requests
      if (!connections[otherUser.username]) {
        connections[otherUser.username] = {
          status: 'pending',
          timestamp: new Date().toISOString()
        };
        
        await EncryptedStorage.setItem('connections', JSON.stringify(connections));
        Alert.alert('Success', 'Connection request sent!');
      } else {
        Alert.alert('Already Connected', 'You have already connected with or sent a request to this user.');
      }
    } catch (error) {
      console.log('Error sending connection request:', error);
      Alert.alert('Error', 'Failed to send connection request');
    }
  };

  const handleLanguageChange = (value: string) => {
    if (value) {
      console.log('Changing language to:', value);
      setLanguage(value);
      updatePreference('language', value);
    }
  };

  // Add a function to clear all form fields
  const clearFormFields = () => {
    setName('');
    setUsername('');
    setPassword('');
    setEmail('');
    setPhone('');
    setProfileImage('');
  };

  // Update the mode switching functions
  const switchToSignUp = () => {
    setIsLoginMode(false);
    setShowLandingPage(false);
    clearFormFields();
  };

  const switchToLogin = () => {
    setIsLoginMode(true);
    setShowLandingPage(false);
    setIsSignedIn(false);
    clearFormFields();
  };

  // Add useEffect to clear fields when component mounts
  useEffect(() => {
    clearFormFields();
  }, []);

  // Replace the checkLoginState useEffect with useFocusEffect
  useFocusEffect(
    React.useCallback(() => {
      const checkLoginState = async () => {
        try {
          const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
          if (isLoggedIn === 'true') {
            const userProfileString = await EncryptedStorage.getItem('userProfile');
            const username = await EncryptedStorage.getItem('username');

            console.log('Profile Check:', {
              isLoggedIn,
              hasProfile: !!userProfileString,
              username
            });

            if (userProfileString && username) {
              const userProfile = JSON.parse(userProfileString);
              setIsSignedIn(true);
              updateProfile(userProfile);
              setUsername(username);
              setName(userProfile.name);
              setEmail(userProfile.email);
              setPhone(userProfile.phone || '');
              setProfileImage(userProfile.profileImage || '');
            }
          } else {
            // Reset state if not logged in
            setIsSignedIn(false);
            setIsLoginMode(true);
            setShowLandingPage(true);
            updateProfile({});
          }
        } catch (error) {
          console.error('Error checking login state:', error);
        }
      };

      checkLoginState();
    }, [])
  );

  // Add this useEffect to handle profile image persistence
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const username = await EncryptedStorage.getItem('username');
        if (username) {
          const userProfileString = await EncryptedStorage.getItem('userProfile');
          if (userProfileString) {
            const userProfile = JSON.parse(userProfileString);
            if (userProfile.profileImage) {
              setProfileImage(userProfile.profileImage);
            }
          }
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    loadProfileImage();
  }, []);

  const handleSignIn = async () => {
    console.log('========== STARTING LOGIN ==========');
    try {
      console.log('Attempting login for username:', username);
      
      // Check username and password
      const storedPassword = await EncryptedStorage.getItem(`password_${username}`);
      
      if (!storedPassword) {
        console.log('Password check: Not found');
        Alert.alert('Error', 'Username or password is incorrect');
        return;
      }
      
      console.log('Password check: Found');
      
      if (storedPassword === password) {
        console.log('Login successful for user:', username);
        
        // Save the username to encrypted storage
        await EncryptedStorage.setItem('username', username);
        
        // Get stored profile data
        const userProfileString = await EncryptedStorage.getItem('userProfile');
        const userProfile = userProfileString ? JSON.parse(userProfileString) : {};
        
        // Look for profile image in AsyncStorage
        console.log('Looking for profile image in AsyncStorage');
        const profileImageKey = `profileImage_${username}`;
        let userProfileImage = await AsyncStorage.getItem(profileImageKey);
        
        if (userProfileImage) {
          console.log('Found profile image in AsyncStorage:', userProfileImage.substring(0, 30) + '...');
          // Also save to generic profileImage key for the nav bar
          await AsyncStorage.setItem('profileImage', userProfileImage);
        } else if (userProfile.profileImage) {
          console.log('Using profile image from userProfile');
          userProfileImage = userProfile.profileImage;
          // Save it to AsyncStorage for future use
          if (userProfileImage) {
            await AsyncStorage.setItem(profileImageKey, userProfileImage);
            await AsyncStorage.setItem('profileImage', userProfileImage);
          }
        }
        
        // Set login status to true
        console.log('Set login status to true for user:', username);
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await EncryptedStorage.setItem('isLoggedIn', 'true');
        
        // Update profile context
        updateProfile({
          name: userProfile.name || '',
          username: username,
          email: userProfile.email || '',
          phone: userProfile.phone || '',
          profileImage: userProfileImage || '',
          memberSince: userProfile.memberSince || new Date().toISOString(),
        });

        // Navigate home
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } else {
        console.log('Password incorrect for user:', username);
        Alert.alert('Error', 'Username or password is incorrect');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      Alert.alert('Error', 'Failed to sign in');
    }
    console.log('========== FINISHED LOGIN ==========');
  };

  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setShowCaptcha(false);
  };

  const handleCaptchaError = (error: any) => {
    console.error('CAPTCHA Error:', error);
    Alert.alert('Error', 'Failed to verify CAPTCHA. Please try again.');
    setShowCaptcha(false);
  };

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10);
    const num2 = Math.floor(Math.random() * 10);
    setCaptchaQuestion(`${num1} + ${num2} = ?`);
    setCaptchaCorrectAnswer(String(num1 + num2));
  };

  useEffect(() => {
    // Generate a random target value between 30 and 70
    setTargetValue(Math.floor(Math.random() * 40) + 30);
  }, []);

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    // Check if the slider is within 5 units of the target
    if (Math.abs(value - targetValue) <= 5) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }
  };

  const handleSignUp = async () => {
    if (!isVerified) {
      Alert.alert('Security Check', 'Please complete the security check by sliding to the correct position');
      return;
    }

    try {
      setIsVerifying(true);
      
      // Verify the user is not a bot using reCAPTCHA v3
      const captchaResult = await verifyCaptcha();
      
      if (!captchaResult.success) {
        Alert.alert('Security Check Failed', 'Please try again');
        return;
      }

      // If captcha verification passed, proceed with signup
      const lowerUsername = username.toLowerCase();

      // Get all users using safeGetItem
      const allUsersString = await safeGetItem('allUsers');
      let allUsers = allUsersString ? JSON.parse(allUsersString) : [];

      // Check if username already exists
      if (allUsers.some((user: any) => user.username === lowerUsername)) {
        Alert.alert('Username Taken', 'This username is already registered. Please choose another.');
        return;
      }

      const newProfile = { 
        username: lowerUsername,
        password,
        email,
        phone,
        profileImage: '',
        memberSince: new Date().toISOString()
      };

      // Store user profile and password using safeSetItem
      allUsers.push(newProfile);
      await safeSetItem('allUsers', JSON.stringify(allUsers));
      await safeSetItem(`password_${lowerUsername}`, password);

      // Set login status
      await setLoginStatus(true, lowerUsername);

      // Update profile context
      updateProfile(newProfile);

      // Navigate to UserProfileScreen
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserProfile' }],
      });
    } catch (error) {
      console.error('Signup Error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const loadUserStats = async () => {
    try {
      console.log('Loading user stats');
      const username = await EncryptedStorage.getItem('username');
      
      if (!username) {
        console.log('No username found, initializing new user stats');
        // Initialize with default values for new users
        setUserStats({
          eventsCreated: 0,
          eventsAttended: 0,
          upcomingEvents: 0
        });
        return;
      }
      
      console.log('Current username:', username);
      
      // Load events created by the user
      const submittedEventsKey = `submittedEvents_${username}`;
      const draftEventsKey = `draftEvents_${username}`;
      
      const submittedEventsJson = await AsyncStorage.getItem(submittedEventsKey);
      const draftEventsJson = await AsyncStorage.getItem(draftEventsKey);
      
      const submittedEvents = submittedEventsJson ? JSON.parse(submittedEventsJson) : [];
      const draftEvents = draftEventsJson ? JSON.parse(draftEventsJson) : [];
      
      const eventsCreated = submittedEvents.length;
      console.log('Events created:', eventsCreated);
      
      // For now, set events attended to 0 directly
      const eventsAttended = 0;
      
      console.log('Setting events attended to 0');
      
      // Update the state with the correct counts
      setUserStats({
        eventsCreated,
        eventsAttended,
        upcomingEvents: 0
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Initialize with default values if there's an error
      setUserStats({
        eventsCreated: 0,
        eventsAttended: 0,
        upcomingEvents: 0
      });
    }
  };

  const clearAllUserData = async (username: string) => {
    if (!username) return;
    
    // Get all keys in AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Find all event-related keys for this user
    const userKeys = allKeys.filter(key => 
      key === `submittedEvents_${username}` || 
      key === `draftEvents_${username}` ||
      key.startsWith(`event_${username}_`)
    );
    
    // Remove all user-specific keys
    if (userKeys.length > 0) {
      await AsyncStorage.multiRemove(userKeys);
      console.log('Cleared user-specific data:', userKeys);
    }
  };

  // Add a useEffect that runs on screen focus to ensure login state is reset
  useFocusEffect(
    React.useCallback(() => {
      const initializeLoginState = async () => {
        try {
          console.log('ProfileSetupScreen focused - resetting login state');
          // Force clear AsyncStorage username to ensure consistent login state
          await AsyncStorage.removeItem('username');
          await AsyncStorage.removeItem('current_username');
          await AsyncStorage.removeItem('fallback_username');
          await AsyncStorage.setItem('isLoggedIn', 'false');
          
          // Force clear EncryptedStorage username
          await EncryptedStorage.setItem('isLoggedIn', 'false');
          await EncryptedStorage.setItem('username', '');
          
          console.log('Login state reset successfully');
        } catch (e) {
          // Silent error handling - username missing is expected during logout
        }
      };
      
      initializeLoginState();
    }, [])
  );

  return (
    <ImageBackground
      source={require('../ios/assets/home.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        {showLandingPage ? (
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome to Sign Me Up</Text>
            <TouchableOpacity 
              style={styles.landingButton}
              onPress={switchToSignUp}
            >
              <Text style={styles.landingButtonText}>Create Account</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.landingButton}
              onPress={switchToLogin}
            >
              <Text style={styles.landingButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loginContainer}>
            <Text style={styles.headerText}>{isLoginMode ? 'Login' : 'Sign Up'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="gray"
              value={username}
              onChangeText={setUsername}
            />
            {!isLoginMode && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="gray"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone"
                  placeholderTextColor="gray"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </>
            )}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                secureTextEntry={!showPassword}
                placeholderTextColor="gray"
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            {!isLoginMode && (
              <View style={styles.captchaContainer}>
                <Text style={styles.captchaQuestion}>
                  Slide the white circle to match the gold circle
                </Text>
                <View style={styles.sliderContainer}>
                  <View 
                    style={styles.sliderTrack}
                    onLayout={(event) => {
                      const { width } = event.nativeEvent.layout;
                      setSliderWidth(width);
                    }}
                  >
                    <View 
                      style={[
                        styles.sliderProgress,
                        { 
                          width: `${sliderValue}%`,
                          backgroundColor: isVerified ? '#4CAF50' : '#007bff'
                        }
                      ]} 
                    />
                    <View 
                      style={[
                        styles.sliderThumb,
                        { 
                          left: `${sliderValue}%`,
                          borderColor: isVerified ? '#4CAF50' : '#007bff'
                        }
                      ]}
                      onStartShouldSetResponder={() => true}
                      onMoveShouldSetResponder={() => true}
                      onResponderMove={(event) => {
                        const { locationX } = event.nativeEvent;
                        const newValue = Math.min(100, Math.max(0, (locationX / sliderWidth) * 100));
                        setSliderValue(newValue);
                        if (newValue >= 80) {
                          setIsVerified(true);
                        } else {
                          setIsVerified(false);
                        }
                      }}
                    />
                    <View style={styles.targetShape} />
                  </View>
                  <View 
                    style={styles.touchArea}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderMove={(event) => {
                      const { locationX } = event.nativeEvent;
                      const newValue = Math.min(100, Math.max(0, (locationX / sliderWidth) * 100));
                      setSliderValue(newValue);
                      if (newValue >= 80) {
                        setIsVerified(true);
                      } else {
                        setIsVerified(false);
                      }
                    }}
                  />
                </View>
              </View>
            )}
            <TouchableOpacity 
              style={[styles.submitButton, isVerifying && styles.disabledButton]} 
              onPress={isLoginMode ? handleLogin : handleSignUp}
              disabled={isVerifying}
            >
              <Text style={styles.submitButtonText}>
                {isVerifying ? 'Verifying...' : (isLoginMode ? 'Log In' : 'Sign Up')}
              </Text>
            </TouchableOpacity>
            {isLoginMode && (
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setIsLoginMode(!isLoginMode)}>
              <Text style={styles.switchModeText}>
                {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  welcomeContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 1)',
    padding: 20,
    borderRadius: 10,
    marginTop: -40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  landingButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
    width: 200,
  },
  landingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 215, 0, 1)', // Changed from 0.9 to 1 for solid gold
    padding: 20,
    borderRadius: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: 'navy',
    borderRadius: 5,
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  switchModeText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  captchaContainer: {
    width: '100%',
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  captchaQuestion: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  sliderContainer: {
    width: '100%',
    height: 60, // Increased height for better touch area
    position: 'relative',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sliderTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'transparent',
    borderRadius: 4,
    position: 'relative',
  },
  touchArea: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    height: 60, // Full height touch area
    backgroundColor: 'transparent',
  },
  sliderProgress: {
    height: '100%',
    borderRadius: 4,
    position: 'absolute',
    left: 0,
    opacity: 0.3,
  },
  sliderThumb: {
    width: 32,
    height: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    position: 'absolute',
    top: -12,
    marginLeft: -16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  targetShape: {
    position: 'absolute',
    right: 0,
    top: -12,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 215, 0, 1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ProfileSetupScreen;
