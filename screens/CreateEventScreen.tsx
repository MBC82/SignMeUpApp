import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, ImageBackground, Image, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EncryptedStorage from 'react-native-encrypted-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';

interface TimeSlot {
  start: string;
  end: string;
  isTimeSlot: boolean;
}

interface EventDate {
  date: string;
  signups: number;
  notes: (string | null)[];
  isTimeSlot: boolean;
}

interface NeededItem {
  id: number;
  value: string;
}

interface TimeSlots {
  [key: string]: TimeSlot[];
}

interface RootStackParamList {
  EnhancedSignUp: NavigationParams;
  EventDetailsScreen: NavigationParams;
  [key: string]: NavigationParams | undefined;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProfileData {
  username: string;
  profileImage: string | null;
}

interface NavigationParams {
  eventId: string;
  id: string;
  username: string;
  eventName: string;
  location: string;
  organizer: string;
  address: string;
  eventTime: string;
  neededItems: string[];
  dates: EventDate[];
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
  slotLabels: Record<string, string>;
  backgroundImage: string | null;
  textShadowEnabled: boolean;
  isTimeSlot: boolean;
  isNewEvent: boolean;
  isPreview: boolean;
  showThemes: boolean;
  isDraft?: boolean;
}

interface Props {
  route: {
    params?: {
      bgColor?: string;
      fontColor?: string;
      fontSize?: number;
      fontType?: string;
      tileColor?: string;
      isEditing?: boolean;
      eventData?: NavigationParams;
    };
  };
}

const CreateEventScreen: React.FC<Props> = ({ route }) => {
  // Rename the destructured variable to avoid conflict
  const {
    bgColor: routeBgColor,
    fontColor: routeFontColor,
    fontSize: routeFontSize,
    fontType: routeFontType,
    tileColor: routeTileColor
  } = route.params || {};

  // Add all the state variables with their setters
  const [customBgColor, setCustomBgColor] = useState(routeBgColor || 'white');
  const [customFontColor, setCustomFontColor] = useState(routeFontColor || 'black');
  const [customFontSize, setCustomFontSize] = useState(routeFontSize || 16);
  const [customFontType, setCustomFontType] = useState(routeFontType || 'Arial');
  const [customTileColor, setCustomTileColor] = useState(routeTileColor || '#f0f0f0');

  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState<string | null>('');
  const [organizer, setOrganizer] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlots>({});
  const [dates, setDates] = useState<EventDate[]>([]);
  const [neededItems, setNeededItems] = useState<NeededItem[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState<string>('0');
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number>(0);
  const [isTimePickerVisible, setTimePickerVisibility] = useState<boolean>(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState<boolean>(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [textNotificationsEnabled, setTextNotificationsEnabled] = useState(false);
  const [organizerPhone, setOrganizerPhone] = useState('');
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [notificationPhone, setNotificationPhone] = useState('');
  const [notificationEmail, setNotificationEmail] = useState('');
  const [globalNote, setGlobalNote] = useState('');
  const [slotLabels, setSlotLabels] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState({
    overlappingSlots: false,
    missingDates: false
  });

  const navigation = useNavigation<NavigationProp>();

  // Profile data loaded from AsyncStorage
  const [profileData, setProfileData] = useState({
    profileImage: null,
    name: '',
    email: '',
    phone: '',
    bio: ''
  });

  // Add this state at the top of your component
  const [username, setUsername] = useState('');

  // Load profile data from AsyncStorage on focus
  useFocusEffect(
    useCallback(() => {
      const loadProfileData = async () => {
        try {
          // Check if user is logged in first
          const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
          const storedUsername = await EncryptedStorage.getItem('username');
          
          if (isLoggedIn === 'true' && storedUsername) {
            setUsername(storedUsername); // Set the username state
            const userProfileString = await EncryptedStorage.getItem('userProfile');
            if (userProfileString) {
              const userProfile = JSON.parse(userProfileString);
              setProfileData({
                profileImage: userProfile.profileImage || null,
                name: userProfile.name || '',
                email: userProfile.email || '',
                phone: userProfile.phone || '',
                bio: userProfile.bio || ''
              });
              // Only set organizer if user is logged in
              setOrganizer(userProfile.name || '');
            }
          } else {
            // Clear profile data and organizer if not logged in
            setUsername(''); // Clear username
            setProfileData({
              profileImage: null,
              name: '',
              email: '',
              phone: '',
              bio: ''
            });
            setOrganizer('');
          }
        } catch (error) {
          console.log('Error loading profile data:', error);
        }
      };

      loadProfileData();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({
      headerShown: false
    });
  }, [navigation]);

  useEffect(() => {
    if (route.params?.isEditing && route.params?.eventData) {
      const eventData = route.params.eventData;
      
      // Convert string[] to NeededItem[]
      const convertedNeededItems = eventData.neededItems.map((item: string, index: number) => ({
        id: index,
        value: item
      }));
      
      setNeededItems(convertedNeededItems);
      setEventName(eventData.eventName);
      setLocation(eventData.location);
      setAddress(eventData.address);
      setOrganizer(eventData.organizer);
      setEventTime(eventData.eventTime);
      setTimeSlots(eventData.timeSlots);
      setDates(eventData.dates);
      setTextNotificationsEnabled(eventData.textNotificationsEnabled);
      setOrganizerPhone(eventData.organizerPhone);
      setEmailNotificationsEnabled(eventData.emailNotificationsEnabled);
      setOrganizerEmail(eventData.organizerEmail);
      setGlobalNote(eventData.globalNote || '');
      setSlotLabels(eventData.slotLabels || {});
      
      // Set custom styling
      setCustomBgColor(eventData.bgColor || '#FFFFFF');
      setCustomFontColor(eventData.fontColor || '#000000');
      setCustomFontSize(eventData.fontSize || 16);
      setCustomFontType(eventData.fontType || 'Arial');
      setCustomTileColor(eventData.tileColor || '#FFFFFF');
    }
  }, [route.params]);

  const showTimePicker = (dateIndex: string, slotIndex: number, isEndTime = false) => {
    setCurrentDateIndex(dateIndex);
    setCurrentSlotIndex(slotIndex);
    if (isEndTime) {
      setEndTimePickerVisibility(true);
    } else {
      setTimePickerVisibility(true);
    }
  };

  const handleTimeChange = (dateIndex: number, slotIndex: number, field: 'start' | 'end', value: Date) => {
    const newTimeSlots: TimeSlots = { ...timeSlots };
    if (!newTimeSlots[dateIndex]) {
      newTimeSlots[dateIndex] = [];
    }
    if (!newTimeSlots[dateIndex][slotIndex]) {
      newTimeSlots[dateIndex][slotIndex] = { start: '', end: '', isTimeSlot: true };
    }
    newTimeSlots[dateIndex][slotIndex][field] = value.toLocaleTimeString();
    setTimeSlots(newTimeSlots);
  };

  const renderTimeSlots = (dateIndex: string) => {
    if (!timeSlots[dateIndex]) return null;
    return timeSlots[dateIndex].map((slot: TimeSlot, slotIndex: number) => (
      <View key={slotIndex} style={styles.slotContainer}>
        {slot.isTimeSlot ? (
          <View style={styles.timeSlotView}>
            <Text style={styles.slotLabel}>
              {slotLabels[`${dateIndex}-${slotIndex}`] || `Time Slot ${slotIndex + 1}`}
            </Text>
            <View style={styles.timeSlotRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => showTimePicker(dateIndex, slotIndex)}
              >
                <Text style={styles.timeButtonText}>
                  {slot.start || 'Set Start Time'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.timeSeperator}>to</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => showTimePicker(dateIndex, slotIndex, true)}
              >
                <Text style={styles.timeButtonText}>
                  {slot.end || 'Set End Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    ));
  };

  const showDatePicker = (index: number) => {
    setCurrentDateIndex(index.toString());
    setDatePickerVisibility(true);
  };

  const handleDateChange = (dateIndex: number, value: Date) => {
    const newDates = [...dates];
    if (!newDates[dateIndex]) {
      newDates[dateIndex] = { date: '', signups: 1, notes: [], isTimeSlot: true };
    }
    newDates[dateIndex].date = value.toDateString();
    setDates(newDates);
    setDatePickerVisibility(false);
  };

  // Add this useEffect to initialize with one date if none exist
  useEffect(() => {
    if (dates.length === 0) {
      setDates([{ date: '', signups: 1, notes: [], isTimeSlot: true }]);
    }
  }, []);

  const addNeededField = () => {
    setNeededItems([...neededItems, { id: neededItems.length + 1, value: '' }]);
  };

  const removeNeededField = (id: number) => {
    setNeededItems(neededItems.filter((item) => item.id !== id));
  };

  const addNote = (dateIndex: number, slotIndex: number) => {
    const updatedDates = [...dates];
    if (!updatedDates[dateIndex].notes) {
      updatedDates[dateIndex].notes = [];
    }
    while (updatedDates[dateIndex].notes.length <= slotIndex) {
      updatedDates[dateIndex].notes.push(undefined);
    }
    updatedDates[dateIndex].notes[slotIndex] = '';
    setDates(updatedDates);
  };

  // Add new state to track which slots have notes enabled
  const [showNotes, setShowNotes] = useState<{ [key: number]: boolean }>({});

  // Add function to toggle note visibility
  const toggleNote = (dateIndex: number, slotIndex: number) => {
    setShowNotes(prev => ({
      ...prev,
      [`${dateIndex}-${slotIndex}`]: !prev[`${dateIndex}-${slotIndex}`]
    }));
  };

  // Update the renderSlotsOrAttendees function
  const renderSlotsOrAttendees = (dateIndex: number) => {
    const date = dates[dateIndex];
    
    return Array.from({ length: date.signups }).map((_, slotIndex) => (
      <View key={slotIndex} style={styles.slotContainer}>
        {date.isTimeSlot ? (
          // Time slot view
          <View style={styles.timeSlotView}>
            <Text style={styles.slotLabel}>
              {showNotes[`${dateIndex}-${slotIndex}`] ? "Custom Label" : `Time Slot ${slotIndex + 1}`}
            </Text>
            <View style={styles.timeSlotRow}>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => showTimePicker(dateIndex.toString(), slotIndex)}
              >
                <Text style={styles.timeButtonText}>
                  {timeSlots[dateIndex.toString()]?.[slotIndex]?.start || 'Set Start Time'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.timeSeperator}>to</Text>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => showTimePicker(dateIndex.toString(), slotIndex, true)}
              >
                <Text style={styles.timeButtonText}>
                  {timeSlots[dateIndex.toString()]?.[slotIndex]?.end || 'Set End Time'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Existing attendee slot view
          <View style={styles.attendeeSlot}>
            <Text style={styles.attendeeLabel}>Attendee {slotIndex + 1}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addNoteButton}
          onPress={() => toggleNote(dateIndex, slotIndex)}
        >
          <MaterialIcons 
            name={showNotes[`${dateIndex}-${slotIndex}`] ? "remove-circle" : "add-circle"} 
            size={24} 
            color="#007bff" 
          />
          <Text style={styles.addNoteText}>
            {showNotes[`${dateIndex}-${slotIndex}`] ? 'Remove Note' : 'Add Note'}
          </Text>
        </TouchableOpacity>

        {showNotes[`${dateIndex}-${slotIndex}`] && (
          <TextInput
            style={styles.noteInput}
            placeholder={date.isTimeSlot ? "Add a note for this time slot" : "Add a note for this attendee"}
            value={date.notes[slotIndex] || ''}
            onChangeText={(text) => {
              const updatedDates = [...dates];
              if (!updatedDates[dateIndex].notes) {
                updatedDates[dateIndex].notes = [];
              }
              updatedDates[dateIndex].notes[slotIndex] = text;
              setDates(updatedDates);
            }}
          />
        )}
      </View>
    ));
  };

  const toggleShowTimeSlots = (dateIndex: number) => {
    const updatedDates = [...dates];
    updatedDates[dateIndex].isTimeSlot = !updatedDates[dateIndex].isTimeSlot;
    setDates(updatedDates);
  };

  const addNewDate = () => {
    setDates([...dates, { date: '', signups: 1, notes: [], isTimeSlot: true }]);
  };

  const removeDate = (index: number) => {
    const newDates = dates.filter((_, i) => i !== index);
    setDates(newDates);
  };

  // Add new state for the global note
  const [showGlobalNote, setShowGlobalNote] = useState(false);

  const handleSubmit = async () => {
    // Check for missing dates
    if (checkMissingDates()) {
      Alert.alert('Missing Information', 'Please select a date for all slots before continuing.');
      return;
    }

    // Check for overlapping time slots
    if (validationErrors.overlappingSlots) {
      Alert.alert(
        'Time Slot Overlap',
        'Some time slots are overlapping. Would you like to continue anyway?',
        [
          {
            text: "No, I'll Fix It",
            style: "cancel"
          },
          {
            text: "Yes, Continue",
            onPress: () => submitEvent()
          }
        ]
      );
      return;
    }

    await submitEvent();
  };

  const submitEvent = async () => {
    try {
      const username = await EncryptedStorage.getItem('username');
      if (!username) {
        Alert.alert('Error', 'You must be logged in to create events');
        return;
      }

      const eventId = Date.now().toString();

      // Convert timeSlots from object to array format
      const formattedTimeSlots = Object.keys(timeSlots).map(dateIndex => {
        return timeSlots[dateIndex].map(slot => ({
          start: slot.start,
          end: slot.end
        }));
      });

      const eventData: NavigationParams = {
        id: eventId,
        eventId: eventId,
        username,
        eventName,
        location,
        organizer,
        address,
        eventTime,
        neededItems: neededItems.map(item => item.value),
        dates: dates.map(date => ({
          ...date,
          labels: date.notes?.map(note => note || '') || []
        })),
        timeSlots: formattedTimeSlots, // Use the formatted time slots
        bgColor: customBgColor || '#FFFFFF',
        fontColor: customFontColor || '#000000',
        fontSize: customFontSize || 16,
        fontType: customFontType || 'Arial',
        tileColor: customTileColor || '#FFFFFF',
        textNotificationsEnabled,
        organizerPhone: textNotificationsEnabled ? organizerPhone : '',
        emailNotificationsEnabled,
        organizerEmail: emailNotificationsEnabled ? organizerEmail : '',
        globalNote,
        isDraft: false,
        status: 'Submitted',
        slotLabels: {},
        backgroundImage: null,
        textShadowEnabled: false,
        isTimeSlot: false,
        isNewEvent: true,
        isPreview: false,
        showThemes: false,
      };

      // Save to submitted events
      const submittedString = await AsyncStorage.getItem(`submittedEvents_${username}`);
      const submittedEvents = submittedString ? JSON.parse(submittedString) : [];
      submittedEvents.push(eventData);
      await AsyncStorage.setItem(`submittedEvents_${username}`, JSON.stringify(submittedEvents));

      // Navigate to SignUpScreen
      navigation.navigate('SignUpScreen', eventData);
    } catch (error) {
      console.error('Error submitting event:', error);
      Alert.alert('Error', 'Failed to create event');
    }
  };

  const incrementSignup = (dateIndex: number) => {
    const newDates = [...dates];
    newDates[dateIndex].signups += 1;
    if (!newDates[dateIndex].notes) {
      newDates[dateIndex].notes = [];
    }
    newDates[dateIndex].notes.push('');
    setDates(newDates);
  };

  const decrementSignup = (dateIndex: number) => {
    const newDates = [...dates];
    if (newDates[dateIndex].signups > 1) {
      newDates[dateIndex].signups -= 1;
      newDates[dateIndex].notes.pop();
      setDates(newDates);
    }
  };

  const checkTimeOverlap = () => {
    let hasOverlap = false;
    
    for (const dateIndex in timeSlots) {
      const slots = timeSlots[dateIndex];
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const [start1, end1] = [new Date(`1970-01-01T${slots[i].start}`), new Date(`1970-01-01T${slots[i].end}`)];
          const [start2, end2] = [new Date(`1970-01-01T${slots[j].start}`), new Date(`1970-01-01T${slots[j].end}`)];
          if ((start1 < end2 && start2 < end1)) {
            hasOverlap = true;
            setValidationErrors(prev => ({ ...prev, overlappingSlots: true }));
            return;
          }
        }
      }
    }
    
    if (!hasOverlap) {
      setValidationErrors(prev => ({ ...prev, overlappingSlots: false }));
    }
  };

  const checkMissingDates = () => {
    const hasMissingDates = dates.some(date => !date.date);
    setValidationErrors(prev => ({ ...prev, missingDates: hasMissingDates }));
    return hasMissingDates;
  };

  useEffect(() => {
    checkTimeOverlap();
  }, [timeSlots]);

  const saveAsDraft = async () => {
    try {
      const username = await EncryptedStorage.getItem('username');
      if (!username) {
        Alert.alert('Error', 'You must be logged in to save drafts');
        return;
      }

      const eventId = Date.now().toString();

      const draftData = {
        id: eventId,
        eventId: eventId,
        username,
        eventName,
        location,
        organizer,
        address,
        eventTime,
        neededItems: neededItems.map(item => item.value),
        dates: dates.map(date => ({
          ...date,
          labels: date.notes?.map(note => note || '') || []
        })),
        timeSlots: Object.keys(timeSlots).map(dateIndex => {
          return timeSlots[dateIndex].map(slot => ({
            start: slot.start,
            end: slot.end
          }));
        }),
        bgColor: customBgColor || '#FFFFFF',
        fontColor: customFontColor || '#000000',
        fontSize: customFontSize || 16,
        fontType: customFontType || 'Arial',
        tileColor: customTileColor || '#FFFFFF',
        textNotificationsEnabled,
        organizerPhone: textNotificationsEnabled ? organizerPhone : '',
        emailNotificationsEnabled,
        organizerEmail: emailNotificationsEnabled ? organizerEmail : '',
        globalNote,
        isDraft: true,
        status: 'Draft',
        slotLabels: {},
        backgroundImage: null,
        textShadowEnabled: false,
        isTimeSlot: false,
        isNewEvent: true
      };

      const draftString = await AsyncStorage.getItem(`draftEvents_${username}`);
      const draftEvents = draftString ? JSON.parse(draftString) : [];
      draftEvents.push(draftData);
      await AsyncStorage.setItem(`draftEvents_${username}`, JSON.stringify(draftEvents));

      Alert.alert('Success', 'Draft saved successfully');
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft');
    }
  };

  // Update the initial state
  const [showAddressField, setShowAddressField] = useState(false);
  const [showTimeField, setShowTimeField] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  
  // Update the authentication check useEffect
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check both login status and username
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const username = await EncryptedStorage.getItem('username');
        const userProfile = await EncryptedStorage.getItem('userProfile');

        if (isLoggedIn === 'true' && username && userProfile) {
          // User is authenticated, load their data
          const profile = JSON.parse(userProfile);
          setOrganizer(profile.name || '');
        } else {
          // Clear organizer if not logged in
          setOrganizer('');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setOrganizer(''); // Clear organizer on error
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Update the notification info effect
  useEffect(() => {
    const updateNotificationInfo = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('isLoggedIn');
        const userProfile = await EncryptedStorage.getItem('userProfile');
        
        if (isLoggedIn === 'true' && userProfile) {
          const profile = JSON.parse(userProfile);
          if (emailNotificationsEnabled && profile.email) {
            setOrganizerEmail(profile.email);
          }
          if (textNotificationsEnabled && profile.phone) {
            setOrganizerPhone(profile.phone);
          }
        } else {
          // Clear notification info if not logged in
          setOrganizerEmail('');
          setOrganizerPhone('');
        }
      } catch (error) {
        console.error('Error updating notification info:', error);
      }
    };

    updateNotificationInfo();
  }, [emailNotificationsEnabled, textNotificationsEnabled]);

  // Add this function to log all available screens
  const logAvailableScreens = () => {
    // This will log the navigation state to help debug
    console.log('Navigation state:', navigation.getState());
  };

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const handleSaveEvent = async () => {
    try {
      // Validate required fields
      if (!eventName || !location || !organizer || !eventTime) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Create event data
      const eventData: NavigationParams = {
        eventId: Date.now().toString(),
        id: Date.now().toString(),
        username: username || '',
        eventName,
        location,
        organizer,
        address: address || '',
        eventTime,
        neededItems: neededItems.map(item => item.value),
        dates: dates.map(date => ({
          date: date.date || '',
          signups: date.signups || 1,
          notes: date.notes || [],
          isTimeSlot: date.isTimeSlot || false
        })),
        timeSlots: Object.values(timeSlots),
        bgColor: customBgColor || '#FFFFFF',
        fontColor: customFontColor || '#000000',
        fontSize: customFontSize || 16,
        fontType: customFontType || 'System',
        tileColor: customTileColor || '#F5F5F5',
        textNotificationsEnabled: textNotificationsEnabled || false,
        organizerPhone: organizerPhone || '',
        emailNotificationsEnabled: emailNotificationsEnabled || false,
        organizerEmail: organizerEmail || '',
        globalNote: globalNote || '',
        slotLabels: slotLabels || {},
        backgroundImage: profileData?.profileImage || '',
        textShadowEnabled: false,
        isTimeSlot: true,
        isNewEvent: true,
        isPreview: false,
        showThemes: false,
        isDraft: false
      };

      // Navigate to event details
      navigation.navigate('EventDetailsScreen', eventData);
    } catch (error) {
      console.error('Error saving event:', error);
      Alert.alert('Error', 'Failed to save event');
    }
  };

  const handlePreviewEvent = async () => {
    try {
      // Format timeSlots properly
      const formattedTimeSlots = Object.keys(timeSlots).map((dateIndex: string) => {
        return timeSlots[dateIndex].map((slot: TimeSlot) => ({
          start: slot.start || '',
          end: slot.end || '',
          isTimeSlot: true
        }));
      });

      // Ensure we have valid time slots
      if (!formattedTimeSlots.length) {
        formattedTimeSlots.push([{ start: '', end: '', isTimeSlot: true }]);
      }

      const navigationParams: NavigationParams = {
        eventId: Date.now().toString(),
        id: Date.now().toString(),
        username: username || '',
        eventName: eventName || '',
        location: location || '',
        organizer: organizer || '',
        address: address || '',
        eventTime: eventTime || '',
        neededItems: neededItems.map(item => item.value),
        dates: dates.map(date => ({
          date: date.date || '',
          signups: date.signups || 1,
          notes: date.notes || [],
          isTimeSlot: date.isTimeSlot || false
        })),
        timeSlots: formattedTimeSlots,
        bgColor: customBgColor || '#FFFFFF',
        fontColor: customFontColor || '#000000',
        fontSize: customFontSize || 16,
        fontType: customFontType || 'System',
        tileColor: customTileColor || '#F5F5F5',
        textNotificationsEnabled: textNotificationsEnabled || false,
        organizerPhone: organizerPhone || '',
        emailNotificationsEnabled: emailNotificationsEnabled || false,
        organizerEmail: organizerEmail || '',
        globalNote: globalNote || '',
        slotLabels: {},
        backgroundImage: null,
        textShadowEnabled: false,
        isTimeSlot: true,
        isNewEvent: true,
        isPreview: true,
        showThemes: false
      };

      navigation.navigate('SignUpScreen', navigationParams);
    } catch (error) {
      console.error('Error previewing event:', error);
      Alert.alert('Error', 'Failed to preview event. Please try again.');
    }
  };

  const handleSaveDraft = async () => {
    try {
      const navigationParams: NavigationParams = {
        eventId: Date.now().toString(),
        id: Date.now().toString(),
        username: username || '',
        eventName: eventName || '',
        location: location || '',
        organizer: organizer || '',
        address: address || '',
        eventTime: eventTime || '',
        neededItems: neededItems.map(item => item.value),
        dates: dates.map(date => ({
          date: date.date || '',
          signups: date.signups || 1,
          notes: date.notes || [],
          isTimeSlot: date.isTimeSlot || false
        })),
        timeSlots: Object.values(timeSlots),
        bgColor: customBgColor || '#FFFFFF',
        fontColor: customFontColor || '#000000',
        fontSize: customFontSize || 16,
        fontType: customFontType || 'System',
        tileColor: customTileColor || '#F5F5F5',
        textNotificationsEnabled: textNotificationsEnabled || false,
        organizerPhone: organizerPhone || '',
        emailNotificationsEnabled: emailNotificationsEnabled || false,
        organizerEmail: organizerEmail || '',
        globalNote: globalNote || '',
        slotLabels: {},
        backgroundImage: null,
        textShadowEnabled: false,
        isTimeSlot: true,
        isNewEvent: true,
        isPreview: false,
        showThemes: false,
        isDraft: true
      };

      navigation.navigate('EnhancedSignUp', navigationParams);
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft. Please try again.');
    }
  };

  const handleViewEvent = (event: {
    id: string;
    username: string;
    eventName: string;
    location: string;
    organizer: string;
    address: string;
    eventTime: string;
    neededItems: NeededItem[];
    dates: EventDate[];
    timeSlots: TimeSlots;
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
    slotLabels: Record<string, string>;
    backgroundImage: string | null;
    textShadowEnabled: boolean;
    isTimeSlot: boolean;
    isNewEvent: boolean;
    isPreview: boolean;
    showThemes: boolean;
    isDraft?: boolean;
  }) => {
    const navigationParams: NavigationParams = {
      eventId: event.id,
      id: event.id,
      username: event.username,
      eventName: event.eventName,
      location: event.location,
      organizer: event.organizer,
      address: event.address,
      eventTime: event.eventTime,
      neededItems: event.neededItems.map(item => item.value),
      dates: event.dates,
      timeSlots: Object.values(event.timeSlots),
      bgColor: event.bgColor,
      fontColor: event.fontColor,
      fontSize: event.fontSize,
      fontType: event.fontType,
      tileColor: event.tileColor,
      textNotificationsEnabled: event.textNotificationsEnabled,
      organizerPhone: event.organizerPhone,
      emailNotificationsEnabled: event.emailNotificationsEnabled,
      organizerEmail: event.organizerEmail,
      globalNote: event.globalNote,
      slotLabels: event.slotLabels,
      backgroundImage: event.backgroundImage,
      textShadowEnabled: event.textShadowEnabled,
      isTimeSlot: event.isTimeSlot,
      isNewEvent: event.isNewEvent,
      isPreview: event.isPreview,
      showThemes: event.showThemes,
      isDraft: event.isDraft
    };

    if (event.isDraft) {
      navigation.navigate('EnhancedSignUp', navigationParams);
    } else {
      navigation.navigate('EventDetailsScreen', navigationParams);
    }
  };

  const handleAddTimeSlot = (dateIndex: string) => {
    const newTimeSlots = { ...timeSlots };
    if (!newTimeSlots[dateIndex]) {
      newTimeSlots[dateIndex] = [];
    }
    newTimeSlots[dateIndex].push({ start: '', end: '', isTimeSlot: true });
    setTimeSlots(newTimeSlots);
  };

  const handleRemoveTimeSlot = (dateIndex: string, slotIndex: number) => {
    const newTimeSlots = { ...timeSlots };
    if (newTimeSlots[dateIndex]) {
      newTimeSlots[dateIndex].splice(slotIndex, 1);
      setTimeSlots(newTimeSlots);
    }
  };

  const handleAddDate = () => {
    setDates([...dates, { date: '', signups: 1, notes: [], isTimeSlot: true }]);
  };

  const handleRemoveDate = (dateIndex: number) => {
    const newDates = [...dates];
    newDates.splice(dateIndex, 1);
    setDates(newDates);
  };

  const handleAddNeededItem = () => {
    setNeededItems([...neededItems, { id: Date.now(), value: '' }]);
  };

  const handleRemoveNeededItem = (itemId: number) => {
    setNeededItems(neededItems.filter(item => item.id !== itemId));
  };

  const handleUpdateNeededItem = (itemId: number, value: string) => {
    setNeededItems(neededItems.map(item => 
      item.id === itemId ? { ...item, value } : item
    ));
  };

  // Add new function to check overlaps for a specific slot
  const checkTimeOverlapForSlot = (dateIndex: number, slotIndex: number, slots: any) => {
    const currentSlot = slots[dateIndex][slotIndex];
    if (!currentSlot.start || !currentSlot.end) return;

    const [currentStart, currentEnd] = [
      new Date(`1970-01-01T${currentSlot.start}`),
      new Date(`1970-01-01T${currentSlot.end}`)
    ];

    for (let i = 0; i < slots[dateIndex].length; i++) {
      if (i === slotIndex) continue; // Skip comparing with itself

      const compareSlot = slots[dateIndex][i];
      if (!compareSlot.start || !compareSlot.end) continue;

      const [compareStart, compareEnd] = [
        new Date(`1970-01-01T${compareSlot.start}`),
        new Date(`1970-01-01T${compareSlot.end}`)
      ];

      if (currentStart < compareEnd && compareStart < currentEnd) {
        Alert.alert(
          "Time Slot Overlap",
          `Time slot ${slotIndex + 1} (${currentSlot.start} - ${currentSlot.end}) overlaps with slot ${i + 1} (${compareSlot.start} - ${compareSlot.end}). Did you mean to do this?`,
          [
            {
              text: "No, I'll Fix It",
              style: "cancel"
            },
            {
              text: "Yes, Keep Overlap",
              onPress: () => {
                console.log('User confirmed time slot overlap');
              }
            }
          ],
          { cancelable: false }
        );
        return;
      }
    }
  };

  return (
    <ImageBackground source={require('../ios/assets/navy.jpg')} style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
        <Image
          source={require('../ios/assets/logo.jpg')}
          style={styles.logo}
        />
        
        <View style={styles.inputContainer}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          <Text style={styles.inputLabel}>Event Name</Text>
          <TextInput
            style={[styles.input, { color: 'navy' }]}
            placeholder="Enter Event Name"
            placeholderTextColor="rgba(0, 0, 128, 0.5)"
            value={eventName}
            onChangeText={setEventName}
          />
          <Text style={styles.inputLabel}>Location</Text>
          <TextInput
            style={[styles.input, { color: 'navy' }]}
            placeholder="Enter Location"
            placeholderTextColor="rgba(0, 0, 128, 0.5)"
            value={location}
            onChangeText={setLocation}
          />
          <Text style={styles.inputLabel}>Organizer</Text>
          <TextInput
            style={[styles.input, { color: 'navy' }]}
            placeholder="Enter Organizer"
            placeholderTextColor="rgba(0, 0, 128, 0.5)"
            value={organizer}
            onChangeText={setOrganizer}
          />
          {/* Address Field */}
          {showAddressField ? (
            <View style={styles.neededItemContainer}>
              <TextInput
                style={styles.input}
                placeholder="Address"
                value={address}
                onChangeText={setAddress}
              />
              <TouchableOpacity 
                onPress={() => {
                  setShowAddressField(false);
                  setAddress(null);
                }} 
                style={styles.removeButton}
              >
                <Text style={styles.addButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => {
                setShowAddressField(true);
                setAddress('');
              }} 
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add Address</Text>
            </TouchableOpacity>
          )}
          {/* Time Field */}
          {showTimeField ? (
            <View style={styles.neededItemContainer}>
              <TextInput
                style={styles.input}
                placeholder="Time"
                value={eventTime}
                onChangeText={setEventTime}
              />
              <TouchableOpacity 
                onPress={() => {
                  setShowTimeField(false);
                  setEventTime(null);
                }} 
                style={styles.removeButton}
              >
                <Text style={styles.addButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => {
                setShowTimeField(true);
                setEventTime('');
              }} 
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add Time</Text>
            </TouchableOpacity>
          )}

          {/* Global Note Field */}
          {showGlobalNote ? (
            <View style={styles.neededItemContainer}>
              <TextInput
                style={styles.input}
                placeholder="Note for all participants"
                value={globalNote || ''}
                onChangeText={setGlobalNote}
                multiline
              />
              <TouchableOpacity 
                onPress={() => {
                  setShowGlobalNote(false);
                  setGlobalNote(null);
                }} 
                style={styles.removeButton}
              >
                <Text style={styles.addButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => {
                setShowGlobalNote(true);
                setGlobalNote('');
              }} 
              style={styles.addButton}
            >
              <Text style={styles.addButtonText}>+ Add Note to All Participants</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Settings */}
        <View style={styles.notificationContainer}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.notificationRow}>
            <Text style={styles.notificationText}>Text Notifications</Text>
            <Switch
              value={textNotificationsEnabled}
              onValueChange={setTextNotificationsEnabled}
              trackColor={{ false: 'navy', true: 'navy' }}
            />
          </View>

          <View style={styles.notificationRow}>
            <Text style={styles.notificationText}>Email Notifications</Text>
            <Switch
              value={emailNotificationsEnabled}
              onValueChange={setEmailNotificationsEnabled}
              trackColor={{ false: 'navy', true: 'navy' }}
            />
          </View>
        </View>

        {/* Date Picker Section */}
        <View>
          {dates.map((dateData, dateIndex) => (
            <View key={dateIndex} style={styles.dateContainer}>
              <TouchableOpacity onPress={() => showDatePicker(dateIndex)}>
                <Text style={styles.dateHeader}>
                  {dateData.date || "Select a Date"}
                </Text>
              </TouchableOpacity>

              <View style={styles.timeSlotContainer}>
                <View style={styles.timeSlotToggle}>
                  <Text style={styles.toggleText}>Show time slots</Text>
                  <Switch
                    value={dateData.isTimeSlot}
                    onValueChange={() => toggleShowTimeSlots(dateIndex)}
                    trackColor={{ false: 'navy', true: 'navy' }}
                  />
                </View>
              </View>

              <Text style={[styles.inputLabel, { textAlign: 'center' }]}>
                {dateData.isTimeSlot ? "Select number of timeslots needed:" : "Select number of attendees needed:"}
              </Text>

              <View style={styles.numberPickerContainer}>
                <TouchableOpacity onPress={() => decrementSignup(dateIndex)} style={styles.numberButton}>
                  <Text style={styles.numberButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.numberDisplay}>{dateData.signups}</Text>
                <TouchableOpacity onPress={() => incrementSignup(dateIndex)} style={styles.numberButton}>
                  <Text style={styles.numberButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              {renderSlotsOrAttendees(dateIndex)}

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={(date) => handleDateChange(parseInt(currentDateIndex), date)}
                onCancel={() => setDatePickerVisibility(false)}
              />
            </View>
          ))}

          {/* Select Another Date button */}
          <TouchableOpacity onPress={addNewDate} style={styles.addButton}>
            <Text style={styles.addButtonText}>Select Another Date</Text>
          </TouchableOpacity>
        </View>

        {/* Validation Messages */}
        {(validationErrors.overlappingSlots || validationErrors.missingDates) && (
          <View style={styles.validationContainer}>
            {validationErrors.overlappingSlots && (
              <View style={styles.validationMessage}>
                <MaterialIcons name="warning" size={24} color="#dc3545" />
                <Text style={styles.validationText}>
                  Some time slots are overlapping. Please adjust the times.
                </Text>
              </View>
            )}
            {validationErrors.missingDates && (
              <View style={styles.validationMessage}>
                <MaterialIcons name="warning" size={24} color="#dc3545" />
                <Text style={styles.validationText}>
                  Please select a date for all slots.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]} 
            onPress={handlePreviewEvent}
          >
            <Text style={styles.actionButtonText}>Preview Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]} 
            onPress={handleSaveDraft}
          >
            <Text style={styles.actionButtonText}>Save as Draft</Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={isTimePickerVisible}
          mode="time"
          is24Hour={false}
          display="spinner"
          onConfirm={(time) => {
            const newTimeSlots = { ...timeSlots };
            if (!newTimeSlots[currentDateIndex]) {
              newTimeSlots[currentDateIndex] = [];
            }
            if (!newTimeSlots[currentDateIndex][currentSlotIndex]) {
              newTimeSlots[currentDateIndex][currentSlotIndex] = { start: '', end: '', isTimeSlot: true };
            }
            const hours = time.getHours();
            const minutes = time.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes.toString().padStart(2, '0');
            newTimeSlots[currentDateIndex][currentSlotIndex].start = `${formattedHours}:${formattedMinutes} ${ampm}`;
            setTimeSlots(newTimeSlots);
            setTimePickerVisibility(false);
          }}
          onCancel={() => setTimePickerVisibility(false)}
        />
        <DateTimePickerModal
          isVisible={isEndTimePickerVisible}
          mode="time"
          is24Hour={false}
          display="spinner"
          onConfirm={(time) => {
            const newTimeSlots = { ...timeSlots };
            if (!newTimeSlots[currentDateIndex]) {
              newTimeSlots[currentDateIndex] = [];
            }
            if (!newTimeSlots[currentDateIndex][currentSlotIndex]) {
              newTimeSlots[currentDateIndex][currentSlotIndex] = { start: '', end: '', isTimeSlot: true };
            }
            const hours = time.getHours();
            const minutes = time.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes.toString().padStart(2, '0');
            newTimeSlots[currentDateIndex][currentSlotIndex].end = `${formattedHours}:${formattedMinutes} ${ampm}`;
            setTimeSlots(newTimeSlots);
            setEndTimePickerVisibility(false);
          }}
          onCancel={() => setEndTimePickerVisibility(false)}
        />
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 25,
    marginBottom: 80,
  },
  logo: {
    width: '100%',
    height: 215,
    resizeMode: 'contain',
    marginTop: -28,
    marginBottom: -35,
  },
  inputContainer: {
    backgroundColor: 'rgba(253, 253, 253, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(220, 220, 220, 0.8)',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'navy',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 128, 0.3)',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    marginBottom: 15,
  },
  notificationContainer: {
    backgroundColor: 'rgba(253, 253, 253, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(220, 220, 220, 0.8)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'navy',
    marginBottom: 15,
    textAlign: 'center',
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 128, 0.1)',
  },
  notificationText: {
    fontSize: 16,
    color: 'navy',
    fontWeight: '600',
  },
  dateContainer: {
    backgroundColor: 'rgba(253, 253, 253, 0.95)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(220, 220, 220, 0.8)',
  },
  dateHeader: {
    fontSize: 18,
    color: 'navy',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'rgba(253, 253, 253, 0.95)',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 0.5,
    borderColor: 'rgba(220, 220, 220, 0.8)',
  },
  addButtonText: {
    color: 'navy',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: 'gold',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'navy',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeSlotContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    backgroundColor: 'rgba(252, 252, 252, 0.95)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 128, 0.2)',
  },
  timeSlotToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  toggleText: {
    fontSize: 18,
    color: 'navy',
    fontWeight: '500',
  },
  neededItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  timeBox: {
    borderWidth: 1,
    borderColor: 'navy',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 16,
    color: 'black',
  },
  profileImageNav: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  numberPickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginVertical: 15,
  },
  numberButton: {
    backgroundColor: 'rgba(0, 0, 128, 0.1)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonText: {
    fontSize: 24,
    color: 'navy',
    fontWeight: 'bold',
  },
  numberDisplay: {
    fontSize: 24,
    color: 'navy',
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
  slotContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    width: '100%',
    backgroundColor: 'rgba(252, 252, 252, 0.95)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 128, 0.2)',
    marginBottom: 10,
  },
  timeSlotView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 10,
    width: '100%',
  },
  timeButton: {
    borderWidth: 1,
    borderColor: 'navy',
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  timeSeperator: {
    fontSize: 16,
    color: 'navy',
    fontWeight: 'bold',
  },
  timeButtonText: {
    fontSize: 16,
    color: 'navy',
    fontWeight: 'bold',
  },
  addNoteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    width: '100%',
  },
  addNoteText: {
    color: '#007bff',
    marginLeft: 8,
    fontSize: 16,
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
  },
  attendeeSlot: {
    backgroundColor: 'rgba(252, 252, 252, 0.95)',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'navy',
    marginBottom: 10,
  },
  attendeeLabel: {
    fontSize: 16,
    color: 'navy',
    fontWeight: '500',
  },
  validationContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  validationMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  validationText: {
    color: '#dc3545',
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: 'gold',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
  },
  loginButtonText: {
    color: 'navy',
    fontSize: 16,
    fontWeight: 'bold',
  },
  labelContainer: {
    width: '100%',
    marginBottom: 10,
  },
  labelInput: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 128, 0.3)',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
    color: 'navy',
  },
  slotLabel: {
    fontSize: 16,
    color: 'navy',
    fontWeight: '600',
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  customizeButton: {
    backgroundColor: 'gold',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'navy',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateEventScreen;