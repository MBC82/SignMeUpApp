import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Alert,
  ActivityIndicator,
  AppState,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkLoginStatus, clearLoginStatus } from '../utils/StorageUtils';

// Update type definitions at the top of the file
type RootStackParamList = {
  Home: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  MyEvents: undefined;
  ProfileSetup: undefined;
  EnhancedSignUp: {
    eventId: string;
    id: string;
    username: string;
    eventName: string;
    location: string;
    organizer: string;
    address: string;
    eventTime?: string;
    neededItems?: string[];
    dates?: EventDate[];
    timeSlots?: any[];
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
    showThemes?: boolean;
  };
  UserProfile: undefined;
  EventSignUp: { eventId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// Define a proper event type near the top of the file
type EventDate = {
  date: string;
  signups: number;
  isTimeSlot?: boolean;
};

type Event = {
  eventId: string;
  id: string;
  username: string;
  eventName: string;
  location: string;
  organizer: string;
  address: string;
  neededItems: string[];
  dates: EventDate[];
  timeSlots: any[];
  bgColor: string;
  fontColor: string;
  fontSize: number;
  fontType: string;
  tileColor: string;
  backgroundImage: string | null;
  textNotificationsEnabled: boolean;
  organizerPhone: string;
  emailNotificationsEnabled: boolean;
  organizerEmail: string;
  globalNote: string;
  slotLabels: Record<string, string>;
  textShadowEnabled: boolean;
  isTimeSlot?: boolean;
  isDraft?: boolean;
  headerTileColor?: string;
  headerFontColor?: string;
  headerTextColor?: string;
  dateTextColor?: string;
  useOriginalTileColor?: boolean;
  tileNames?: Array<{
    names: string[];
    includeNumbers: boolean;
  }>;
  editedTiles?: Record<string, boolean>;
  createdAt?: string | number;
  eventTime?: string;
  currentTheme?: string;
  customTileNames?: Record<string, string>;
  participantNames?: string[];
};

const MyEventsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [submittedEvents, setSubmittedEvents] = useState<Event[]>([]);
  const [draftEvents, setDraftEvents] = useState<Event[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to true to avoid login screen flash
  const [isLoading, setIsLoading] = useState(true);
  const [currentUsername, setCurrentUsername] = useState('');

  // Add this useEffect to monitor app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        // App has come to the foreground, check login status
        checkLoginStatusAndLoadEvents();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Update the checkLoginStatus function
  const checkLoginStatusAndLoadEvents = async () => {
    try {
      console.log('========== CHECKING LOGIN STATUS ==========');
      
      // Start with loading state
      setIsLoading(true);
      
      // Always clear events first
      setSubmittedEvents([]);
      setDraftEvents([]);
      setCurrentUsername('');
      
      // Get login status using the utility function
      const { isLoggedIn, username } = await checkLoginStatus();
      
      console.log('Login status check:', { isLoggedIn, username });
      
      // Only consider logged in if both conditions are met
      if (isLoggedIn && username) {
        console.log('User is logged in, loading events for:', username);
        setIsLoggedIn(true);
        setCurrentUsername(username);
        // Load events for this specific user
        await loadEventsForUser(username);
      } else {
        console.log('User is NOT logged in, clearing events');
        setIsLoggedIn(false);
        setCurrentUsername('');
        // Ensure events are cleared
        setSubmittedEvents([]);
        setDraftEvents([]);
        
        // Clear any cached events
        await AsyncStorage.removeItem('cachedEvents');
      }
      
      setIsLoading(false);
      console.log('========== FINISHED CHECKING LOGIN STATUS ==========');
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
      setCurrentUsername('');
      setSubmittedEvents([]);
      setDraftEvents([]);
      setIsLoading(false);
    }
  };
  
  // Update the first useEffect to use the extracted function
  useEffect(() => {
    checkLoginStatusAndLoadEvents();
  }, []);
  
  // Update the useFocusEffect to use the extracted function
  useFocusEffect(
    React.useCallback(() => {
      console.log('========== FOCUS EFFECT TRIGGERED ==========');
      checkLoginStatusAndLoadEvents();
      return () => {
        console.log('Focus effect cleanup');
      };
    }, [])
  );

  const loadEventsForUser = async (username: string) => {
    try {
      console.log('========== LOADING EVENTS FOR USER ==========');
      console.log('Loading events for user:', username);
      
      // Clear existing events first
      setSubmittedEvents([]);
      setDraftEvents([]);
      
      if (!username) {
        console.log('No username provided to loadEventsForUser');
        return;
      }
      
      // Load submitted events for this specific user
      const submittedEventsKey = `submittedEvents_${username}`;
      console.log('Using submitted events key:', submittedEventsKey);
      
      const submittedEventsJson = await AsyncStorage.getItem(submittedEventsKey);
      const loadedSubmittedEvents = submittedEventsJson ? JSON.parse(submittedEventsJson) : [];
      
      // Load draft events for this specific user
      const draftEventsKey = `draftEvents_${username}`;
      console.log('Using draft events key:', draftEventsKey);
      
      const draftEventsJson = await AsyncStorage.getItem(draftEventsKey);
      const loadedDraftEvents = draftEventsJson ? JSON.parse(draftEventsJson) : [];
      
      // Sort events by creation date (newest first)
      loadedSubmittedEvents.sort((a: Event, b: Event) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      loadedDraftEvents.sort((a: Event, b: Event) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      // Set the events
      setSubmittedEvents(loadedSubmittedEvents);
      setDraftEvents(loadedDraftEvents);
      
      console.log('Loaded submitted events count:', loadedSubmittedEvents.length);
      console.log('Loaded draft events count:', loadedDraftEvents.length);
      
      console.log('========== FINISHED LOADING EVENTS ==========');
    } catch (error) {
      console.error('Error loading events for user:', error);
      // Ensure events are cleared on error
      setSubmittedEvents([]);
      setDraftEvents([]);
    }
  };

  const handleEditEvent = (event: Event) => {
    // Process dates to preserve the isTimeSlot property 
    console.log("Edit event called for:", event.eventName);
    
    // Log original event properties to understand what we're working with
    console.log("Original event tileNames:", event.tileNames);
    console.log("Original event editedTiles:", event.editedTiles);
    console.log("Original event slotLabels:", event.slotLabels);
    
    // Validate tileNames - ensure we have an array with names for each date
    let validTileNames = event.tileNames || [];
    
    // Process the timeSlots for flat structure if they exist
    let flattenedTimeSlots: any[] = [];
    
    // Check if we have timeSlots in the event
    if (event.timeSlots) {
      console.log("Original timeSlots structure:", event.timeSlots);
      
      // Convert the nested timeSlots to a flattened format
      // where each item has dateIndex, slotIndex, start, and end
      if (typeof event.timeSlots === 'object' && !Array.isArray(event.timeSlots)) {
        Object.keys(event.timeSlots).forEach(dateIndexStr => {
          const dateIndex = parseInt(dateIndexStr);
          const slots = event.timeSlots?.[dateIndex];
          
          if (Array.isArray(slots)) {
            slots.forEach((slot, slotIndex) => {
              if (slot && typeof slot === 'object' && slot.start && slot.end) {
                flattenedTimeSlots.push({
                  dateIndex,
                  slotIndex,
                  start: slot.start,
                  end: slot.end
                });
              }
            });
          }
        });
      }
      
      console.log("Flattened timeSlots:", flattenedTimeSlots);
    }
    
    // Validate editedTiles
    let validEditedTiles = event.editedTiles || {};
    
    // Build the complete event data
    const completeEvent = {
      ...event,
      id: event.id,
      eventId: event.eventId,
      username: currentUsername,
      editedTiles: validEditedTiles,
      tileNames: validTileNames,
      timeSlots: flattenedTimeSlots.length > 0 ? flattenedTimeSlots : event.timeSlots,
      customTileNames: event.customTileNames ?? {},
      participantNames: event.participantNames ?? [],
      isNewEvent: true // Indicates we're editing, not creating new
    };
    
    // Log the final event data being passed
    console.log("Navigating to SignUpScreen with:", {
      eventName: completeEvent.eventName,
      tileNames: completeEvent.tileNames ? `Array length: ${completeEvent.tileNames.length}` : 'undefined',
      editedTiles: completeEvent.editedTiles ? `Object with ${Object.keys(completeEvent.editedTiles).length} entries` : 'undefined',
      slotLabels: completeEvent.slotLabels ? `Object with ${Object.keys(completeEvent.slotLabels).length} entries` : 'undefined',
      timeSlots: completeEvent.timeSlots ? `Length: ${Array.isArray(completeEvent.timeSlots) ? completeEvent.timeSlots.length : 'Not an array'}` : 'undefined',
      customTileNames: completeEvent.customTileNames,
      participantNames: completeEvent.participantNames
    });
    
    // Navigate to the EnhancedSignUp with the event data
    navigation.navigate('EnhancedSignUp', {
      eventId: event.eventId || '',
      id: event.id || '',
      username: event.username || '',
      eventName: event.eventName || '',
      location: event.location || '',
      organizer: event.organizer || '',
      address: event.address || '',
      eventTime: event.eventTime || '',
      neededItems: event.neededItems || [],
      dates: event.dates || [],
      timeSlots: event.timeSlots || [],
      bgColor: event.bgColor || '#FFFFFF',
      fontColor: event.fontColor || '#000000',
      fontSize: event.fontSize || 16,
      fontType: event.fontType || 'Arial',
      tileColor: event.tileColor || '#F0F0F0',
      textNotificationsEnabled: event.textNotificationsEnabled || false,
      organizerPhone: event.organizerPhone || '',
      emailNotificationsEnabled: event.emailNotificationsEnabled || false,
      organizerEmail: event.organizerEmail || '',
      globalNote: event.globalNote || '',
      slotLabels: event.slotLabels || {},
      backgroundImage: event.backgroundImage || null,
      textShadowEnabled: event.textShadowEnabled || false,
      isTimeSlot: event.isTimeSlot !== undefined ? event.isTimeSlot : true,
      isNewEvent: false,
      isPreview: false,
      showThemes: false
    });
  };

  const handleDeleteEvent = async (eventId: string, isDraft = false) => {
    // Add confirmation dialog
    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete this ${isDraft ? 'draft' : 'event'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting event with ID:', eventId, 'isDraft:', isDraft);
              
              const username = await EncryptedStorage.getItem('username');
              if (!username) {
                Alert.alert('Error', 'You need to be logged in to delete events');
                return;
              }
              
              // Determine which storage key to use based on whether it's a draft or submitted event
              const storageKey = isDraft ? `draftEvents_${username}` : `submittedEvents_${username}`;
              console.log('Using storage key:', storageKey);
              
              // Get the existing events
              const eventsData = await AsyncStorage.getItem(storageKey);
              
              if (eventsData) {
                const events = JSON.parse(eventsData);
                console.log('Total events before deletion:', events.length);
                console.log('Events IDs before deletion:', events.map((e: any) => e.id));
                
                // Filter out the event with the matching ID
                const updatedEvents = events.filter((event: Event) => {
                  const matches = event.id !== eventId;
                  if (!matches) {
                    console.log('Found event to delete:', event.id, event.eventName);
                  }
                  return matches;
                });
                
                console.log('Total events after deletion:', updatedEvents.length);
                
                // Save the updated events back to storage
                await AsyncStorage.setItem(storageKey, JSON.stringify(updatedEvents));
                
                // Update the state based on whether it's a draft or submitted event
                if (isDraft) {
                  setDraftEvents(updatedEvents);
                } else {
                  setSubmittedEvents(updatedEvents);
                }
                
                Alert.alert('Success', `Event ${isDraft ? 'draft ' : ''}deleted successfully`);
              }
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
  };

  const handleViewEvent = (event: Event) => {
    if (event.isDraft) {
      // Make sure we have all the necessary data, but exclude eventTime from the header
      const completeEventData = {
        eventId: event.id,
        id: event.id,
        username: event.username,
        eventName: event.eventName || '',
        location: event.location || '',
        organizer: event.organizer || '',
        address: event.address || '',
        neededItems: event.neededItems || [],
        dates: event.dates || [],
        timeSlots: event.timeSlots || {},
        bgColor: event.bgColor || 'white',
        fontColor: event.fontColor || 'black',
        fontSize: event.fontSize || 16,
        fontType: event.fontType || 'sans-serif',
        tileColor: event.tileColor || '#f0f0f0',
        backgroundImage: event.backgroundImage || null,
        textNotificationsEnabled: event.textNotificationsEnabled || false,
        organizerPhone: event.organizerPhone || '',
        emailNotificationsEnabled: event.emailNotificationsEnabled || false,
        organizerEmail: event.organizerEmail || '',
        globalNote: event.globalNote || '',
        slotLabels: event.slotLabels || {},
        textShadowEnabled: event.textShadowEnabled || false,
        isTimeSlot: event.isTimeSlot !== undefined ? event.isTimeSlot : true,
        isEditing: true,
        isDraft: true,
        hideEventTimeInHeader: true,
        // Add tileNames if they exist
        tileNames: event.tileNames || [],
        // Add editedTiles if they exist
        editedTiles: event.editedTiles || {},
      };
      
      // Navigate to EnhancedSignUp with the complete event data
      navigation.navigate('EnhancedSignUp', completeEventData);
    } else {
      // If it's a submitted event, navigate to EventDetailsScreen for viewing
      navigation.navigate('EventDetails', { eventId: event.id });
    }
  };

  // Update the getBackgroundImageSource function to handle null values correctly
  const getBackgroundImageSource = (event: Event): { uri: string } | number | undefined => {
    if (!event || !event.backgroundImage) {
      console.log('No background image for event:', event?.id);
      return undefined;
    }
    
    console.log('Processing background image for event:', event.id, 'Type:', typeof event.backgroundImage);
    
    try {
      // If it's already a string URI
      if (typeof event.backgroundImage === 'string') {
        console.log('Using string URI:', event.backgroundImage);
        return { uri: event.backgroundImage };
      }
      
      // If it's an object with a uri property
      if (typeof event.backgroundImage === 'object' && 'uri' in event.backgroundImage) {
        const uri = (event.backgroundImage as { uri: string }).uri;
        if (!uri) return undefined;
        console.log('Using object URI:', uri);
        return { uri };
      }
      
      // If it's a require() result (local image)
      if (typeof event.backgroundImage === 'number') {
        console.log('Using local image ID:', event.backgroundImage);
        return event.backgroundImage;
      }
      
      console.log('No valid background image format found for event:', event.id);
      return undefined;
    } catch (error) {
      console.error('Error processing background image:', error);
      return undefined;
    }
  };

  // Add this function to help debug the event structure
  const logEventStructure = (event: Event) => {
    console.log('========== EVENT STRUCTURE ==========');
    console.log('Event ID:', event.id);
    console.log('Event Name:', event.eventName);
    console.log('Event dates array:', JSON.stringify(event.dates));
    console.log('Event eventTime:', event.eventTime);
    console.log('Event createdAt:', event.createdAt);
    console.log('====================================');
  };

  // Update the hexToRgb function to work in React Native (no DOM access)
  const hexToRgb = (color: string): string => {
    if (!color) return '255, 255, 255';
    
    // Handle named colors
    const namedColors: {[key: string]: string} = {
      'gold': '255, 215, 0',
      'lightblue': '173, 216, 230',
      'white': '255, 255, 255',
      'black': '0, 0, 0',
      'navy': '0, 0, 128',
      'darkgray': '169, 169, 169',
      'lightyellow': '255, 255, 224',
      'red': '255, 0, 0',
      'green': '0, 128, 0',
      'blue': '0, 0, 255',
      'yellow': '255, 255, 0',
      'purple': '128, 0, 128',
      'orange': '255, 165, 0',
      'gray': '128, 128, 128',
      'pink': '255, 192, 203',
      'brown': '165, 42, 42',
      'cyan': '0, 255, 255',
      'magenta': '255, 0, 255',
      'silver': '192, 192, 192',
      'maroon': '128, 0, 0',
      'olive': '128, 128, 0',
      'teal': '0, 128, 128',
      'aqua': '0, 255, 255',
      'lime': '0, 255, 0',
      'fuchsia': '255, 0, 255',
    };
    
    return namedColors[color.toLowerCase()] || '255, 255, 255';
  }

  // Update the getTileColor function to handle errors better
  const getTileColor = (event: Event) => {
    try {
      // Log the event's tileColor and theme for debugging
      console.log('Getting tile color for event:', event.id);
      console.log('Event tileColor:', event.tileColor);
      console.log('Event currentTheme:', event.currentTheme);
      
      if (event.tileColor) {
        console.log('Using event tileColor:', event.tileColor);
        
        // For React Native, we'll use our mapping or direct hex conversion
        return `rgba(${hexToRgb(event.tileColor)}, 0.8)`;
      }
      
      // If no tileColor, check if there's a theme we can use
      if (event.currentTheme) {
        const themeColors: {[key: string]: string} = {
          'Classic': 'rgba(255, 215, 0, 0.8)', // gold
          'Teacher': 'rgba(173, 216, 230, 0.8)', // lightblue
          'Modern': 'rgba(169, 169, 169, 0.8)', // darkgray
          'Fancy': 'rgba(255, 255, 224, 0.8)', // lightyellow
          'Elegant': 'rgba(255, 255, 255, 0.8)', // white
          'Sporty': 'rgba(129, 199, 132, 0.8)', // #81c784
          'Classy': 'rgba(255, 228, 225, 0.8)', // #FFE4E1
          'Dark Mode': 'rgba(66, 66, 66, 0.8)', // #424242
        };
        
        return themeColors[event.currentTheme] || 'rgba(255, 255, 255, 0.8)';
      }
      
      // Default fallback
      return 'rgba(255, 255, 255, 0.8)';
    } catch (error) {
      console.error('Error in getTileColor:', error);
      return 'rgba(255, 255, 255, 0.8)'; // Default to white
    }
  };

  // Update the renderEvent function to use larger font sizes
  const renderEvent = (event: Event, isDraft = false) => {
    console.log('Rendering event:', event.id);
    console.log('Event background image:', event.backgroundImage);
    console.log('Event bgColor:', event.bgColor);
    console.log('Event fontColor:', event.fontColor);
    console.log('Event fontType:', event.fontType);
    console.log('Event fontSize:', event.fontSize);
    console.log('Event tileColor:', event.tileColor); // Log the tileColor
    
    // Get the background image source
    const backgroundSource = getBackgroundImageSource(event);
    console.log('Background source for rendering:', backgroundSource);
    
    // Call this at the beginning of the renderEvent function
    logEventStructure(event);
    
    // Get the tile color using the separate function
    const tileColor = getTileColor(event);
    console.log('Using tile color:', tileColor);
    
    // Format the date to show only the date part (not time)
    const formatDate = (dateTimeString: string | number | undefined) => {
      if (!dateTimeString) return 'No date';
      
      try {
        console.log('Formatting date string:', dateTimeString);
        
        // Handle different date formats
        let date;
        
        // Check if it's a timestamp number
        if (typeof dateTimeString === 'number' || !isNaN(Number(dateTimeString))) {
          date = new Date(Number(dateTimeString));
        } 
        // Check if it's a string that needs parsing
        else if (typeof dateTimeString === 'string') {
          date = new Date(dateTimeString);
        }
        // In any other case, assume it's already a date object or try to convert it
        else {
          date = new Date(dateTimeString as any);
        }
        
        // Check if the date is valid
        if (isNaN(date.getTime())) {
          console.error('Invalid date:', dateTimeString);
          return 'Invalid date';
        }
        
        // Format as MM/DD/YYYY
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        
        console.log('Parsed date components:', { month, day, year });
        
        return `${month}/${day}/${year}`;
      } catch (error) {
        console.error('Error formatting date:', error, 'for input:', dateTimeString);
        return 'Date error';
      }
    };
    
    // Update the getEventDate function to better handle date formats
    const getEventDate = () => {
      console.log('Event dates:', event.dates);
      
      // Check if we have dates array with valid date entries
      if (event.dates && Array.isArray(event.dates) && event.dates.length > 0) {
        // Log the first date to debug
        console.log('First date in array:', event.dates[0]);
        
        // Try to get the date from the first entry in the dates array
        if (event.dates[0] && event.dates[0].date) {
          console.log('Using date from dates array:', event.dates[0].date);
          return formatDate(event.dates[0].date);
        }
      }
      
      // If we have an eventTime, use that
      if (event.eventTime) {
        console.log('Using eventTime:', event.eventTime);
        return formatDate(event.eventTime);
      }
      
      // If we have a createdAt timestamp, use that as a fallback
      if (event.createdAt) {
        console.log('Using createdAt as fallback:', event.createdAt);
        return formatDate(event.createdAt);
      }
      
      // Last resort fallback
      return 'No date available';
    };
    
    return (
      <View key={event.id} style={styles.eventItem}>
        <ImageBackground
          source={backgroundSource || undefined}
          style={[
            styles.eventBackground,
            { backgroundColor: event.bgColor || '#f5f5f5' }
          ]}
          resizeMode="cover"
        >
          {/* Add a semi-transparent header tile with the event's tileColor */}
          <View style={[
            styles.eventHeaderTile,
            { backgroundColor: tileColor }
          ]}>
            <Text style={[
              styles.eventName,
              {
                color: event.fontColor || 'black',
                fontFamily: event.fontType || 'System',
                fontSize: Math.max((event.fontSize || 18), 18), // Ensure minimum size of 18
                ...(event.textShadowEnabled ? {
                  textShadowColor: 'rgba(0, 0, 0, 0.75)',
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 3,
                } : {})
              }
            ]}>
              {event.eventName || 'Unnamed Event'}
            </Text>
            
            <Text style={[
              styles.eventLocation,
              {
                color: event.fontColor || 'black',
                fontFamily: event.fontType || 'System',
                fontSize: Math.max((event.fontSize || 16) - 2, 16), // Ensure minimum size of 16
              }
            ]}>
              {event.location || 'No location'}
            </Text>
            
            <Text style={[
              styles.eventTime,
              {
                color: event.fontColor || 'black',
                fontFamily: event.fontType || 'System',
                fontSize: Math.max((event.fontSize || 14) - 2, 14), // Ensure minimum size of 14
              }
            ]}>
              {getEventDate()}
            </Text>

            {/* Show LIVE indicator badge for events that are not drafts */}
            {!isDraft && (
              <View style={styles.liveIndicator}>
                <Text style={styles.liveIndicatorText}>LIVE</Text>
              </View>
            )}
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.viewButton]}
              onPress={() => handleViewEvent(event)}
            >
              <Text style={[styles.buttonText, { color: 'navy' }]}>View</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditEvent(event)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteEvent(event.id, isDraft)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  };

  // Update the render method to be more strict about showing events only when logged in
  if (isLoading) {
    return (
      <ImageBackground
        source={require('../ios/assets/blue.jpg')}
        style={styles.background}
      >
        <View style={styles.centeredContent}>
          <ActivityIndicator size="large" color="gold" />
          <Text style={styles.message}>Loading events...</Text>
        </View>
      </ImageBackground>
    );
  }

  // If not logged in, show login required screen
  if (!isLoggedIn) {
    return (
      <ImageBackground
        source={require('../ios/assets/blue.jpg')}
        style={styles.background}
      >
        <View style={styles.centeredContent}>
          <Text style={styles.message}>Please log in to view your events</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('ProfileSetup')}
          >
            <Text style={styles.createButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  // If logged in but has no events, show the "Create Event" button
  if (submittedEvents.length === 0 && draftEvents.length === 0) {
    return (
      <ImageBackground
        source={require('../ios/assets/blue.jpg')}
        style={styles.background}
      >
        <View style={styles.centeredContent}>
          <Text style={styles.message}>You haven't created any events yet.</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('CreateEvent')}
          >
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  // Only show this content if logged in
  return (
    <ImageBackground
      source={require('../ios/assets/blue.jpg')}
      style={styles.background}
    >
      <View style={[styles.container, { backgroundColor: 'transparent' }]}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.sectionContainer}>
            <View style={styles.centeredTitleContainer}>
              <Text style={styles.centeredTitle}>My Events</Text>
              {isLoggedIn && currentUsername ? (
                <Text style={styles.usernameText}>
                  Logged in as: {currentUsername}
                </Text>
              ) : (
                <Text style={[styles.usernameText, {color: 'red'}]}>
                  Not logged in
                </Text>
              )}
            </View>
            
            {/* Only show events if we have some AND user is logged in */}
            {(!isLoggedIn || (submittedEvents.length === 0 && draftEvents.length === 0)) ? (
              <Text style={styles.emptyMessage}>
                {isLoggedIn 
                  ? "You haven't created any events yet. Tap the + button below to create one."
                  : "Please log in to view your events."}
              </Text>
            ) : (
              // Only map over events if there are any AND user is logged in
              [...submittedEvents, ...draftEvents].map((event) => (
                <React.Fragment key={event.id}>
                  {renderEvent(event, event.isDraft || false)}
                </React.Fragment>
              ))
            )}
            
            <TouchableOpacity
              style={styles.floatingActionButton}
              onPress={() => {
                if (isLoggedIn) {
                  navigation.navigate('CreateEvent');
                } else {
                  Alert.alert(
                    'Login Required',
                    'Please log in to create events',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Log In', 
                        onPress: () => navigation.navigate('ProfileSetup')
                      }
                    ]
                  );
                }
              }}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  eventItem: {
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 5,
  },
  button: {
    backgroundColor: 'gold',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    minWidth: 150,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
    minWidth: 75,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  viewButton: {
    backgroundColor: 'gold',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'navy',
    textAlign: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  eventTile: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  draftEventTile: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 0,
    shadowColor: 'transparent',
    elevation: 0,
  },
  eventBackground: {
    padding: 15,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  eventLocation: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 0,
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  sectionContainer: {
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    shadowColor: 'transparent',
    elevation: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 5,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  floatingActionButton: {
    position: 'relative',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'gold',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    color: 'white',
    marginBottom: 20,
  },
  centeredTitleContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    paddingTop: 10,
  },
  centeredTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'navy',
    textAlign: 'center',
  },
  eventHeaderTile: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  usernameText: {
    fontSize: 14,
    color: 'navy',
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  liveIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(46, 204, 113, 0.85)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  liveIndicatorText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
});

export default MyEventsScreen;
