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
  };
};

const EventSignUpScreen = ({ route }: { route?: any }) => {
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
    timeSlots = {},
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
  } = params;

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [screenBgColor, setScreenBgColor] = useState(bgColor || 'white');
  const [modalFontColor, setModalFontColor] = useState(fontColor || 'black');
  const [modalFontSize, setModalFontSize] = useState(fontSize || 16);
  const [modalFontType, setModalFontType] = useState(fontType || 'sans-serif');
  const [modalTileColor, setModalTileColor] = useState(tileColor || '#f0f0f0');
  const [headerTileColorState, setHeaderTileColorState] = useState(headerTileColor || 'rgba(0, 0, 0, 0.7)');
  const [headerFontColorState, setHeaderFontColorState] = useState(headerFontColor || 'white');
  const [signups, setSignups] = useState<{
    [key: string]: {
      [slotIndex: number]: {
        name: string;
        phoneNumber?: string;
        wantsReminders?: boolean;
        username?: string;
      } | string;
    };
  }>({});
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [wantsReminders, setWantsReminders] = useState(false);
  const [participantNames, setParticipantNames] = useState(
    dates.map(date => Array(date.signups).fill(''))
  );
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Definition for tileNames with default values
  const [tileNames, setTileNames] = useState<Array<{
    names: string[];
    includeNumbers: boolean;
  }>>([]);
  
  // Definition for editedTiles
  const [editedTiles, setEditedTiles] = useState<{[key: string]: boolean}>({});
  
  // Add useEffect to load tileNames from route params
  useEffect(() => {
    // Initialize tileNames with default values if not provided in route params
    if (route.params && route.params.tileNames) {
      console.log('Setting tileNames from route params:', route.params.tileNames);
      setTileNames(route.params.tileNames);
    } else {
      console.log('Initializing default tileNames');
      setTileNames(
        dates.map(date => ({
          names: Array(date.signups).fill('Attendee'),
          includeNumbers: true
        }))
      );
    }
    
    // Initialize editedTiles from route params if available
    if (route.params && route.params.editedTiles) {
      console.log('Setting editedTiles from route params:', route.params.editedTiles);
      setEditedTiles(route.params.editedTiles);
    }
  }, [route.params, dates]);

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
      `${timeSlots[dateIndex][slotIndex].start} - ${timeSlots[dateIndex][slotIndex].end}` : 
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

  const renderSlotsOrAttendees = (dateIndex: number) => {
    const date = dates[dateIndex];
    const slots = Array.from({ length: date.signups }, (_, i) => i);
    
    // Get isTimeSlot property directly from the date object to ensure it's respected
    const showTimeSlots = date.isTimeSlot === true;
    
    // Log the tileNames for debugging
    console.log(`Rendering slots for date ${dateIndex}, tileNames:`, tileNames);
    console.log(`Date at index ${dateIndex} isTimeSlot:`, showTimeSlots);
    
    return slots.map((slotIndex) => {
      // Generate a unique key for this slot
      const slotKey = `${dateIndex}_${slotIndex}`;
      
      // Get the signup for this slot if it exists
      const dateId = dateIndex.toString();
      const hasSignup = signups[dateId] && signups[dateId][slotIndex] !== undefined;
      const signupData = hasSignup ? signups[dateId][slotIndex] : null;
      
      // Extract the name from signup data
      let signupName = '';
      if (signupData) {
        if (typeof signupData === 'object' && signupData.name) {
          signupName = signupData.name;
        } else if (typeof signupData === 'string') {
          signupName = signupData;
        }
      }
      
      // Get the time slot for this slot if it exists
      let timeSlotText = '';
      if (showTimeSlots && timeSlots && timeSlots[slotIndex]) {
        const timeSlot = timeSlots[slotIndex];
        console.log(`Time slot for index ${slotIndex}:`, timeSlot);
        
        if (typeof timeSlot === 'object' && timeSlot.start && timeSlot.end) {
          timeSlotText = `${timeSlot.start} - ${timeSlot.end}`;
        } else if (typeof timeSlot === 'string') {
          timeSlotText = timeSlot;
        }
      }
      
      // Get the label for this slot if it exists
      let slotLabel = '';
      
      // First check if we have a custom tile name from the loaded tileNames state
      if (tileNames && 
          tileNames[dateIndex] && 
          tileNames[dateIndex].names && 
          tileNames[dateIndex].names[slotIndex]) {
        slotLabel = tileNames[dateIndex].names[slotIndex];
      }
      // Then check if we have a slot label
      else if (slotLabels && slotLabels[slotKey]) {
        slotLabel = slotLabels[slotKey];
      } 
      // Fall back to default labels
      else {
        slotLabel = showTimeSlots ? 'Time Slot' : 'Attendee';
        if (slotIndex !== null) {
          slotLabel += ` ${slotIndex + 1}`;
        }
      }
      
      return (
        <TouchableOpacity
          key={slotIndex}
          style={[
            styles.tile,
            {
              backgroundColor: modalTileColor,
            }
          ]}
          onPress={() => {
            if (!hasSignup) {
              setSelectedSlot(slotIndex);
              setSelectedDateIndex(dateIndex);
              setModalVisible(true);
            }
          }}
        >
          {hasSignup && (
            <View style={styles.signedUpOverlay} />
          )}
          <View style={styles.tileContent}>
            <Text style={[
              styles.tileText,
              {
                color: modalFontColor,
                fontFamily: modalFontType,
                fontSize: modalFontSize,
                ...(textShadowEnabled ? {
                  textShadowColor: 'rgba(0, 0, 0, 0.75)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                } : {})
              }
            ]}>
              {slotLabel}
            </Text>
            
            {showTimeSlots && timeSlotText && (
              <Text style={[
                styles.timeText,
                {
                  color: modalFontColor,
                  fontFamily: modalFontType,
                  fontSize: modalFontSize - 2,
                }
              ]}>
                {timeSlotText}
              </Text>
            )}
            
            {hasSignup && (
              <View style={[styles.signupInfo, { opacity: 1 }]}>
                <Text style={[
                  styles.signupName,
                  {
                    color: 'darkblue',
                    fontFamily: modalFontType,
                    fontSize: modalFontSize - 2,
                    fontWeight: 'bold',
                    opacity: 1,
                  }
                ]}>
                  {signupName}
                </Text>
                
                {isCreator && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => handleCancelSignup(dateId, slotIndex)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {!hasSignup && (
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => {
                  setSelectedSlot(slotIndex);
                  setSelectedDateIndex(dateIndex);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
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
            setScreenBgColor(route.params.bgColor);
          }
          
          // Apply font color
          if (route.params.fontColor) {
            setModalFontColor(route.params.fontColor);
          }
          
          // Apply font size
          if (route.params.fontSize) {
            setModalFontSize(route.params.fontSize);
          }
          
          // Apply font type
          if (route.params.fontType) {
            setModalFontType(route.params.fontType);
          }
          
          // Apply tile color
          if (route.params.tileColor) {
            setModalTileColor(route.params.tileColor);
          }
          
          // Apply header tile color if available
          if (route.params.headerTileColor) {
            setHeaderTileColorState(route.params.headerTileColor);
          } else if (route.params.tileColor) {
            // Fall back to regular tile color if header tile color is not available
            setHeaderTileColorState(route.params.tileColor);
          }
          
          // Apply header font color if available
          if (route.params.headerFontColor) {
            setHeaderFontColorState(route.params.headerFontColor);
          } else if (route.params.fontColor) {
            // Fall back to regular font color if header font color is not available
            setHeaderFontColorState(route.params.fontColor);
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
      if (route.params.bgColor) setScreenBgColor(route.params.bgColor);
      if (route.params.fontColor) setModalFontColor(route.params.fontColor);
      if (route.params.fontSize) setModalFontSize(route.params.fontSize);
      if (route.params.fontType) setModalFontType(route.params.fontType);
      if (route.params.tileColor) setModalTileColor(route.params.tileColor);
      
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
      return require('../ios/assets/blue.jpg');
    }
    
    if (typeof backgroundImage === 'string') {
      return { uri: backgroundImage };
    }
    
    return backgroundImage;
  };

  // Update the renderSlot function to show if a slot is taken
  const renderSlot = (dateId: string | number, slotId: string | number, slotData: any) => {
    const isTaken = signups[dateId]?.[slotId] !== undefined;
    const signupData = signups[dateId]?.[slotId];
    const signupUsername = typeof signupData === 'object' ? signupData.username : undefined;
    const signupName = typeof signupData === 'object' ? signupData.name : signupData;
    const isCurrentUserSlot = signupUsername === currentUserName;
    
    return (
      <TouchableOpacity
        style={[
          styles.slot,
          isTaken && styles.takenSlot,
          isCurrentUserSlot && styles.currentUserSlot,
        ]}
        onPress={() => handleSlotPress(dateId, slotId)}
        disabled={isTaken && !isCurrentUserSlot}
      >
        {isTaken && <View style={styles.signedUpOverlay} />}
        
        <Text style={styles.slotTitle}>
          {slotData.title || `Slot ${slotId}`}
        </Text>
        
        {isTaken ? (
          <View style={styles.takenSlotInfo}>
            <Text style={styles.takenByText}>
              Taken by: {signupName}
            </Text>
            {isCurrentUserSlot && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelSignup(dateId, slotId)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => handleSignUpPress(dateId, slotId, attendeeName)}
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
  const renderDate = (date, index) => {
    return (
      <View key={index} style={[styles.dateTile, { marginTop: 20 }]}> {/* Added marginTop */}
        <View style={styles.dateTextContainer}>
          <Text style={[
            styles.dateText,
            {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: 10,
              borderRadius: 8,
              fontFamily: modalFontType,
              fontSize: modalFontSize,
              ...(textShadowEnabled ? {
                textShadowColor: 'rgba(0, 0, 0, 0.75)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
              } : {})
            }
          ]}>
            {date.date}
          </Text>
        </View>
        <View style={styles.slotsContainer}>
          {renderSlotsOrAttendees(index)}
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
    const isTaken = signups[dateId]?.[slotId] !== undefined;
    const signupData = signups[dateId]?.[slotId];
    const signupUsername = typeof signupData === 'object' ? signupData.username : undefined;
    const isCurrentUserSlot = signupUsername === currentUserName;
    
    if (isTaken) {
      if (isCurrentUserSlot) {
        // Allow canceling if it's the current user's slot
        Alert.alert(
          'Cancel Signup',
          'Would you like to cancel your signup for this slot?',
          [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => handleCancelSignup(dateId, slotId) }
          ]
        );
      } else {
        // Show who took the slot if it's taken by someone else
        const name = typeof signupData === 'object' ? signupData.name : signupData;
        Alert.alert('Slot Taken', `This slot is already taken by ${name}`);
      }
    } else {
      // If not taken, show sign-up modal
      setSelectedDateIndex(typeof dateId === 'number' ? dateId : parseInt(dateId));
      setSelectedSlot(typeof slotId === 'number' ? slotId : parseInt(slotId));
      setModalVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <ImageBackground
        source={
          backgroundImage
            ? typeof backgroundImage === 'string'
              ? { uri: backgroundImage }
              : typeof backgroundImage === 'number'
                ? backgroundImage
                : backgroundImage
            : require('../ios/assets/blue.jpg')
        }
        style={[styles.container, { width: '100%', height: '100%' }]}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, styles.headerContainer]}>
          {/* Header Section - More narrow horizontally */}
          <View style={[
            styles.headerTextContainer, 
            { 
              backgroundColor: headerTileColorState || modalTileColor || 'rgba(0, 0, 0, 0.7)',
              opacity: 1,
              width: '85%',
              borderColor: 'gold',
              borderWidth: 2,
            }
          ]}>
            <Text style={[
              styles.headerText,
              {
                fontSize: modalFontSize + 4 || 24,
                fontFamily: modalFontType || 'sans-serif',
                color: headerFontColorState || modalFontColor || 'white',
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
                fontSize: 14,
                fontFamily: modalFontType,
                color: modalFontColor || 'white',
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
                  fontFamily: modalFontType,
                  color: modalFontColor || 'white',
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
                fontFamily: modalFontType,
                color: modalFontColor || 'white',
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
                  fontFamily: modalFontType,
                  color: modalFontColor || 'white',
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
            style={styles.shareButton}
            onPress={handleShare}
          >
            <MaterialIcons name="share" size={24} color="white" />
            <Text style={[
              styles.shareButtonText,
              {
                fontFamily: modalFontType,
                color: 'white',
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
              <View style={styles.dateTextContainer}>
                <Text style={[
                  styles.dateText,
                  {
                    fontSize: modalFontSize + 4,
                    fontFamily: modalFontType,
                    backgroundColor: modalTileColor,
                    color: modalFontColor,
                    padding: 10,
                    borderRadius: 5,
                    borderColor: 'gold',
                    borderWidth: 2,
                  }
                ]}>
                  {typeof dateData.date === 'string' ? dateData.date : ''}
                </Text>
              </View>
              <View style={styles.slotsContainer}>
                {renderSlotsOrAttendees(dateIndex)}
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
                <View style={styles.modalContent}>
                  <Text style={[
                    styles.modalTitle,
                    {
                      fontSize: modalFontSize + 2,
                      fontFamily: modalFontType,
                    }
                  ]}>
                    Sign Up for Event
                  </Text>

                  {/* Name Input with Label */}
                  <Text style={[
                    styles.inputLabel,
                    {
                      fontSize: modalFontSize - 1,
                      fontFamily: modalFontType,
                    }
                  ]}>
                    Your Name *
                  </Text>
                  <TextInput
                    style={[
                      styles.modalInput,
                      {
                        fontSize: modalFontSize,
                        fontFamily: modalFontType,
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
                  
                  {/* Text Reminder Option */}
                  <View style={styles.reminderOption}>
                    <Text style={[
                      styles.reminderText,
                      {
                        fontSize: modalFontSize,
                        fontFamily: modalFontType,
                      }
                    ]}>
                      Would you like text reminders for this event?
                    </Text>
                    <Switch
                      value={wantsReminders}
                      onValueChange={setWantsReminders}
                    />
                  </View>
                  
                  {/* Phone Number Input with Label */}
                  {wantsReminders && (
                    <>
                      <Text style={[
                        styles.inputLabel,
                        {
                          fontSize: modalFontSize - 1,
                          fontFamily: modalFontType,
                        }
                      ]}>
                        Phone Number for Reminders *
                      </Text>
                      <TextInput
                        style={[
                          styles.modalInput,
                          {
                            fontSize: modalFontSize,
                            fontFamily: modalFontType,
                          }
                        ]}
                        placeholder="Enter your phone number (e.g., 555-555-5555)"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                      />
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={handleConfirmSignUp}
                  >
                    <Text style={[
                      styles.modalButtonText,
                      {
                        fontSize: modalFontSize,
                        fontFamily: modalFontType,
                      }
                    ]}>
                      Confirm Sign Up
                    </Text>
                  </TouchableOpacity>
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
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  headerTextContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    width: '85%', // Make the header more narrow horizontally
    alignSelf: 'center', // Center the header
    borderColor: 'gold',
    borderWidth: 2,
  },
  headerText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 20,
    color: 'white',
  },
  subHeaderText: {
    textAlign: 'center',
    marginBottom: 4,
  },
  shareButton: {
    backgroundColor: 'gold',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 20,
    width: 180,
    alignSelf: 'center',
    borderColor: 'gold',
    borderWidth: 2,
  },
  shareButtonText: {
    color: 'white',
    marginLeft: 10,
    fontWeight: 'bold',
  },
  dateTile: {
    marginBottom: 20,
  },
  dateTextContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  dateText: {
    padding: 10,
    borderRadius: 5,
    overflow: 'hidden',
    borderColor: 'gold',
    borderWidth: 2,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
  },
  tile: {
    width: '42%',
    marginBottom: 15,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 10,
    borderColor: 'gold',
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 100,
  },
  slot: {
    width: '40%',
    marginBottom: 15,
    marginHorizontal: 8,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  modalButton: {
    backgroundColor: 'gold',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '70%',
    alignSelf: 'center',
    borderColor: 'gold',
    borderWidth: 2,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  takenBadge: {
    backgroundColor: 'rgba(218, 165, 32, 0.9)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  takenBadgeText: {
    color: 'white',
    fontWeight: 'bold',
  },
  currentUserSlot: {
    backgroundColor: 'rgba(144, 238, 144, 0.5)',
    borderColor: 'green',
  },
  currentUserBadge: {
    backgroundColor: 'rgba(218, 165, 32, 0.7)',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  timeText: {
    textAlign: 'center',
    fontWeight: '500',
    flexShrink: 1,
  },
  signUpButton: {
    backgroundColor: 'gold',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: 'center',
    borderColor: 'gold',
    borderWidth: 2,
  },
  signUpButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reminderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  reminderText: {
    flex: 1,
    marginRight: 10,
  },
  inputLabel: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
    fontSize: 16,
    marginTop: 5,
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
  cancelButton: {
    backgroundColor: '#ff6b6b',
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
    alignSelf: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  slotTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tileText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  signupInfo: {
    marginTop: 5,
    width: '100%',
    alignItems: 'center',
  },
  signupName: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 80, // Increase padding to push content further down below the digital island
    marginBottom: 20,
  },
  signedUpOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 215, 0, 0.2)', // Gold with higher transparency
    borderRadius: 10,
    zIndex: 1,
  },
  tileContent: {
    position: 'relative',
    zIndex: 2,
    width: '100%',
    alignItems: 'center',
  },
});

export default EventSignUpScreen; 