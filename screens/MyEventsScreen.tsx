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
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EncryptedStorage from 'react-native-encrypted-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkLoginStatus, clearLoginStatus } from '../utils/StorageUtils';
import ChatButton from '../components/ChatButton';
import Header from '../components/Header';

// Update type definitions at the top of the file
type RootStackParamList = {
  Home: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  MyEvents: undefined;
  ProfileSetup: { skipWelcome?: boolean };
  SignUpScreen: {
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
    backgroundImage?: string | null;
    index?: string;
    headerTileColor?: string;
    headerFontColor?: string;
    textNotificationsEnabled?: boolean;
    organizerPhone?: string;
    emailNotificationsEnabled?: boolean;
    organizerEmail?: string;
    globalNote?: string;
    slotLabels?: Record<string, string>;
    textShadowEnabled?: boolean;
    isTimeSlot?: boolean;
    isPreview?: boolean;
    isEditing?: boolean;
  };
  UserProfile: undefined;
  EventSignUp: {
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
    headerTileColor?: string;
    headerFontColor?: string;
    isPremium?: boolean;
    isDesigner?: boolean;
  };
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
  currentTheme?: {
    bgColor: string;
    fontColor: string;
    fontSize: number;
    fontType: string;
    tileColor: string;
  };
  currentThemeName?: string;
  customTileNames?: Record<string, string>;
  participantNames?: string[];
  isPremium?: boolean;
  isDesigner?: boolean;
};

const MyEventsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const [submittedEvents, setSubmittedEvents] = useState<Event[]>([]);
  const [draftEvents, setDraftEvents] = useState<Event[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
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
      console.log('Loading events for user:', username);
      
      // Load draft events
      const draftKey = `draftEvents_${username}`;
      const draftEventsJson = await AsyncStorage.getItem(draftKey);
      const loadedDraftEvents = draftEventsJson ? JSON.parse(draftEventsJson) : [];
      console.log('Loaded draft events:', loadedDraftEvents);
      
      // Load submitted events
      const submittedKey = `submittedEvents_${username}`;
      const submittedEventsJson = await AsyncStorage.getItem(submittedKey);
      const loadedSubmittedEvents = submittedEventsJson ? JSON.parse(submittedEventsJson) : [];
      console.log('Loaded submitted events:', loadedSubmittedEvents);
      
      // Update state with loaded events
      setDraftEvents(loadedDraftEvents);
      setSubmittedEvents(loadedSubmittedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      Alert.alert('Error', 'Failed to load events. Please try again.');
    }
  };

  const handleEditEvent = (event: Event) => {
    // Navigate to SignUpScreen with all event details
    navigation.navigate('SignUpScreen', {
      eventName: event.eventName,
      location: event.location,
      organizer: event.organizer,
      address: event.address,
      eventTime: event.eventTime,
      neededItems: event.neededItems || [],
      dates: event.dates || [],
      timeSlots: event.timeSlots || [],
      bgColor: event.bgColor,
      fontColor: event.fontColor,
      fontSize: event.fontSize,
      fontType: event.fontType,
      tileColor: event.tileColor,
      backgroundImage: event.backgroundImage,
      index: event.eventId,
      headerTileColor: event.headerTileColor || event.tileColor,
      headerFontColor: event.headerFontColor || event.fontColor,
      textNotificationsEnabled: event.textNotificationsEnabled,
      organizerPhone: event.organizerPhone,
      emailNotificationsEnabled: event.emailNotificationsEnabled,
      organizerEmail: event.organizerEmail,
      globalNote: event.globalNote,
      slotLabels: event.slotLabels,
      textShadowEnabled: event.textShadowEnabled,
      isTimeSlot: event.isTimeSlot,
      isPreview: false,
      isEditing: true
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
                
                // Filter out the event with the matching ID (check both eventId and id)
                const updatedEvents = events.filter((event: Event) => {
                  const matches = event.id !== eventId && event.eventId !== eventId;
                  if (!matches) {
                    console.log('Found event to delete:', {
                      id: event.id,
                      eventId: event.eventId,
                      name: event.eventName
                    });
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
    // Navigate to EventSignUpScreen to view signups
    navigation.navigate('EventSignUp', {
      eventId: event.eventId,
      id: event.id,
      username: event.username,
      eventName: event.eventName,
      location: event.location,
      organizer: event.organizer,
      address: event.address,
      eventTime: event.eventTime,
      neededItems: event.neededItems || [],
      dates: event.dates || [],
      timeSlots: event.timeSlots || [],
      bgColor: event.bgColor || 'white',
      fontColor: event.fontColor || 'black',
      fontSize: event.fontSize || 16,
      fontType: event.fontType || 'sans-serif',
      tileColor: event.tileColor || '#f0f0f0',
      textNotificationsEnabled: event.textNotificationsEnabled || false,
      organizerPhone: event.organizerPhone || '',
      emailNotificationsEnabled: event.emailNotificationsEnabled || false,
      organizerEmail: event.organizerEmail || '',
      globalNote: event.globalNote || '',
      slotLabels: event.slotLabels || {},
      backgroundImage: event.backgroundImage || null,
      textShadowEnabled: event.textShadowEnabled || false,
      isTimeSlot: event.isTimeSlot || false,
      isNewEvent: false,
      isPreview: false,
      headerTileColor: event.headerTileColor || event.tileColor || '#f0f0f0',
      headerFontColor: event.headerFontColor || event.fontColor || 'black',
      screenBgColor: event.bgColor || 'white',
      modalFontColor: event.fontColor || 'black',
      modalFontSize: event.fontSize || 16,
      modalFontType: event.fontType || 'sans-serif',
      modalTileColor: event.tileColor || '#f0f0f0',
      isPremium: event.isPremium || false,
      isDesigner: event.isDesigner || false
    });
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
      
      // First check if there's a specific tileColor set
      if (event.tileColor) {
        console.log('Using event tileColor:', event.tileColor);
        
        // For React Native, we'll use our mapping or direct hex conversion
        return `rgba(${hexToRgb(event.tileColor)}, 0.8)`;
      }
      
      // If no tileColor, check if there's a theme we can use
      if (event.currentTheme) {
        console.log('Using currentTheme:', event.currentTheme);
        return `rgba(${hexToRgb(event.currentTheme.tileColor)}, 0.8)`;
      }
      
      // If no theme, check if there's a theme name we can use
      if (event.currentThemeName) {
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
        
        const color = themeColors[event.currentThemeName];
        if (color) {
          console.log('Using theme name color:', color);
          return color;
        }
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
    const backgroundImageSource = getBackgroundImageSource(event);
    const tileColor = getTileColor(event);
    const headerTileColor = event.headerTileColor || tileColor;

    return (
      <View style={styles.eventCard}>
        <ImageBackground
          source={backgroundImageSource}
          style={[styles.eventCardBackground, { backgroundColor: event.bgColor || 'white' }]}
        >
          {!isDraft && (
            <View style={styles.liveIconContainer}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          <View style={[styles.eventCardContent, { backgroundColor: headerTileColor }]}>
            <View style={styles.eventHeader}>
              <Text style={[styles.eventTitle, { 
                fontFamily: event.fontType || 'sans-serif',
                color: event.headerFontColor || event.fontColor || 'black'
              }]}>
                {event.eventName}
              </Text>
            </View>
            <Text style={[styles.eventDetail, { 
              fontFamily: event.fontType || 'sans-serif',
              color: event.headerFontColor || event.fontColor || 'black'
            }]}>
              Location: {event.location}
            </Text>
            <Text style={[styles.eventDetail, { 
              fontFamily: event.fontType || 'sans-serif',
              color: event.headerFontColor || event.fontColor || 'black'
            }]}>
              Organizer: {event.organizer}
            </Text>
            {event.eventTime && (
              <Text style={[styles.eventDetail, { 
                fontFamily: event.fontType || 'sans-serif',
                color: event.headerFontColor || event.fontColor || 'black'
              }]}>
                Time: {event.eventTime}
              </Text>
            )}
          </View>
          <View style={styles.eventActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { minWidth: 80, backgroundColor: '#4CAF50' }]} 
              onPress={() => handleViewEvent(event)}
            >
              <MaterialIcons name="visibility" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { minWidth: 80, backgroundColor: 'gold' }]} 
              onPress={() => handleEditEvent(event)}
            >
              <MaterialIcons name="edit" size={24} color="navy" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton, { minWidth: 80 }]}
              onPress={() => handleDeleteEvent(event.eventId, isDraft)}
            >
              <MaterialIcons name="delete" size={24} color="white" />
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
            onPress={() => {
              navigation.navigate('ProfileSetup', { skipWelcome: true });
            }}
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
    <View style={styles.container}>
      <Header username={currentUsername} />
      <ImageBackground
        source={require('../ios/assets/blue.jpg')}
        style={styles.background}
        resizeMode="stretch"
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
                        onPress: () => navigation.navigate('ProfileSetup', { skipWelcome: true })
                      }
                    ]
                  );
                }
              }}
            >
              <MaterialIcons name="add" size={24} color="navy" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
    paddingBottom: 20,
  },
  sectionContainer: {
    marginBottom: 20,
    marginTop: 0,
    backgroundColor: 'transparent',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
  },
  centeredTitleContainer: {
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 0,
    paddingTop: 0,
  },
  centeredTitle: {
    fontSize: 36,
    marginTop: 5,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 14,
    color: 'navy',
    marginTop: 5,
    marginBottom: -5,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
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
  eventCard: {
    marginVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000',
  },
  eventCardBackground: {
    padding: 16,
    borderRadius: 10,
  },
  eventCardContent: {
    padding: 5,
    width: '78%',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  eventDetail: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 2,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    paddingHorizontal: 10,
    gap: 10,
  },
  actionButton: {
    backgroundColor: 'gold',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteButton: {
    backgroundColor: 'red',
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
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'navy',
    textAlign: 'center',
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
  noEventsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  createEventButton: {
    backgroundColor: 'gold',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 10,
  },
  createEventButtonText: {
    color: 'navy',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  draftBadge: {
    backgroundColor: 'red',
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  liveIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'red',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default MyEventsScreen;
