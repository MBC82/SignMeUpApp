import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ImageBackground,
  TouchableWithoutFeedback,
  TextInput,
  Alert,
  Share,
  Linking,
  Switch,
  GestureResponderEvent,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

// Define the types for the navigation parameters
type RootStackParamList = {
  HomeScreen: undefined;
  EventSignUpScreen: {
    eventId: string;
    id: string;
    username: string;
    eventName: string;
    location: string;
    organizer: string;
    address: string;
    eventTime: string;
    neededItems: any[];
    dates: any[];
    timeSlots: any[];
    bgColor: string;
    fontColor: string;
    fontSize: number;
    fontType: string;
    tileColor: string;
    textNotificationsEnabled: boolean;
    organizerPhone: string;
    emailNotificationsEnabled: boolean;
    organizerEmail: string;
    globalNote: string;
    slotLabels: {[key: number]: string};
    backgroundImage?: { uri: string } | null;
    textShadowEnabled: boolean;
    isTimeSlot: boolean;
    isNewEvent: boolean;
    isPreview: boolean;
    isEditing?: boolean;
    headerTileColor?: string;
    headerFontColor?: string;
    tileNames?: Array<{
      names: string[];
      includeNumbers: boolean;
    }>;
    editedTiles?: {[key: string]: boolean};
    onSubmit?: (data: any, isDraft?: boolean) => Promise<void> | void;
    screenBgColor?: string;
    modalFontColor?: string;
    modalFontSize?: number;
    modalFontType?: string;
    modalTileColor?: string;
  };
};

// Add local backgrounds at the top of the file
const localBackgrounds = {
  classic: require('../ios/assets/navy.jpg'),
  teacher2: require('../ios/assets/classicteacher.jpg'),
  modern: require('../ios/assets/classic.jpg'),
  playful: require('../ios/assets/dreamy.jpg'),
  elegant: require('../ios/assets/elegant.jpg'),
  sporty: require('../ios/assets/sporty.jpg'),
  darkmode: require('../ios/assets/darkmode.jpg'),
};

interface DateData {
  date: string;
  signups: number;
  isTimeSlot?: boolean;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

type TileNamesState = string[][];
type NotesState = string[][];
type ShowNotesState = boolean[][];
type TimeSlotsState = TimeSlot[][];

type RouteParams = {
  eventId?: string;
  id?: string;
  username?: string;
  eventName?: string;
  location?: string;
  organizer?: string;
  address?: string;
  eventTime?: string;
  neededItems?: string[];
  dates?: DateData[];
  timeSlots?: TimeSlot[][];
  bgColor?: string;
  fontColor?: string;
  fontSize?: number;
  fontType?: string;
  tileColor?: string;
  textNotificationsEnabled?: boolean;
  organizerPhone?: string;
  emailNotificationsEnabled?: boolean;
  organizerEmail?: string;
  globalNote?: string;
  slotLabels?: Record<string, string>;
  backgroundImage?: string | null;
  textShadowEnabled?: boolean;
  isTimeSlot?: boolean;
  isNewEvent?: boolean;
  isPreview?: boolean;
  isEditing?: boolean;
  headerTileColor?: string;
  headerFontColor?: string;
  screenBgColor?: string;
  modalFontColor?: string;
  modalFontSize?: number;
  modalFontType?: string;
  modalTileColor?: string;
  onSubmit?: (data: any) => void;
};

type SignupData = {
  username: string;
  name: string;
};

type SignupsState = {
  [dateIndex: number]: {
    [slotIndex: number]: SignupData;
  };
};

const EventSignUpScreen: React.FC<{ route: { params: RouteParams } }> = ({ route }) => {
  // Extract parameters safely using optional chaining
  const params = route?.params || {};
  
  const {
    eventId = '',
    id = '',
    username = '',
    eventName = '',
    location = '',
    organizer = '',
    address = '',
    eventTime = '',
    neededItems = [],
    dates = [],
    timeSlots: initialTimeSlots = [],
    bgColor = 'white',
    fontColor = 'black',
    fontSize = 16,
    fontType = 'sans-serif',
    tileColor = '#f0f0f0',
    textNotificationsEnabled = false,
    organizerPhone = '',
    emailNotificationsEnabled = false,
    organizerEmail = '',
    globalNote = '',
    slotLabels = {},
    backgroundImage = null,
    textShadowEnabled = false,
    isTimeSlot = false,
    isNewEvent = false,
    isPreview = false,
    isEditing = false,
    headerTileColor = 'rgba(0, 0, 0, 0.7)',
    headerFontColor = 'white',
    screenBgColor = 'white',
    modalFontColor = 'black',
    modalFontSize = 16,
    modalFontType = 'sans-serif',
    modalTileColor = '#f0f0f0'
  } = params;

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [currentScreenBgColor, setCurrentScreenBgColor] = useState(screenBgColor);
  const [currentModalFontColor, setCurrentModalFontColor] = useState(modalFontColor);
  const [currentModalFontSize, setCurrentModalFontSize] = useState(modalFontSize);
  const [currentModalFontType, setCurrentModalFontType] = useState(modalFontType);
  const [currentModalTileColor, setCurrentModalTileColor] = useState(modalTileColor);
  const [currentHeaderTileColor, setCurrentHeaderTileColor] = useState(headerTileColor);
  const [currentHeaderFontColor, setCurrentHeaderFontColor] = useState(headerFontColor);
  const [signups, setSignups] = useState<SignupsState>({});
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [wantsReminders, setWantsReminders] = useState(false);
  const [participantNames, setParticipantNames] = useState<string[][]>(
    dates.map(date => Array(date.signups).fill(''))
  );
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tileNames, setTileNames] = useState<TileNamesState>([]);
  const [editedTiles, setEditedTiles] = useState<boolean[][]>([]);
  const [notes, setNotes] = useState<NotesState>([]);
  const [showNotes, setShowNotes] = useState<ShowNotesState>([]);
  const [applyToAll, setApplyToAll] = useState(false);
  const [applyNumbers, setApplyNumbers] = useState(false);
  const [applyToAllTimeSlots, setApplyToAllTimeSlots] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDateIndex, setEditDateIndex] = useState<number | null>(null);
  const [editSlotIndex, setEditSlotIndex] = useState<number | null>(null);

  // Initialize timeSlots from route params
  const timeSlots = initialTimeSlots;

  // Add useEffect to load tileNames from route params
  useEffect(() => {
    if (route.params?.dates) {
      const initialTileNames = route.params.dates.map((date: DateData) => 
        Array(date.signups || 1).fill('')
      );
      const initialEditedTiles = route.params.dates.map((date: DateData) => 
        Array(date.signups || 1).fill(false)
      );
      const initialNotes = route.params.dates.map((date: DateData) => 
        Array(date.signups || 1).fill('')
      );
      const initialShowNotes = route.params.dates.map((date: DateData) => 
        Array(date.signups || 1).fill(false)
      );
      setTileNames(initialTileNames);
      setEditedTiles(initialEditedTiles);
      setNotes(initialNotes);
      setShowNotes(initialShowNotes);
    }
  }, [route.params?.dates]);

  // Apply theme styling from route params
  useEffect(() => {
    if (route.params) {
      setCurrentScreenBgColor(route.params.screenBgColor || screenBgColor);
      setCurrentModalFontColor(route.params.modalFontColor || modalFontColor);
      setCurrentModalFontSize(route.params.modalFontSize || modalFontSize);
      setCurrentModalFontType(route.params.modalFontType || modalFontType);
      setCurrentModalTileColor(route.params.modalTileColor || modalTileColor);
      setCurrentHeaderTileColor(route.params.headerTileColor || headerTileColor);
      setCurrentHeaderFontColor(route.params.headerFontColor || headerFontColor);
    }
  }, [route.params]);

  const handleShare = async () => {
    try {
      // Get the current username
      const currentUsername = await EncryptedStorage.getItem('username');
      
      // Check if the current user is the event creator
      if (currentUsername === username || isCreator) {
        // If the current user is the creator, allow direct sharing
        const result = await Share.share({
          message: `Join me at ${eventName}!\nLocation: ${location}\nOrganizer: ${organizer}\nDate: ${eventTime}`,
          title: eventName,
        });
        
        if (result.action === Share.sharedAction) {
          if (result.activityType) {
            console.log('shared with activity type of', result.activityType);
          } else {
            console.log('shared');
          }
        } else if (result.action === Share.dismissedAction) {
          console.log('dismissed');
        }
      } else {
        // If the current user is not the creator, request permission from the creator
        if (textNotificationsEnabled && organizerPhone) {
          // Send a text message to the creator requesting permission to share
          const message = `Hi ${organizer}, I'd like to share your event "${eventName}" with others. Please reply to grant permission.`;
          
          try {
            const url = `sms:${organizerPhone}?body=${encodeURIComponent(message)}`;
            await Linking.openURL(url);
            Alert.alert('Permission Request Sent', 'A message has been sent to the event creator requesting permission to share this event.');
          } catch (error) {
            console.error('Error sending permission request:', error);
            Alert.alert('Error', 'Unable to send permission request to the event creator.');
          }
        } else if (emailNotificationsEnabled && organizerEmail) {
          // Send an email to the creator requesting permission to share
          const subject = `Permission Request: Share Event "${eventName}"`;
          const body = `Hi ${organizer},\n\nI'd like to share your event "${eventName}" with others. Please reply to grant permission.\n\nThank you!`;
          
          try {
            const url = `mailto:${organizerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            await Linking.openURL(url);
            Alert.alert('Permission Request Sent', 'An email has been sent to the event creator requesting permission to share this event.');
          } catch (error) {
            console.error('Error sending permission request:', error);
            Alert.alert('Error', 'Unable to send permission request to the event creator.');
          }
        } else {
          // If no contact method is available, show an error message
          Alert.alert('Permission Required', 'Only the event creator can share this event. Contact the organizer directly for permission.');
        }
      }
    } catch (error) {
      console.error('Error handling share:', error);
      Alert.alert('Error', 'Something went wrong when trying to share the event');
    }
  };

  const handleSignUpPress = (dateIndex: number, slotIndex: number, name: string) => {
    setSelectedDateIndex(dateIndex);
    setSelectedSlot(slotIndex);
    setModalVisible(true);
  };

  const handleUnSignPress = (dateIndex: number) => {
    showUnsignConfirmation(dateIndex);
  };

  // Add this function to handle unsign confirmation
  const showUnsignConfirmation = (dateIndex: number) => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to remove your signup?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Yes, Remove',
          onPress: () => handleUnsign(dateIndex)
        }
      ]
    );
  };

  // Add the handleUnsign function
  const handleUnsign = async (dateIndex: number) => {
    try {
      const dateId = dates[dateIndex].date;
      
      // Look for the current user's signup in this date
      const existingSignups = await AsyncStorage.getItem(`eventSignups_${eventId}`);
      if (!existingSignups) return;

      let allSignups = JSON.parse(existingSignups);
      
      if (allSignups[dateId]) {
        // Find the slot where the current user is signed up
        const currentUsername = await EncryptedStorage.getItem('username') || 'guest';
        
        for (const slotIndex in allSignups[dateId]) {
          const signup = allSignups[dateId][slotIndex];
          
          if ((typeof signup === 'object' && signup.username === currentUsername) || 
              (typeof signup === 'string' && signup === currentUserName)) {
            // Found the current user's signup, remove it
            delete allSignups[dateId][slotIndex];
            
            // Save updated signups
            await AsyncStorage.setItem(`eventSignups_${eventId}`, JSON.stringify(allSignups));
            
            // Update local state
            setSignups(allSignups);
            
            Alert.alert('Success', 'You have been removed from this slot');
            return;
          }
        }
        
        Alert.alert('Not Found', 'You are not signed up for this date');
      }
    } catch (error) {
      console.error('Error unsigning:', error);
      Alert.alert('Error', 'Failed to remove signup');
    }
  };

  const sendOrganizerNotification = async (name: string, dateIndex: number, slotIndex: number) => {
    if (!textNotificationsEnabled || !organizerPhone) return;

    const timeSlotText = timeSlots[dateIndex]?.[slotIndex] ? 
      `${timeSlots[dateIndex][slotIndex].startTime} - ${timeSlots[dateIndex][slotIndex].endTime}` : 
      'no specific time';

    // Use a standard URL format instead of createURL
    const appUrl = 'https://signmeup.app/event';
    const message = `New signup for ${eventName}!\n\n${name} has signed up for ${dates[dateIndex].date} at ${timeSlotText}.\n\nView all signups: ${appUrl}`;

    try {
      const url = `sms:${organizerPhone}?body=${encodeURIComponent(message)}`;
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleConfirmSignUp = async () => {
    if (!attendeeName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      // Create signup data
      const signupData = {
        name: attendeeName,
        phoneNumber: phoneNumber,
        wantsReminders: wantsReminders,
        username: await EncryptedStorage.getItem('username') || 'guest'
      };

      // Get existing signups for THIS specific event
      const existingSignups = await AsyncStorage.getItem(`eventSignups_${eventId}`);
      let allSignups = existingSignups ? JSON.parse(existingSignups) : {};

      // Initialize the date index if it doesn't exist
      if (selectedDateIndex !== null) {
        if (!allSignups[selectedDateIndex]) {
          allSignups[selectedDateIndex] = {};
        }

        // Add signup to the selected slot
        if (selectedSlot !== null) {
          allSignups[selectedDateIndex][selectedSlot] = signupData;
        }

        // Save updated signups for THIS specific event
        await AsyncStorage.setItem(`eventSignups_${eventId}`, JSON.stringify(allSignups));

        // Update local state
        setSignups(allSignups);
        setCurrentUserName(attendeeName);
      }

      // Save the current user name for future use
      await AsyncStorage.setItem('currentUserName', attendeeName);

      // Close modal and reset fields
      setModalVisible(false);
      setAttendeeName('');
      setPhoneNumber('');
      setWantsReminders(false);

      Alert.alert('Success', 'You have successfully signed up!');
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Error', 'Failed to sign up');
    }
  };

  const handleNameChange = (dateIndex: number, slotIndex: number, name: string) => {
    const updatedNames = [...participantNames];
    updatedNames[dateIndex][slotIndex] = name;
    setParticipantNames(updatedNames);
  };

  // Update AsyncStorage getItem implementation to handle null values
  const getItemSafely = async (key: string, defaultValue: string = '') => {
    const value = await AsyncStorage.getItem(key);
    return value !== null ? value : defaultValue;
  };

  // Fix the handleSlotLabelChange function
  const handleSlotLabelChange = async (slotIndex: number, newLabel: string) => {
    try {
      // Update the local state
      const updatedSlotLabels = { ...slotLabels };
      updatedSlotLabels[slotIndex] = newLabel;

      // Get the username
      const username = await EncryptedStorage.getItem('username') || '';
      if (!username) {
        console.error('No username found');
        return;
      }

      // Save to storage
      const eventKey = `event_${eventId}_slotLabels`;
      await AsyncStorage.setItem(eventKey, JSON.stringify(updatedSlotLabels));

      // If this is the organizer, update the event data
      if (username === route.params.username) {  // Use route.params instead of eventData
        const storedEvents = await getItemSafely(`submittedEvents_${username}`, '[]');
        const submittedEvents = JSON.parse(storedEvents);
        const eventIndex = submittedEvents.findIndex((e: any) => e.id === eventId);
        
        if (eventIndex !== -1) {
          submittedEvents[eventIndex].slotLabels = updatedSlotLabels;
          await AsyncStorage.setItem(`submittedEvents_${username}`, JSON.stringify(submittedEvents));
        }
      }
    } catch (error) {
      console.error('Error saving slot label:', error);
      Alert.alert('Error', 'Failed to save slot label');
    }
  };

  const renderSlotsOrAttendees = (date: DateData, dateIndex: number) => {
    const slots = Array(date.signups).fill(null);
    return slots.map((_, slotIndex: number) => {
      const slotId = `${dateIndex}-${slotIndex}`;
      const isTaken = signups[dateIndex]?.[slotIndex] !== undefined;
      const signupData = signups[dateIndex]?.[slotIndex] as SignupData | undefined;
      const signupUsername = signupData?.username;
      const isCurrentUserSlot = signupUsername === currentUserName;
      const attendeeName = signupData?.name || '';

      return (
        <View key={slotId} style={[styles.slotTile, { backgroundColor: modalTileColor, opacity: 0.9 }]}>
          <View style={styles.slotContent}>
            <Text style={[
              styles.slotText,
              {
                fontSize: currentModalFontSize,
                fontFamily: currentModalFontType,
                color: currentModalFontColor,
                ...(textShadowEnabled ? {
                  textShadowColor: 'rgba(0, 0, 0, 0.75)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                } : {})
              }
            ]}>
              {attendeeName || 'Available'}
            </Text>
            {isTaken ? (
              <TouchableOpacity
                style={[styles.signUpButton, { backgroundColor: isCurrentUserSlot ? 'navy' : 'gold' }]}
                onPress={() => handleSlotPress(dateIndex, slotIndex)}
              >
                <Text style={[styles.signUpButtonText, { color: isCurrentUserSlot ? 'white' : 'navy' }]}>
                  {isCurrentUserSlot ? 'Cancel' : 'Taken'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => handleSlotPress(dateIndex, slotIndex)}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    });
  };

  useEffect(() => {
    const loadEventData = async () => {
      try {
        console.log('Loading event data in EventSignUpScreen');
        
        // Check if this is a new event
        const isNewEvent = route.params?.isNewEvent === true;
        console.log('Is this a new event?', isNewEvent);
        
        // Apply theme styling from route params
        if (route.params) {
          // Apply background color
          if (route.params.bgColor) {
            setCurrentScreenBgColor(route.params.bgColor);
          }
          
          // Apply font color
          if (route.params.fontColor) {
            setCurrentModalFontColor(route.params.fontColor);
          }
          
          // Apply font size
          if (route.params.fontSize) {
            setCurrentModalFontSize(route.params.fontSize);
          }
          
          // Apply font type
          if (route.params.fontType) {
            setCurrentModalFontType(route.params.fontType);
          }
          
          // Apply tile color
          if (route.params.tileColor) {
            setCurrentModalTileColor(route.params.tileColor);
          }
          
          // Apply header tile color if available
          if (route.params.headerTileColor) {
            setCurrentHeaderTileColor(route.params.headerTileColor);
          } else if (route.params.tileColor) {
            // Fall back to regular tile color if header tile color is not available
            setCurrentHeaderTileColor(route.params.tileColor);
          }
          
          // Apply header font color if available
          if (route.params.headerFontColor) {
            setCurrentHeaderFontColor(route.params.headerFontColor);
          } else if (route.params.fontColor) {
            // Fall back to regular font color if header font color is not available
            setCurrentHeaderFontColor(route.params.fontColor);
          }
          
          // Background image is already set via route params and applied directly in the JSX
          console.log('Background image from route params:', route.params.backgroundImage ? 'Provided' : 'Not provided');
          
          // Text shadow is already set via route params and applied directly in the JSX
          console.log('Text shadow enabled:', route.params.textShadowEnabled ? 'Yes' : 'No');
          
          console.log('Theme applied from route params:', {
            bgColor: route.params.bgColor,
            fontColor: route.params.fontColor,
            fontSize: route.params.fontSize,
            fontType: route.params.fontType,
            tileColor: route.params.tileColor,
            textShadowEnabled: route.params.textShadowEnabled
          });
        }
        
        if (isNewEvent) {
          // For new events, don't try to load existing signups
          console.log('New event - not loading existing signups');
          setIsLoading(false);
          return;
        }
        
        // For existing events, load the signups
        const eventId = route.params?.eventId;
        console.log('Event ID:', eventId);
        
        if (!eventId) {
          console.log('No event ID provided');
          setIsLoading(false);
          return;
        }
        
        // Load signups for this event
        const signupsKey = `signups_${eventId}`;
        const storedSignups = await AsyncStorage.getItem(signupsKey);
        console.log('Stored signups:', storedSignups ? 'Found' : 'Not found');
        
        if (storedSignups) {
          const parsedSignups = JSON.parse(storedSignups);
          console.log('Number of signups loaded:', parsedSignups.length);
          setSignups(parsedSignups);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading event data:', error);
        setIsLoading(false);
      }
    };
    
    loadEventData();
  }, [route.params]);

  useEffect(() => {
    const loadSlotLabels = async () => {
      try {
        const eventKey = `event_${eventId}_slotLabels`;
        const savedLabels = await AsyncStorage.getItem(eventKey);
        if (savedLabels) {
          const parsedLabels = JSON.parse(savedLabels);
          // No need to call setSlotLabels since we removed it
          // Just use the slotLabels from route.params
        }
      } catch (error) {
        console.error('Error loading slot labels:', error);
      }
    };

    loadSlotLabels();
  }, [eventId, slotLabels]);  // Update dependencies to use route.params.slotLabels

  useEffect(() => {
    const checkIfCreator = async () => {
      try {
        const currentUsername = await EncryptedStorage.getItem('username');
        // Check if the current user is the organizer of the event
        const isOrganizer = currentUsername === username;
        setIsCreator(isOrganizer);
        console.log('Current user is organizer:', isOrganizer);
      } catch (error) {
        console.error('Error checking if creator:', error);
      }
    };
    
    checkIfCreator();
  }, [username]);

  // Add this useEffect to load and apply the theme when editing
  useEffect(() => {
    // Check if we're editing an event
    if (route.params?.isEditing) {
      console.log('Editing event - applying theme from params');
      
      // Apply the theme from the route params
      if (route.params.bgColor) setCurrentScreenBgColor(route.params.bgColor);
      if (route.params.fontColor) setCurrentModalFontColor(route.params.fontColor);
      if (route.params.fontSize) setCurrentModalFontSize(route.params.fontSize);
      if (route.params.fontType) setCurrentModalFontType(route.params.fontType);
      if (route.params.tileColor) setCurrentModalTileColor(route.params.tileColor);
      
      // Log the theme values for debugging
      console.log('Theme values:', {
        bgColor: route.params.bgColor,
        fontColor: route.params.fontColor,
        fontSize: route.params.fontSize,
        fontType: route.params.fontType,
        tileColor: route.params.tileColor,
      });
    }
  }, [route.params]);

  // Add this function to handle different types of backgroundImage
  const getBackgroundImageSource = () => {
    if (!backgroundImage) {
      return localBackgrounds.classic;
    }
    
    if (typeof backgroundImage === 'string') {
      return { uri: backgroundImage };
    }
    
    if (typeof backgroundImage === 'number') {
      // Map the theme number to the correct background
      switch (backgroundImage) {
        case 1:
          return localBackgrounds.classic;
        case 2:
          return localBackgrounds.modern;
        case 3:
          return localBackgrounds.playful;
        case 4:
          return localBackgrounds.elegant;
        case 5:
          return localBackgrounds.sporty;
        case 6:
          return localBackgrounds.darkmode;
        default:
          return localBackgrounds.classic;
      }
    }
    
    // If it's already an object with a uri property, use it as is
    return backgroundImage;
  };

  // Update the renderSlot function to show if a slot is taken
  const renderSlot = (dateId: string | number, slotId: string | number, slotData: any) => {
    const numericDateId = typeof dateId === 'string' ? parseInt(dateId) : dateId;
    const numericSlotId = typeof slotId === 'string' ? parseInt(slotId) : slotId;
    
    const isTaken = signups[numericDateId]?.[numericSlotId] !== undefined;
    const signupData = signups[numericDateId]?.[numericSlotId];
    const signupUsername = signupData?.username;
    const isCurrentUserSlot = signupUsername === currentUserName;
    
    return (
      <TouchableOpacity
        style={[
          styles.slot,
          isTaken && styles.takenSlot,
          isCurrentUserSlot && styles.currentUserSlot,
        ]}
        onPress={() => handleSlotPress(numericDateId, numericSlotId)}
        disabled={isTaken && !isCurrentUserSlot}
      >
        {isTaken && <View style={styles.signedUpOverlay} />}
        
        <Text style={styles.slotTitle}>
          {slotData.title || `Slot ${numericSlotId}`}
        </Text>
        
        {isTaken ? (
          <View style={styles.takenSlotInfo}>
            <Text style={styles.takenByText}>
              Taken by: {signupData?.name || 'Unknown'}
            </Text>
            {isCurrentUserSlot && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelSignup(numericDateId, numericSlotId)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => handleSignUpPress(numericDateId, numericSlotId, attendeeName)}
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // Add this function to handle canceling a signup
  const handleCancelSignup = async (dateId: string | number, slotId: string | number) => {
    try {
      // Remove the signup
      const updatedSignups = { ...signups };
      
      if (updatedSignups[dateId] && updatedSignups[dateId][slotId]) {
        delete updatedSignups[dateId][slotId];
        
        // If there are no more signups for this date, remove the date entry
        if (Object.keys(updatedSignups[dateId]).length === 0) {
          delete updatedSignups[dateId];
        }
        
        setSignups(updatedSignups);
        
        // Save updated signups to AsyncStorage
        await AsyncStorage.setItem(`eventSignups_${eventId}`, JSON.stringify(updatedSignups));
        
        Alert.alert('Success', 'The signup has been canceled.');
      }
    } catch (error) {
      console.error('Error canceling signup:', error);
      Alert.alert('Error', 'Failed to cancel signup. Please try again.');
    }
  };

  // Update the renderDate function to add more space
  const renderDate = (date: DateData, index: number) => {
    return (
      <View key={index} style={styles.dateTile}>
        <View style={[
          styles.dateHeader,
          {
            backgroundColor: currentHeaderTileColor,
            opacity: 0.9,
            borderColor: 'gold',
            borderWidth: 2,
            padding: 8,
            borderRadius: 25,
            overflow: 'hidden',
            width: '65%',
            alignSelf: 'center',
          }
        ]}>
          <Text style={[
            styles.dateText,
            {
              fontSize: currentModalFontSize + 4,
              fontFamily: currentModalFontType,
              color: currentModalFontColor,
              textAlign: 'center',
              fontWeight: 'bold',
              ...(textShadowEnabled ? {
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              } : {})
            }
          ]}>
            {typeof date.date === 'string' ? date.date : ''}
          </Text>
        </View>
        <View style={styles.slotsContainer}>
          {renderSlotsOrAttendees(date, index)}
        </View>
      </View>
    );
  };

  const navigation = useNavigation();

  const handleSubmit = async (isDraft = false) => {
    try {
      // Prepare the event data
      const eventData = {
        eventId,
        id,
        username,
        eventName,
        location,
        organizer,
        address,
        eventTime,
        neededItems,
        dates,
        timeSlots,
        bgColor,
        fontColor,
        fontSize,
        fontType,
        tileColor,
        textNotificationsEnabled,
        organizerPhone,
        emailNotificationsEnabled,
        organizerEmail,
        globalNote,
        slotLabels,
        backgroundImage,
        textShadowEnabled,
        isTimeSlot,
        isNewEvent,
        isPreview,
        isEditing,
        headerTileColor,
        headerFontColor,
        updatedTimeSlots: timeSlots // Pass the updated time slots
      };

      // Check if onSubmit function exists before calling it
      if (route.params.onSubmit && typeof route.params.onSubmit === 'function') {
        console.log('Calling onSubmit callback function');
        await route.params.onSubmit(eventData, isDraft);
      } else {
        console.log('No onSubmit callback function provided');
      }

      // Navigate back to the SignUpScreen
      navigation.navigate('SignUpScreen', {
        ...route.params,
        updatedTimeSlots: timeSlots // Pass the updated time slots
      });
    } catch (error) {
      console.error('Error submitting event:', error);
      Alert.alert('Error', 'Failed to submit event');
    }
  };

  // Fix the AsyncStorage item handling for null check
  const saveCurrentUserNameToStorage = async (name: string) => {
    if (name) {
      await AsyncStorage.setItem('currentUserName', name);
    }
  };

  // Update where the AsyncStorage item is used to handle null
  const handleEventResponse = (e: GestureResponderEvent) => {
    // Handle event response logic
  };

  // Add the handleSlotPress function
  const handleSlotPress = (dateId: string | number, slotId: string | number) => {
    const numericDateId = typeof dateId === 'string' ? parseInt(dateId) : dateId;
    const numericSlotId = typeof slotId === 'string' ? parseInt(slotId) : slotId;
    
    const isTaken = signups[numericDateId]?.[numericSlotId] !== undefined;
    const signupData = signups[numericDateId]?.[numericSlotId];
    const signupUsername = signupData?.username;
    const isCurrentUserSlot = signupUsername === currentUserName;
    
    if (isTaken) {
      if (isCurrentUserSlot) {
        // Allow canceling if it's the current user's slot
        Alert.alert(
          'Cancel Signup',
          'Would you like to cancel your signup for this slot?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => handleCancelSignup(numericDateId, numericSlotId) }
          ]
        );
      } else {
        // Show who took the slot if it's taken by someone else
        const name = signupData?.name || 'Unknown';
        Alert.alert('Slot Taken', `This slot is already taken by ${name}`);
      }
    } else {
      // If not taken, show sign-up modal
      setSelectedDateIndex(numericDateId);
      setSelectedSlot(numericSlotId);
      setModalVisible(true);
    }
  };

  const handleNoteChange = (dateIndex: number, slotIndex: number, text: string) => {
    const newNotes = [...notes];
    if (!newNotes[dateIndex]) {
      newNotes[dateIndex] = [];
    }
    newNotes[dateIndex][slotIndex] = text;
    setNotes(newNotes);
  };

  const handleTileNameChange = (dateIndex: number, slotIndex: number, text: string) => {
    const newTileNames = [...tileNames];
    if (!newTileNames[dateIndex]) {
      newTileNames[dateIndex] = [];
    }
    newTileNames[dateIndex][slotIndex] = text;
    setTileNames(newTileNames);
  };

  const handleEditName = (dateIndex: number, slotIndex: number) => {
    setEditDateIndex(dateIndex);
    setEditSlotIndex(slotIndex);
    setEditName(tileNames[dateIndex]?.[slotIndex] || '');
    setModalVisible(true);
  };

  const handleApplyToAllAttendees = () => {
    if (editName !== null && editName !== '' && editDateIndex !== null) {
      const updatedTileNames = [...tileNames];
      updatedTileNames[editDateIndex] = updatedTileNames[editDateIndex].map((_, index) => `${editName} ${index + 1}`);
      setTileNames(updatedTileNames);
      setEditName('');
      setEditDateIndex(null);
      setEditSlotIndex(null);
      setModalVisible(false);
    }
  };

  const handleApplyNumbersToAttendees = () => {
    if (editDateIndex !== null) {
      const updatedTileNames = [...tileNames];
      updatedTileNames[editDateIndex] = updatedTileNames[editDateIndex].map((_: string, index: number) => `Attendee ${index + 1}`);
      setTileNames(updatedTileNames);
      setEditName('');
      setEditDateIndex(null);
      setEditSlotIndex(null);
      setModalVisible(false);
    }
  };

  const handleSignUp = async (dateIndex: number, slotIndex: number) => {
    if (!attendeeName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      const signupData: SignupData = {
        name: attendeeName,
        username: await EncryptedStorage.getItem('username') || 'guest',
        phoneNumber: phoneNumber,
        wantsReminders: wantsReminders
      };

      const newSignups = { ...signups };
      if (!newSignups[dateIndex]) {
        newSignups[dateIndex] = {};
      }
      newSignups[dateIndex][slotIndex] = signupData;
      setSignups(newSignups);
      setModalVisible(false);
    } catch (error) {
      console.error('Error signing up:', error);
      Alert.alert('Error', 'Failed to sign up');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ImageBackground
        source={backgroundImage ? { uri: backgroundImage } : undefined}
        style={[styles.container, { backgroundColor: screenBgColor }]}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, styles.headerContainer]}>
          {/* Header Section */}
          <View style={[
            styles.headerTextContainer, 
            { 
              backgroundColor: currentHeaderTileColor,
              opacity: 0.9,
              width: '85%',
              borderColor: 'gold',
              borderWidth: 2,
              marginBottom: 20
            }
          ]}>
            <Text style={[
              styles.headerText,
              {
                fontSize: currentModalFontSize + 8,
                fontFamily: currentModalFontType,
                color: currentHeaderFontColor,
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: 8,
                ...(textShadowEnabled ? {
                  textShadowColor: 'rgba(0, 0, 0, 0.75)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                } : {})
              }
            ]}>
              {typeof eventName === 'string' ? eventName : ''}
            </Text>
            <Text style={[
              styles.subHeaderText,
              {
                fontSize: currentModalFontSize,
                fontFamily: currentModalFontType,
                color: currentModalFontColor,
                textAlign: 'center',
                marginBottom: 4,
              }
            ]}>
              Location: {typeof location === 'string' ? location : ''}
            </Text>
            {address && (
              <Text style={[
                styles.subHeaderText,
                {
                  fontSize: 14,
                  fontFamily: currentModalFontType,
                  color: currentModalFontColor,
                  textAlign: 'center',
                  marginBottom: 4,
                }
              ]}>
                Address: {typeof address === 'string' ? address : ''}
              </Text>
            )}
            <Text style={[
              styles.subHeaderText,
              {
                fontSize: 14,
                fontFamily: currentModalFontType,
                color: currentModalFontColor,
                textAlign: 'center',
                marginBottom: 4,
              }
            ]}>
              Organizer: {typeof organizer === 'string' ? organizer : ''}
            </Text>
            {eventTime && (
              <Text style={[
                styles.subHeaderText,
                {
                  fontSize: 14,
                  fontFamily: currentModalFontType,
                  color: currentModalFontColor,
                  textAlign: 'center',
                  marginBottom: 4,
                }
              ]}>
                Time: {typeof eventTime === 'string' ? eventTime : ''}
              </Text>
            )}
          </View>

          {/* Share Button */}
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: 'gold' }]}
            onPress={handleShare}
          >
            <MaterialIcons name="share" size={24} color="navy" />
            <Text style={[
              styles.shareButtonText,
              {
                fontFamily: currentModalFontType,
                color: 'navy',
                marginLeft: 10,
                fontWeight: 'bold',
              }
            ]}>
              {isCreator ? 'Share Event' : 'Request to Share'}
            </Text>
          </TouchableOpacity>

          {/* Dates and Slots */}
          {dates.map((dateData, dateIndex) => (
            <View key={dateIndex} style={styles.dateTile}>
              <View style={[
                styles.dateHeader,
                {
                  backgroundColor: currentHeaderTileColor,
                  opacity: 0.9,
                  borderColor: 'gold',
                  borderWidth: 2,
                  padding: 8,
                  borderRadius: 25,
                  overflow: 'hidden',
                  width: '65%',
                  alignSelf: 'center',
                }
              ]}>
                <Text style={[
                  styles.dateText,
                  {
                    fontSize: currentModalFontSize + 4,
                    fontFamily: currentModalFontType,
                    color: currentModalFontColor,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    ...(textShadowEnabled ? {
                      textShadowColor: 'rgba(0, 0, 0, 0.75)',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 2,
                    } : {})
                  }
                ]}>
                  {typeof dateData.date === 'string' ? dateData.date : ''}
                </Text>
              </View>
              <View style={styles.slotsContainer}>
                {renderSlotsOrAttendees(dateData, dateIndex)}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Sign Up Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalContent, { backgroundColor: currentModalTileColor }]}>
                  <Text style={[
                    styles.modalTitle,
                    {
                      fontSize: currentModalFontSize + 2,
                      fontFamily: currentModalFontType,
                      color: currentModalFontColor,
                    }
                  ]}>
                    {editDateIndex !== null ? 'Edit Name' : 'Sign Up for Event'}
                  </Text>

                  {editDateIndex !== null ? (
                    <>
                      <TextInput
                        style={[
                          styles.modalInput,
                          {
                            fontSize: currentModalFontSize,
                            fontFamily: currentModalFontType,
                            color: 'black',
                          }
                        ]}
                        placeholder="Enter name"
                        value={editName}
                        onChangeText={setEditName}
                        autoCapitalize="words"
                        autoCorrect={false}
                        autoFocus={true}
                      />
                      <View style={styles.applyToAllContainer}>
                        <TouchableOpacity
                          style={[styles.checkbox, applyToAll && styles.checkboxChecked]}
                          onPress={() => setApplyToAll(!applyToAll)}
                        >
                          {applyToAll && <MaterialIcons name="check" size={20} color="white" />}
                        </TouchableOpacity>
                        <Text style={styles.applyToAllText}>Apply to all attendees</Text>
                      </View>
                      <View style={styles.applyToAllContainer}>
                        <TouchableOpacity
                          style={[styles.checkbox, applyNumbers && styles.checkboxChecked]}
                          onPress={() => setApplyNumbers(!applyNumbers)}
                        >
                          {applyNumbers && <MaterialIcons name="check" size={20} color="white" />}
                        </TouchableOpacity>
                        <Text style={styles.applyToAllText}>Apply numbers to attendees</Text>
                      </View>
                      <View style={styles.applyToAllContainer}>
                        <TouchableOpacity
                          style={[styles.checkbox, applyToAllTimeSlots && styles.checkboxChecked]}
                          onPress={() => setApplyToAllTimeSlots(!applyToAllTimeSlots)}
                        >
                          {applyToAllTimeSlots && <MaterialIcons name="check" size={20} color="white" />}
                        </TouchableOpacity>
                        <Text style={styles.applyToAllText}>Apply to all time slots</Text>
                      </View>
                      <View style={styles.modalButtonContainer}>
                        <TouchableOpacity
                          style={[styles.modalButton, { backgroundColor: 'navy' }]}
                          onPress={() => {
                            if (editName && editDateIndex !== null && editSlotIndex !== null) {
                              handleEditConfirm();
                            }
                          }}
                        >
                          <Text style={styles.modalButtonText}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  ) : (
                    <>
                      <Text style={[
                        styles.inputLabel,
                        {
                          fontSize: currentModalFontSize,
                          fontFamily: currentModalFontType,
                          color: currentModalFontColor,
                        }
                      ]}>
                        Your Name *
                      </Text>
                      <TextInput
                        style={[
                          styles.modalInput,
                          {
                            fontSize: currentModalFontSize,
                            fontFamily: currentModalFontType,
                            color: 'black',
                          }
                        ]}
                        placeholder="Enter your full name"
                        value={attendeeName}
                        onChangeText={setAttendeeName}
                        autoCapitalize="words"
                        autoCorrect={false}
                        autoFocus={true}
                        returnKeyType="next"
                      />

                      <TouchableOpacity
                        style={[styles.modalButton, { backgroundColor: 'gold' }]}
                        onPress={handleSignUp}
                      >
                        <Text style={[
                          styles.modalButtonText,
                          {
                            fontSize: currentModalFontSize,
                            fontFamily: currentModalFontType,
                            color: 'white',
                          }
                        ]}>
                          Confirm Sign Up
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  header: {
    marginBottom: -5,
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerTextContainer: {
    padding: 10,
    borderRadius: 10,
    opacity: 0.9,
    borderWidth: 2,
    borderColor: 'gold',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subHeaderText: {
    fontSize: 18,
    textAlign: 'center',
  },
  dateTile: {
    borderWidth: 0,
    borderRadius: 8,
    padding: 8,
    marginBottom: 15,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
    borderRadius: 10,
    maxWidth: '60%',
    marginBottom: 10,
    alignSelf: 'center',
    opacity: 0.9,
    borderWidth: 2,
    borderColor: 'gold',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 8,
  },
  editIconButton: {
    padding: 4,
  },
  tileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  slotTile: {
    width: '48%',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
    backgroundColor: 'transparent',
    opacity: 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'gold',
  },
  singleTile: {
    width: '60%',
    marginHorizontal: 'auto',
    alignSelf: 'center',
  },
  attendeeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  slotHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  timeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 5,
  },
  noteInput: {
    width: '90%',
    borderWidth: 1,
    borderColor: 'navy',
    padding: 10,
    fontSize: 16,
    backgroundColor: 'white',
    borderRadius: 5,
    marginTop: 8,
    marginBottom: 8,
  },
  rsvpButton: {
    backgroundColor: 'gold',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 8,
  },
  rsvpButtonText: {
    color: 'navy',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: 'navy',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
    width: '70%',
    alignSelf: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  saveDraftButton: {
    backgroundColor: '#ADD8E6',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    width: '70%',
    alignSelf: 'center',
  },
  saveDraftButtonText: {
    color: 'darkblue',
    fontWeight: 'bold',
    fontSize: 18,
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  customizationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
  },
  customizationContent: {
    paddingBottom: 100,
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  selectButton: {
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'blue',
    fontSize: 16,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: 'navy',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 80,
    backgroundColor: 'gold',
    paddingBottom: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    color: 'navy',
    fontSize: 12,
    marginTop: 2,
  },
  profileImageNav: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'gold',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: 'navy',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  applyToAllContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'navy',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'navy',
  },
  applyToAllText: {
    fontSize: 16,
    color: 'black',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 120,
    maxWidth: '48%',
  },
  cancelButton: {
    backgroundColor: 'navy',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerFieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  editInstructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  headerEditContainer: {
    width: '100%',
    marginBottom: 20,
  },
  headerEditLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'navy',
    marginBottom: 5,
    marginTop: 10,
  },
  headerEditInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 5,
    backgroundColor: '#f9f9f9',
  },
  noteText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 10,
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 80,
    marginBottom: 20,
  },
  signedUpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 10,
    zIndex: 1,
  },
  slotContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  slotText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'navy',
    marginBottom: 10,
  },
  signUpButton: {
    backgroundColor: 'navy',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  signUpButtonText: {
    color: 'gold',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'gold',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'navy',
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: 'navy',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: 'white',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  slotTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  slot: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
  takenSlot: {
    backgroundColor: 'rgba(200, 200, 200, 0.5)',
    borderColor: '#ccc',
  },
  takenSlotInfo: {
    marginTop: 5,
  },
  takenByText: {
    fontStyle: 'italic',
    color: '#666',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  currentUserSlot: {
    backgroundColor: 'rgba(144, 238, 144, 0.5)',
    borderColor: 'green',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
    marginBottom: 10,
  },
  shareButtonText: {
    marginLeft: 10,
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default EventSignUpScreen; 