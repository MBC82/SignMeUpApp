import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ImageBackground,
  TouchableWithoutFeedback,
  Image,
  TextInput,
  Alert,
  FlatList,
  Switch,
  Platform,
  Picker,
  Slider,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import DropDownPicker from 'react-native-dropdown-picker';
import { useRoute } from '@react-navigation/native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ColorPicker } from 'react-native-color-picker';

// Local images for themes
const localBackgrounds = {
  classic: require('../ios/assets/navy.jpg'),
  teacher2: require('../ios/assets/classicteacher.jpg'),
  modern: require('../ios/assets/classic.jpg'),
  playful: require('../ios/assets/dreamy.jpg'),
  elegant: require('../ios/assets/elegant.jpg'),
  sporty: require('../ios/assets/sporty.jpg'),
  candy: require('../ios/assets/classygirl.jpg'),
  darkmode: require('../ios/assets/darkmode.jpg'),
};

// Define the type for the navigation parameters
type RootStackParamList = {
  HomeScreen: undefined;
  MyEventsScreen: undefined;
  CreateEventScreen: undefined;
  ProfileSetupScreen: undefined;
  SignUpScreen: {
    eventName?: string;
    location?: string;
    organizer?: string;
    address?: string;
    eventTime?: string;
    neededItems?: any[];
    dates?: any[];
    timeSlots?: any[];
    bgColor?: string;
    fontColor?: string;
    fontSize?: number;
    fontType?: string;
    tileColor?: string;
    slotLabels?: {[key: string]: string};
    headerTileColor?: string;
    headerFontColor?: string;
    headerTextColor?: string;
    dateTextColor?: string;
    backgroundImage?: any;
    textShadowEnabled?: boolean;
    isEditing?: boolean;
    tileNames?: any[];
    editedTiles?: {[key: string]: boolean};
    participantNames?: any[];
    customTileNames?: any;
    slotTitles?: any;
  };
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
    backgroundImage?: { uri: string } | null;
    screenBgColor?: string;
    modalFontColor?: string;
    modalTileColor?: string;
    modalFontSize?: number;
    modalFontType?: string;
    textNotificationsEnabled?: boolean;
    organizerPhone?: string;
    emailNotificationsEnabled?: boolean;
    organizerEmail?: string;
    globalNote?: string;
    slotLabels?: {[key: string]: string};
    textShadowEnabled?: boolean;
    isTimeSlot?: boolean;
    isNewEvent?: boolean;
    isPreview?: boolean;
    headerTileColor?: string;
    headerFontColor?: string;
    updatedTimeSlots?: any[];
    headerTextColor?: string;
    dateTextColor?: string;
    useOriginalTileColor?: boolean;
  };
  // Add other screens if necessary
};

type SignUpScreenRouteProp = RouteProp<RootStackParamList, 'SignUpScreen'>;
type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUpScreen'>;

interface SignUpScreenProps {
  onSave?: (data: any) => void;
  onSaveTheme?: (theme: any) => void;
}

const IS_DEVELOPMENT = true; // Toggle this for testing

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSave, onSaveTheme }) => {
  const route = useRoute<SignUpScreenRouteProp>();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const [eventName, setEventName] = useState(route.params?.eventName || '');
  const [location, setLocation] = useState(route.params?.location || '');
  const [organizer, setOrganizer] = useState(route.params?.organizer || '');
  const [address, setAddress] = useState(route.params?.address || '');
  const [eventTime, setEventTime] = useState(route.params?.eventTime || '');
  const [neededItems, setNeededItems] = useState(route.params?.neededItems || []);
  const [dates, setDates] = useState(route.params?.dates || []);
  const [timeSlots, setTimeSlots] = useState(route.params?.timeSlots || []);
  const [bgColor, setBgColor] = useState(route.params?.bgColor || '#FFFFFF');
  const [fontColor, setFontColor] = useState(route.params?.fontColor || '#000000');
  const [fontSize, setFontSize] = useState(route.params?.fontSize || 16);
  const [fontType, setFontType] = useState(route.params?.fontType || 'System');
  const [tileColor, setTileColor] = useState(route.params?.tileColor || '#E8E8E8');
  const [slotLabels, setSlotLabels] = useState(route.params?.slotLabels || {});
  const [headerTileColor, setHeaderTileColor] = useState(route.params?.headerTileColor || '#F5F5F5');
  const [headerFontColor, setHeaderFontColor] = useState(route.params?.headerFontColor || '#000000');
  const [headerTextColor, setHeaderTextColor] = useState(route.params?.headerTextColor || '#000000');
  const [dateTextColor, setDateTextColor] = useState(route.params?.dateTextColor || '#000000');
  const [backgroundImage, setBackgroundImage] = useState(route.params?.backgroundImage || null);
  const [textShadowEnabled, setTextShadowEnabled] = useState(route.params?.textShadowEnabled || false);
  const [isEditing, setIsEditing] = useState(route.params?.isEditing || false);
  const [tileNames, setTileNames] = useState(route.params?.tileNames || []);
  const [editedTiles, setEditedTiles] = useState(route.params?.editedTiles || {});
  const [participantNames, setParticipantNames] = useState(route.params?.participantNames || []);
  const [customTileNames, setCustomTileNames] = useState(route.params?.customTileNames || {});
  const [slotTitles, setSlotTitles] = useState(route.params?.slotTitles || []);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isThemesModalVisible, setIsThemesModalVisible] = useState(false);
  const [screenBgColor, setScreenBgColor] = useState(bgColor || 'white');
  const [modalFontColor, setModalFontColor] = useState(fontColor || 'black');
  const [modalFontSize, setModalFontSize] = useState(fontSize || 16);
  const [modalFontType, setModalFontType] = useState(fontType || 'System');
  const [modalTileColor, setModalTileColor] = useState(tileColor || '#E8E8E8');
  const [isEditingTileName, setIsEditingTileName] = useState<number | null>(null);
  const [editedTileName, setEditedTileName] = useState('');
  const [showApplyToAllButton, setShowApplyToAllButton] = useState(false);
  const [tileTitle, setTileTitle] = useState<Record<string, string>>({});
  const [textShadowColor, setTextShadowColor] = useState('rgba(0, 0, 0, 0.75)');
  const [textShadowOffset, setTextShadowOffset] = useState({ width: 1, height: 1 });
  const [textShadowRadius, setTextShadowRadius] = useState(1);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [isDateEditing, setIsDateEditing] = useState(false);
  const [fontColorPickerVisible, setFontColorPickerVisible] = useState(false);
  const [fontSizePickerVisible, setFontSizePickerVisible] = useState(false);
  const [fontTypePickerVisible, setFontTypePickerVisible] = useState(false);
  const [backgroundColorPickerVisible, setBackgroundColorPickerVisible] = useState(false);
  const [headerColorPickerVisible, setHeaderColorPickerVisible] = useState(false);
  const [headerFontColorPickerVisible, setHeaderFontColorPickerVisible] = useState(false);
  const [dateTileColor, setDateTileColor] = useState('#f0f0f0');
  const [openDateTileColorPicker, setOpenDateTileColorPicker] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [isDesigner, setIsDesigner] = useState(false);
  const [isDeveloper, setIsDeveloper] = useState(IS_DEVELOPMENT);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isHeaderEditing, setIsHeaderEditing] = useState(false);
  const [editedEventName, setEditedEventName] = useState(eventName);
  const [editedLocation, setEditedLocation] = useState(location);
  const [editedOrganizer, setEditedOrganizer] = useState(organizer);
  const [editedAddress, setEditedAddress] = useState(address);
  const [editedEventTime, setEditedEventTime] = useState(eventTime);
  const [editedDate, setEditedDate] = useState(dates.map(date => date.date));
  const [editedTimeSlots, setEditedTimeSlots] = useState(() => {
    console.log('Initializing editedTimeSlots with route.params.timeSlots:', route.params?.timeSlots);
    
    // Check if timeSlots exists in route params
    if (route.params && route.params.timeSlots) {
      try {
        // Map the time slots to ensure they're in the correct format
        if (Array.isArray(route.params.timeSlots)) {
          console.log('timeSlots is an array with length:', route.params.timeSlots.length);
          return route.params.timeSlots.map(slot => {
            console.log('Processing slot:', slot);
            if (typeof slot === 'object' && slot.start && slot.end) {
              // If it's already an object with start and end, return it as is
              console.log('Slot is an object with start/end:', slot);
              return slot;
            } else if (typeof slot === 'string') {
              // If it's a string, try to parse it as "start - end"
              console.log('Slot is a string:', slot);
              const parts = slot.split(' - ');
              if (parts.length === 2) {
                return { start: parts[0], end: parts[1] };
              }
              // If it can't be parsed, return it as is
              return slot;
            }
            // Default case
            return slot;
          });
        } else {
          console.log('timeSlots is not an array:', route.params.timeSlots);
          // Create default time slots if none exist
          return Array(dates[0].signups).fill(null).map((_, i) => ({
            start: `${i + 1}:00 PM`,
            end: `${i + 2}:00 PM`
          }));
        }
      } catch (error) {
        console.error('Error processing timeSlots:', error);
        // Create default time slots on error
        return Array(dates[0].signups).fill(null).map((_, i) => ({
          start: `${i + 1}:00 PM`,
          end: `${i + 2}:00 PM`
        }));
      }
    } else {
      console.log('No timeSlots in route.params, creating defaults');
      // If no time slots in route params, create default ones
      return Array(dates[0].signups).fill(null).map((_, i) => ({
        start: `${i + 1}:00 PM`,
        end: `${i + 2}:00 PM`
      }));
    }
  });
  const [customizeModalVisible, setCustomizeModalVisible] = useState(false);
  const [showTileColorPicker, setShowTileColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showFontColorPicker, setShowFontColorPicker] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const colorOptions = [
    { 
      label: 'Black', 
      value: '#000000', 
      containerStyle: { 
        backgroundColor: '#000000',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Red', 
      value: '#FF0000', 
      containerStyle: { 
        backgroundColor: '#FF0000',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Green', 
      value: '#00FF00', 
      containerStyle: { 
        backgroundColor: '#00FF00',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Blue', 
      value: '#0000FF', 
      containerStyle: { 
        backgroundColor: '#0000FF',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Yellow', 
      value: '#FFFF00', 
      containerStyle: { 
        backgroundColor: '#FFFF00',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Cyan', 
      value: '#00FFFF', 
      containerStyle: { 
        backgroundColor: '#00FFFF',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Magenta', 
      value: '#FF00FF', 
      containerStyle: { 
        backgroundColor: '#FF00FF',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Orange', 
      value: '#FFA500', 
      containerStyle: { 
        backgroundColor: '#FFA500',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Purple', 
      value: '#800080', 
      containerStyle: { 
        backgroundColor: '#800080',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Pink', 
      value: '#FFC0CB', 
      containerStyle: { 
        backgroundColor: '#FFC0CB',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Brown', 
      value: '#A52A2A', 
      containerStyle: { 
        backgroundColor: '#A52A2A',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'White', 
      value: '#FFFFFF', 
      containerStyle: { 
        backgroundColor: '#FFFFFF',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Gray', 
      value: '#808080', 
      containerStyle: { 
        backgroundColor: '#808080',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Light Blue', 
      value: '#ADD8E6', 
      containerStyle: { 
        backgroundColor: '#ADD8E6',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Light Green', 
      value: '#90EE90', 
      containerStyle: { 
        backgroundColor: '#90EE90',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'black',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
    { 
      label: 'Dark Red', 
      value: '#8B0000', 
      containerStyle: { 
        backgroundColor: '#8B0000',
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center'
      }, 
      labelStyle: { 
        color: 'white',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600'
      } 
    },
  ];

  // Fix the themes array to match your original themes
  const themes = [
    { name: 'Classic', tileColor: 'gold', fontColor: 'navy', bgColor: '#f0f0f0', fontType: 'Roboto', bgImage: localBackgrounds.classic, premium: false },
    { name: 'Teacher', tileColor: 'lightblue', fontColor: 'black', bgColor: '#f0f0f0', fontType: 'Marker Felt', bgImage: localBackgrounds.teacher2, premium: false },
    { name: 'Modern', tileColor: 'darkgray', fontColor: 'white', bgColor: '#263238', fontType: 'Roboto', bgImage: localBackgrounds.modern, premium: false },
    { name: 'Fancy', tileColor: 'lightyellow', fontColor: '#000000', bgColor: '#ffccbc', fontType: 'Comic Sans MS', bgImage: localBackgrounds.playful, premium: false },
    { name: 'Elegant', tileColor: 'white', fontColor: '#000000', bgColor: '#ede7f6', fontType: 'Georgia', bgImage: localBackgrounds.elegant, premium: false },
    { name: 'Sporty', tileColor: '#81c784', fontColor: 'white', bgColor: '#a5d6a7', fontType: 'Comic Sans MS', bgImage: localBackgrounds.sporty, premium: false },
    { 
      name: 'Classy', 
      tileColor: '#FFE4E1', 
      fontColor: 'lightblue', 
      bgColor: '#a5d6a7', 
      fontType: 'Comic Sans MS', 
      bgImage: localBackgrounds.candy, 
      premium: false,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
    { name: 'Dark Mode', tileColor: '#424242', fontColor: '#e0e0e0', bgColor: '#212121', fontType: 'Arial New', bgImage: localBackgrounds.darkmode, premium: false },
  ];

  const [currentTheme, setCurrentTheme] = useState('');

  const handleSave = () => {
    if (onSave) {
      onSave({
        eventName: editedEventName,
        location: editedLocation,
        organizer: editedOrganizer,
        address: editedAddress,
        eventTime: editedEventTime,
        neededItems: editedNeededItems,
        dates: dates,
        timeSlots: editedTimeSlots,
        bgColor: screenBgColor,
        fontColor: modalFontColor,
        fontSize: modalFontSize,
        fontType: modalFontType,
        tileColor: modalTileColor,
        slotLabels: slotLabels,
        headerTileColor: headerTileColor,
        headerFontColor: headerFontColor,
        headerTextColor: headerTextColor,
        dateTextColor: dateTextColor,
        textShadowEnabled: textShadowEnabled,
        isEditing: isEditing,
        tileNames: tileNames,
        editedTiles: editedTiles,
        participantNames: participantNames,
        customTileNames: customTileNames,
        slotTitles: slotTitles
      });
    }
  };

  const handleSaveAndClose = () => {
    handleSave();
    navigation.goBack();
  };

  const handleSaveAndPreview = () => {
    handleSave();
    navigation.navigate('EventSignUpScreen', {
      eventId: route.params.eventId || '',
      id: route.params.id || '',
      username: route.params.username || '',
      eventName: editedEventName,
      location: editedLocation,
      organizer: editedOrganizer,
      address: editedAddress,
      eventTime: editedEventTime,
      neededItems: editedNeededItems,
      dates: dates,
      timeSlots: editedTimeSlots,
      bgColor: screenBgColor,
      fontColor: modalFontColor,
      fontSize: modalFontSize,
      fontType: modalFontType,
      tileColor: modalTileColor,
      slotLabels: slotLabels,
      headerTileColor: headerTileColor,
      headerFontColor: headerFontColor,
      headerTextColor: headerTextColor,
      dateTextColor: dateTextColor,
      textShadowEnabled: textShadowEnabled,
      isEditing: isEditing,
      tileNames: tileNames,
      editedTiles: editedTiles,
      participantNames: participantNames,
      customTileNames: customTileNames,
      slotTitles: slotTitles
    });
  };

  const handleSaveAndShare = () => {
    handleSave();
    navigation.navigate('EventSignUpScreen', {
      eventId: route.params.eventId || '',
      id: route.params.id || '',
      username: route.params.username || '',
      eventName: editedEventName,
      location: editedLocation,
      organizer: editedOrganizer,
      address: editedAddress,
      eventTime: editedEventTime,
      neededItems: editedNeededItems,
      dates: dates,
      timeSlots: editedTimeSlots,
      bgColor: screenBgColor,
      fontColor: modalFontColor,
      fontSize: modalFontSize,
      fontType: modalFontType,
      tileColor: modalTileColor,
      slotLabels: slotLabels,
      headerTileColor: headerTileColor,
      headerFontColor: headerFontColor,
      headerTextColor: headerTextColor,
      dateTextColor: dateTextColor,
      textShadowEnabled: textShadowEnabled,
      isEditing: isEditing,
      tileNames: tileNames,
      editedTiles: editedTiles,
      participantNames: participantNames,
      customTileNames: customTileNames,
      slotTitles: slotTitles
    });
  };

  const applyTheme = (theme: any) => {
    setModalTileColor(theme.tileColor);
    setScreenBgColor(theme.bgColor);
    setModalFontColor(theme.fontColor);
    setModalFontSize(theme.fontSize);
    setModalFontType(theme.fontType);
    setHeaderTileColor(theme.headerTileColor);
    setHeaderFontColor(theme.headerFontColor);
    setHeaderTextColor(theme.headerTextColor);
    setDateTextColor(theme.dateTextColor);
    setTextShadowEnabled(theme.textShadowEnabled);
  };

  useEffect(() => {
    if (currentTheme) {
      applyTheme(currentTheme);
      setHeaderTextColor(headerFontColor);
      setDateTextColor(headerFontColor);
    }
  }, [currentTheme, headerFontColor]);

  const handleSaveTheme = () => {
    if (onSaveTheme) {
      onSaveTheme({
        tileColor: modalTileColor,
        bgColor: screenBgColor,
        fontColor: modalFontColor,
        fontSize: modalFontSize,
        fontType: modalFontType,
        headerTileColor: headerTileColor,
        headerFontColor: headerFontColor,
        headerTextColor: headerTextColor,
        dateTextColor: dateTextColor,
        textShadowEnabled: textShadowEnabled
      });
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Check for subscription status from AsyncStorage or API
        const userPremiumStatus = await AsyncStorage.getItem('userPremiumStatus');
        const userDesignerStatus = await AsyncStorage.getItem('userDesignerStatus');

        setIsPremium(userPremiumStatus === 'true');
        setIsDesigner(userDesignerStatus === 'true');
        setIsDeveloper(IS_DEVELOPMENT); // Always use the development flag

        const savedProfileImage = await AsyncStorage.getItem('profileImage');
        setProfileImage(savedProfileImage || '');
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Update the useEffect that loads event data for editing
  useEffect(() => {
    // Load data for editing if this is an existing event being edited
    if (route.params?.isEditing) {
      console.log('Event styling data loaded for editing');
      
      // Load event name, location, organizer, etc.
      if (route.params.eventName) {
        setEditedEventName(route.params.eventName);
      }
      
      if (route.params.location) {
        setEditedLocation(route.params.location);
      }
      
      if (route.params.organizer) {
        setEditedOrganizer(route.params.organizer);
      }
      
      if (route.params.address) {
        setEditedAddress(route.params.address);
      }
      
      if (route.params.eventTime) {
        setEditedEventTime(route.params.eventTime);
      }
      
      // Preserve the tile color if provided
      if (route.params?.tileColor) {
        console.log('Setting tileColor from params:', route.params.tileColor);
        setModalTileColor(route.params.tileColor);
      }
      
      // Load other styling properties
      if (route.params.bgColor) {
        setScreenBgColor(route.params.bgColor);
      }
      
      if (route.params.fontColor) {
        setModalFontColor(route.params.fontColor);
      }
      
      if (route.params.fontSize) {
        setModalFontSize(Number(route.params.fontSize));
      }
      
      if (route.params.fontType) {
        setModalFontType(route.params.fontType);
      }
      
      // Preserve the header tile color if provided
      if (route.params?.headerTileColor) {
        console.log('Setting headerTileColor from params:', route.params.headerTileColor);
        setHeaderTileColor(route.params.headerTileColor);
      } else if (route.params?.tileColor) {
        // Fallback to regular tile color if header tile color isn't specified
        setHeaderTileColor(route.params.tileColor);
      }
      
      // Preserve the header font color if provided
      if (route.params?.headerFontColor) {
        console.log('Setting headerFontColor from params:', route.params.headerFontColor);
        setHeaderFontColor(route.params.headerFontColor);
      } else if (route.params?.fontColor) {
        // Fallback to regular font color if header font color isn't specified
        setHeaderFontColor(route.params.fontColor);
      }
      
      if (route.params.headerTextColor) {
        console.log('Setting headerTextColor from params:', route.params.headerTextColor);
        setHeaderTextColor(route.params.headerTextColor);
      }
      
      if (route.params.dateTextColor) {
        console.log('Setting dateTextColor from params:', route.params.dateTextColor);
        setDateTextColor(route.params.dateTextColor);
      }
      
      // Load text shadow setting if it exists
      if (route.params.textShadowEnabled !== undefined) {
        setTextShadowEnabled(route.params.textShadowEnabled);
      }
      
      // Preserve dates with their original isTimeSlot values
      if (route.params?.dates && Array.isArray(route.params.dates)) {
        console.log('Editing event - loading with correct isTimeSlot value');
        // Important: preserve the original dates array completely
        const preservedDates = [...route.params.dates];
        // Don't try to use setDates - it's not defined. Instead we just reference dates later directly.
        // Update editedDate for display
        setEditedDate(preservedDates.map(date => date.date || ''));
        
        console.log('Date isTimeSlot values:', 
          preservedDates.map((date, idx) => 
            `Date ${idx}: ${date.isTimeSlot ? 'Time Slot' : 'Attendee'}`
          )
        );
      }
      
      // Preserve the background image if provided
      if (route.params?.backgroundImage) {
        console.log('Setting background image from params:', route.params.backgroundImage);
        setBackgroundImage(route.params.backgroundImage);
        setScreenBgColor('transparent');
      }
      
      // Preserve the tile names if provided
      if (route.params?.tileNames) {
        console.log('Setting tileNames from params:', route.params.tileNames);
        setTileNames(route.params.tileNames);
      }
      
      // Preserve the edited tiles if provided
      if (route.params?.editedTiles) {
        console.log('Setting editedTiles from params:', route.params.editedTiles);
        setEditedTiles(route.params.editedTiles);
      }
      
      // Preserve the slot labels if provided
      if (route.params?.slotLabels) {
        console.log('Setting slotLabels/tileTitle from params:', route.params.slotLabels);
        setTileTitle(route.params.slotLabels as Record<string, string>);
      }
      
      // Preserve the time slots if provided
      if (route.params?.timeSlots) {
        console.log('Setting timeSlots from params:', route.params.timeSlots);
        setEditedTimeSlots(route.params.timeSlots);
      }
    }
  }, [route.params?.isEditing]);

  // Add this useEffect near the beginning of the component
  useEffect(() => {
    // Check if we're editing an existing event
    if (route.params?.isEditing) {
      console.log('Editing event - loading tile names from params');
      
      // Load tile names from the route params
      if (route.params.tileNames) {
        console.log('Setting tileNames from params:', route.params.tileNames);
        setTileNames(route.params.tileNames);
      }
      
      if (route.params.editedTiles) {
        console.log('Setting editedTiles from params:', route.params.editedTiles);
        setEditedTiles(route.params.editedTiles);
      }
      
      if (route.params.slotLabels) {
        console.log('Setting slotLabels/tileTitle from params:', route.params.slotLabels);
        setTileTitle(route.params.slotLabels as Record<string, string>);
      }
      
      if (route.params.participantNames) {
        console.log('Setting participantNames from params:', route.params.participantNames);
        setParticipantNames(route.params.participantNames);
      }
      
      if (route.params.customTileNames) {
        console.log('Setting customTileNames from params:', route.params.customTileNames);
        setCustomTileNames(route.params.customTileNames);
      }
    }
  }, [route.params?.isEditing]);

  // Add these functions if they're missing
  const openThemeModal = () => {
    setIsThemesModalVisible(true);
  };

  const closeThemeModal = () => {
    setIsThemesModalVisible(false);
  };

  // Make sure the handleSignUp function is properly defined
  const handleEventCreation = () => {
    // Validate required fields
    if (!editedEventName && !eventName) {
      Alert.alert('Error', 'Please enter an event name');
      return;
    }
    
    // Create a formatted object for slot labels
    const formattedSlotLabels = {};
    
    // First, copy any existing slot labels
    if (slotLabels && typeof slotLabels === 'object') {
      Object.keys(slotLabels).forEach(key => {
        formattedSlotLabels[key] = slotLabels[key];
      });
    }
    
    // Then, add any edited tile names
    if (editedTiles) {
      Object.keys(editedTiles).forEach(key => {
        if (editedTiles[key]) {
          const title = tileTitle[key] || '';
          if (title) {
            formattedSlotLabels[key] = title;
          }
        }
      });
    }
    
    // Navigate to EventSignUpScreen
    navigation.navigate('EventSignUpScreen', {
      eventId: eventName,
      id: location,
      username: organizer,
      eventName: editedEventName || eventName,
      location: editedLocation || location,
      organizer: editedOrganizer || organizer,
      address: editedAddress || address,
      eventTime: editedEventTime || eventTime,
      neededItems: neededItems,
      dates: dates.map((date, index) => ({
        ...date,
        date: editedDate[index] || date.date,
        isTimeSlot: true,
      })),
      timeSlots: editedTimeSlots,
      bgColor: backgroundImage ? 'transparent' : screenBgColor,
      fontColor: modalFontColor,
      fontSize: modalFontSize,
      fontType: modalFontType,
      tileColor: modalTileColor,
      headerTileColor: headerTileColor,
      headerFontColor: headerFontColor,
      backgroundImage: backgroundImage,
      slotLabels: formattedSlotLabels,
      textNotificationsEnabled: false,
      organizerPhone: '',
      emailNotificationsEnabled: false,
      organizerEmail: '',
      globalNote: '',
      textShadowEnabled: textShadowEnabled || false,
      isTimeSlot: true,
      isNewEvent: true,
    });
  };

  // Make sure the handleSubmitEvent function is properly defined
  const handleSubmitEvent = () => {
    // Check if all required fields are filled
    if (!editedEventName && !eventName) {
      Alert.alert('Error', 'Please enter an event name');
      return;
    }
    
    if (!editedLocation && !location) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }
    
    if (!editedOrganizer && !organizer) {
      Alert.alert('Error', 'Please enter an organizer name');
      return;
    }
    
    // Create formatted slot labels from the tileTitle state
    const formattedSlotLabels = {};
    
    if (slotLabels && typeof slotLabels === 'object') {
      Object.keys(slotLabels).forEach(key => {
        formattedSlotLabels[key] = slotLabels[key];
      });
    }
    
    if (editedTiles && Object.keys(editedTiles).length > 0) {
      Object.keys(editedTiles).forEach(key => {
        if (editedTiles[key]) {
          // Use the tileTitle state variable
          const title = tileTitle[key] || '';
          if (title) {
            formattedSlotLabels[key] = title;
          }
        }
      });
    }
    
    // Navigate to EventSignUpScreen
    navigation.navigate('EventSignUpScreen', {
      eventId: eventName,
      id: location,
      username: organizer,
      eventName: editedEventName || eventName,
      location: editedLocation || location,
      organizer: editedOrganizer || organizer,
      address: editedAddress || address,
      eventTime: editedEventTime || eventTime,
      neededItems: neededItems,
      dates: dates.map((date, index) => ({
        ...date,
        date: editedDate[index] || date.date,
        // Preserve the original isTimeSlot property instead of forcing it
        isTimeSlot: date.isTimeSlot !== undefined ? date.isTimeSlot : false,
      })),
      timeSlots: editedTimeSlots,
      bgColor: screenBgColor,
      fontColor: modalFontColor,
      fontSize: modalFontSize,
      fontType: modalFontType,
      tileColor: modalTileColor,
      headerTileColor: headerTileColor,
      headerFontColor: headerFontColor,
      backgroundImage: backgroundImage,
      slotLabels: formattedSlotLabels,
      textNotificationsEnabled: false,
      organizerPhone: '',
      emailNotificationsEnabled: false,
      organizerEmail: '',
      globalNote: '',
      textShadowEnabled: textShadowEnabled || false,
      isTimeSlot: true,
      isNewEvent: true,
    });
  };

  // Make sure the saveDraft function is properly defined
  const saveDraft = async () => {
    try {
      // Get the username from encrypted storage instead of regular AsyncStorage
      const username = await EncryptedStorage.getItem('username');
      
      console.log('Saving draft, username from encrypted storage:', username);
      
      if (!username) {
        Alert.alert('Error', 'You must be logged in to save drafts');
        return;
      }
      
      // Generate a unique ID for the draft if one doesn't exist
      const draftId = route.params?.id || Date.now().toString();
      
      // Create a draft object with all the current event data
      const draft = {
        id: draftId,
        eventId: draftId,
        username: username,
        eventName: editedEventName || eventName,
        location: editedLocation || location,
        organizer: editedOrganizer || organizer,
        address: editedAddress || address,
        eventTime: editedEventTime || eventTime,
        neededItems: neededItems,
        dates: dates ? dates.map((date, index) => ({
          ...date,
          date: editedDate[index] || date.date,
          // Preserve the original isTimeSlot value instead of forcing to true
          isTimeSlot: date.isTimeSlot !== undefined ? date.isTimeSlot : false,
        })) : [],
        timeSlots: editedTimeSlots,
        bgColor: screenBgColor,
        fontColor: modalFontColor,
        fontSize: modalFontSize,
        fontType: modalFontType,
        tileColor: modalTileColor,
        headerTileColor: headerTileColor,
        headerFontColor: headerFontColor,
        backgroundImage: backgroundImage,
        slotLabels: slotLabels,
        tileNames: tileNames,
        editedTiles: editedTiles,
        textNotificationsEnabled: false,
        organizerPhone: '',
        emailNotificationsEnabled: false,
        organizerEmail: '',
        globalNote: '',
        textShadowEnabled: textShadowEnabled || false,
        isTimeSlot: false, // Default at event level, individual dates control their own setting
        isDraft: true,
        status: 'Draft',
        createdAt: new Date().toISOString(),
      };
      
      // Get existing drafts using the correct key
      const draftsString = await AsyncStorage.getItem(`draftEvents_${username}`);
      const drafts = draftsString ? JSON.parse(draftsString) : [];
      
      // Add the new draft
      drafts.push(draft);
      
      // Save back to storage with the correct key
      await AsyncStorage.setItem(`draftEvents_${username}`, JSON.stringify(drafts));
      
      console.log('Draft saved successfully for user:', username);
      Alert.alert('Success', 'Event saved as draft');
      
      // Navigate back to the my events screen so user can see the draft
      navigation.navigate('MyEventsScreen');
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft: ' + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;
        setBackgroundImage({ uri: selectedImageUri });
        setScreenBgColor('transparent');
      }
    });
  };

  // Update the renderSlotsOrAttendees function to properly display tile names and respect isTimeSlot property
  const renderSlotsOrAttendees = (dateIndex) => {
    const signups = dates[dateIndex].signups || 1;
    const tileWidth = signups >= 12 ? '32%' : '48%';
    
    console.log(`Rendering slots for dateIndex ${dateIndex}, tileNames:`, tileNames);
    const isTimeSlotView = dates[dateIndex].isTimeSlot;
    console.log(`Date at index ${dateIndex} isTimeSlot: ${isTimeSlotView}`);

  return (
      <View style={styles.tileRow}>
        {Array(signups).fill(null).map((_, slotIndex) => {
          // Generate a unique key for this tile
          const tileKey = `${dateIndex}_${slotIndex}`;
          const isEdited = editedTiles[tileKey] || false;
          
          // Determine the label for this tile
          let tileLabel = '';
          
          if (isEdited && tileTitle[tileKey]) {
            // If this tile has been edited, use the custom title
            tileLabel = tileTitle[tileKey];
            // Add number if includeNumbers is true
            if (tileNames[dateIndex]?.includeNumbers !== false) {
              tileLabel = `${tileLabel} ${slotIndex + 1}`;
            }
          } else {
            // Otherwise use the default title
            const defaultLabel = isTimeSlotView ? 'Time Slot' : 'Attendee';
            if (tileNames[dateIndex]?.includeNumbers !== false) {
              tileLabel = `${defaultLabel} ${slotIndex + 1}`;
            } else {
              tileLabel = defaultLabel;
            }
          }
          
          let timeSlot = null;
          
          if (isTimeSlotView) {
            console.log(`Rendering time slot for dateIndex ${dateIndex}, slotIndex ${slotIndex}`);
            console.log('editedTimeSlots:', editedTimeSlots);
            
            // Check if we have a time slot for this position
            if (Array.isArray(editedTimeSlots) && editedTimeSlots[slotIndex]) {
              timeSlot = editedTimeSlots[slotIndex];
            }
          }
          
          return (
            <View
              key={tileKey}
              style={[
                styles.tile,
                {
                  backgroundColor: modalTileColor,
                  width: tileWidth,
                  borderColor: 'gold',
                  borderWidth: 2,
                },
              ]}
            >
              <View style={styles.tileTitleContainer}>
                <Text
                  style={[
                    styles.tileText,
                    {
                      color: modalFontColor,
                      fontFamily: modalFontType,
                      fontSize: modalFontSize,
                    },
                    textShadowEnabled && {
                      textShadowColor: 'rgba(0, 0, 0, 0.75)',
                      textShadowOffset: { width: 1, height: 1 },
                      textShadowRadius: 3,
                    },
                  ]}
                >
                  {tileLabel}
                </Text>
                <TouchableOpacity
                  style={styles.tileEditButton}
                  onPress={() => {
                    setIsEditingTileName(parseInt(`${dateIndex}${slotIndex}`));
                    setEditedTileName(tileTitle[tileKey] || '');
                    setModalVisible(true);
                  }}
                >
                  <MaterialIcons name="edit" size={16} color="black" />
                </TouchableOpacity>
              </View>
              
              {isTimeSlotView && (
                <View style={styles.timeSlotContainer}>
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color: modalFontColor,
                        fontFamily: modalFontType,
                        fontSize: modalFontSize - 2,
                      },
                    ]}
                  >
                    {timeSlot ? `${timeSlot.start} - ${timeSlot.end}` : 'No time set'}
                  </Text>
                  <TouchableOpacity
                    style={styles.timeEditButton}
                    onPress={() => {
                      Alert.prompt(
                        'Edit Start Time',
                        'Enter the start time (e.g., 1:00 PM)',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Next',
                            onPress: startTime => {
                              if (!startTime) return;
                              
                              Alert.prompt(
                                'Edit End Time',
                                'Enter the end time (e.g., 2:00 PM)',
                                [
                                  {
                                    text: 'Cancel',
                                    style: 'cancel',
                                  },
                                  {
                                    text: 'Save',
                                    onPress: endTime => {
                                      if (!endTime) return;
                                      
                                      const newTimeSlots = Array.isArray(editedTimeSlots) 
                                        ? [...editedTimeSlots] 
                                        : Array(dates[dateIndex].signups).fill('');
                                      
                                      // Update the time slot
                                      newTimeSlots[slotIndex] = {
                                        start: startTime,
                                        end: endTime,
                                      };
                                      
                                      setEditedTimeSlots(newTimeSlots);
                                    },
                                  },
                                ],
                                'plain-text',
                                timeSlot?.end || '',
                              );
                            },
                          },
                        ],
                        'plain-text',
                        timeSlot?.start || '',
                      );
                    }}
                  >
                    <MaterialIcons name="access-time" size={16} color="black" />
                  </TouchableOpacity>
                </View>
              )}
              
              {/* Add the signup button back to each tile */}
              <TouchableOpacity 
                style={styles.signUpButton}
                onPress={() => {
                  // This is just a superficial button in the preview
                  Alert.alert('Sign Up', `You've signed up for ${tileLabel}`);
                }}
              >
                <Text style={styles.signUpButtonText}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };

  const renderColorOption = (color: string, onPress: () => void, index: number) => (
    <TouchableOpacity
      key={`color-${index}`}
      style={[styles.colorOption]}
      onPress={onPress}
    >
      <Text style={[
        styles.colorOptionText, 
        { 
          color: color,
          textShadowColor: color === 'white' || color === 'yellow' || color === 'lightgreen' ? 'rgba(0,0,0,0.3)' : 'transparent',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        }
      ]}>
        {color}
      </Text>
    </TouchableOpacity>
  );

  const handleBackgroundColorPress = () => {
    console.log('Current backgroundColorPickerVisible:', backgroundColorPickerVisible);
    console.log('Current screenBgColor:', screenBgColor);
    setBackgroundColorPickerVisible(true);
    console.log('Set backgroundColorPickerVisible to true');
  };

  const handleFontColorPress = () => {
    console.log('Opening font color picker');
    setFontColorPickerVisible(true);
  };

  const handleFontColorSelect = (color: string) => {
    console.log('Selected color:', color);
    setModalFontColor(color);
    setFontColorPickerVisible(false);
  };

  // Update the fontOptions array
  const fontOptions = [
    'Arial',
    'Arial Rounded MT Bold',
    'Avenir',
    'Baskerville',
    'Bodoni 72',
    'Bradley Hand',
    'Chalkboard SE',
    'Cochin',
    'Copperplate',
    'Courier',
    'Courier New',
    'Didot',
    'Futura',
    'Georgia',
    'Gill Sans',
    'Helvetica',
    'Helvetica Neue',
    'Hoefler Text',
    'Marker Felt',
    'Menlo',
    'Noteworthy',
    'Optima',
    'Palatino',
    'Papyrus',
    'Party LET',
    'San Francisco',
    'Savoye LET',
    'Snell Roundhand',
    'Times New Roman',
    'Trebuchet MS',
    'Verdana',
  ].map(font => ({
    label: font,
    value: font
  }));

  // Helper function to determine if a color is dark (add this near the top of the file)
  const isColorDark = (color: string): boolean => {
    const darkColors = [
      'black', 'navy', 'darkgray', 'purple', 'blue', 
      'dark gray', 'dark blue', 'dark green'
    ];
    return darkColors.includes(color.toLowerCase());
  };

  const handleTileColorSelect = (color: string) => {
    setDateTileColor(color);
  };

  const handleSubscription = () => {
    // Here you would implement the actual subscription logic using in-app purchases
    // For now, we'll just show an alert
    Alert.alert(
      'Subscribe',
      'This will redirect to the subscription page in the App Store',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Continue',
          onPress: () => {
            // Implement App Store subscription logic here
            console.log('Redirect to subscription page');
          }
        }
      ]
    );
  };

  // Update the function name and behavior to be more specific
  const updateDateOutlineColor = (color: string) => {
    setHeaderTileColor(color);
    // Remove setDateTileColor since we don't want to change the tiles
  };

  // Add a function to check if current theme is Fancy or Elegant
  const isFancyOrElegantTheme = (themeName: string) => {
    return themeName === 'Fancy' || themeName === 'Elegant';
  };

  // Use the existing route object
  const { eventDate, timeSlot, tileTitle: routeTileTitle } = route.params || {};

  // Update the handleTileNameChange function to include the apply to all functionality
  const handleTileNameChange = (dateIndex, slotIndex, newName) => {
    // Create a copy of the current tileNames state
    const updatedTileNames = [...tileNames];
    
    // Update the tile name
    const key = `${dateIndex}_${slotIndex}`;
    
    // Update the tileTitle state with the new name
    setTileTitle(prev => ({
      ...prev,
      [key]: newName
    }));
    
    // Mark this tile as edited
    setEditedTiles(prev => ({
      ...prev,
      [key]: true
    }));
    
    console.log(`Updated tile name at ${dateIndex}_${slotIndex} to ${newName}`);
  };

  // Add this function to your SignUpScreen component
  const handleConfirmCustomization = () => {
    // Make sure slotLabels is properly structured
    const formattedSlotLabels = {};
    
    // If slotLabels is already an object, use it directly
    if (slotLabels && typeof slotLabels === 'object') {
      Object.keys(slotLabels).forEach(key => {
        formattedSlotLabels[key] = slotLabels[key];
      });
    }
    
    // Add any edited tile names from the UI
    if (editedTiles) {
      Object.keys(editedTiles).forEach(key => {
        // Check if the tile has been edited and has a title
        if (editedTiles[key]) {
          // Use the tileTitle state variable
          const title = tileTitle[key] || '';
          if (title) {
            formattedSlotLabels[key] = title;
          }
        }
      });
    }
    
    // Navigate to EventSignUpScreen with preview flag set to true
    navigation.navigate('EventSignUpScreen', {
      eventId: eventName, // Using eventName as eventId for simplicity
      id: location, // Using location as id for simplicity
      username: organizer, // Using organizer as username for simplicity
      eventName: editedEventName || eventName,
      location: editedLocation || location,
      organizer: editedOrganizer || organizer,
      address: editedAddress || address,
      eventTime: editedEventTime || eventTime,
      neededItems: neededItems,
      dates: dates.map((date, index) => ({
        ...date,
        date: editedDate[index] || date.date,
      })),
      timeSlots: timeSlots,
      bgColor: screenBgColor,
      fontColor: modalFontColor,
      fontSize: modalFontSize,
      fontType: modalFontType,
      tileColor: modalTileColor,
      backgroundImage: backgroundImage,
      slotLabels: formattedSlotLabels,
      textNotificationsEnabled: false,
      organizerPhone: '',
      emailNotificationsEnabled: false,
      organizerEmail: '',
      globalNote: '',
      textShadowEnabled: false,
      isTimeSlot: true,
      isNewEvent: true,
      isPreview: true, // Set this to true for preview mode
    });
  };

  // Add this function to handle applying a tile name to all tiles
  const applyTileNameToAll = (name) => {
    console.log('Applying tile name to all tiles:', name);
    
    // Create a new array with the updated names
    const updatedTileNames = tileNames.map(tile => ({
      ...tile,
      names: tile.names.map(() => name),
      includeNumbers: tile.includeNumbers
    }));
    
    // Update the state
    setTileNames(updatedTileNames);
    
    // Create a new object to track which tiles have been edited
    const newEditedTiles = {};
    
    // Mark all tiles as edited
    dates.forEach((date, dateIndex) => {
      for (let i = 0; i < date.signups; i++) {
        const key = `${dateIndex}_${i}`;
        newEditedTiles[key] = true;
        
        // Also update the tileTitle state
        setTileTitle(prev => ({
          ...prev,
          [key]: name
        }));
      }
    });
    
    // Update the editedTiles state
    setEditedTiles(newEditedTiles);
    
    console.log('Updated tileNames:', updatedTileNames);
    console.log('Updated editedTiles:', newEditedTiles);
  };

  // Then update the preview function to handle the case when selectedDateIndex is null
  const handlePreview = () => {
    console.log('Previewing event with tileNames:', tileNames);
    
    // Create formatted slot labels from the tileTitle state
    const formattedSlotLabels = {};
    
    if (slotLabels && typeof slotLabels === 'object') {
      Object.keys(slotLabels).forEach(key => {
        formattedSlotLabels[key] = slotLabels[key];
      });
    }
    
    if (editedTiles && Object.keys(editedTiles).length > 0) {
      Object.keys(editedTiles).forEach(key => {
        if (editedTiles[key]) {
          // Use the tileTitle state variable
          const title = tileTitle[key] || '';
          if (title) {
            formattedSlotLabels[key] = title;
          }
        }
      });
    }
    
    // Navigate to EventSignUpScreen with preview flag set to true
    navigation.navigate('EventSignUpScreen', {
      eventId: eventName, // Using eventName as eventId for simplicity
      id: location, // Using location as id for simplicity
      username: organizer, // Using organizer as username for simplicity
      eventName: editedEventName || eventName,
      location: editedLocation || location,
      organizer: editedOrganizer || organizer,
      address: editedAddress || address,
      eventTime: editedEventTime || eventTime,
      neededItems: neededItems,
      dates: dates.map((date, index) => ({
        ...date,
        date: editedDate[index] || date.date,
        // Preserve the original isTimeSlot property
        isTimeSlot: date.isTimeSlot !== undefined ? date.isTimeSlot : false,
      })),
      timeSlots: editedTimeSlots, // Use the edited time slots
      bgColor: backgroundImage ? 'transparent' : screenBgColor, // Set transparent if using background image
      fontColor: modalFontColor,
      fontSize: modalFontSize,
      fontType: modalFontType,
      tileColor: modalTileColor,
      headerTileColor: headerTileColor,
      headerFontColor: headerFontColor,
      backgroundImage: backgroundImage,
      slotLabels: formattedSlotLabels,
      textNotificationsEnabled: false,
      organizerPhone: '',
      emailNotificationsEnabled: false,
      organizerEmail: '',
      globalNote: '',
      textShadowEnabled: textShadowEnabled || false,
      isTimeSlot: true,
      isNewEvent: true,
      isPreview: true, // Set this to true for preview mode
    });
  };

  // Update the handleThemeSelection function to include header colors
  const handleThemeSelection = (themeName) => {
    const theme = themes.find(t => t.name === themeName);
    if (theme) {
      setCurrentTheme(theme.name);
      
      // Set background color or image
      if (theme.bgImage) {
        setBackgroundImage(theme.bgImage);
        setScreenBgColor('transparent'); // Make background transparent when using image
      } else {
        setBackgroundImage(null);
        setScreenBgColor(theme.bgColor);
      }
      
      // Set other theme properties
      setModalFontColor(theme.fontColor);
      setModalFontType(theme.fontType);
      setModalTileColor(theme.tileColor);
      
      // Update header colors
      setHeaderTileColor(theme.tileColor);
      setHeaderFontColor(theme.fontColor);
      
      // Handle fontSize safely
      if ('fontSize' in theme) {
        setModalFontSize(theme.fontSize || 16);
      }
      
      // Handle text shadow properties if they exist
      if ('textShadowColor' in theme) {
        setTextShadowEnabled(true);
        setTextShadowColor(theme.textShadowColor);
        setTextShadowOffset(theme.textShadowOffset || { width: 1, height: 1 });
        setTextShadowRadius(theme.textShadowRadius || 1);
      } else {
        setTextShadowEnabled(false);
      }
    }
  };

  // Update the useEffect that handles theme changes
  useEffect(() => {
    // Update text colors based on theme
    if (currentTheme === 'Fancy' || currentTheme === 'Elegant') {
      setHeaderTextColor('#000000');
      setDateTextColor('#000000');
    } else {
      setHeaderTextColor(headerFontColor);
      setDateTextColor(headerFontColor);
    }
  }, [currentTheme, headerFontColor]);

  // Update the previewEvent function to properly handle tile names
  const previewEvent = () => {
    console.log('Previewing event with tileNames:', tileNames);
    
    // Create formatted slot labels from the tileTitle state
    const formattedSlotLabels = {};
    
    if (slotLabels && typeof slotLabels === 'object') {
      Object.keys(slotLabels).forEach(key => {
        formattedSlotLabels[key] = slotLabels[key];
      });
    }
    
    if (editedTiles && Object.keys(editedTiles).length > 0) {
      Object.keys(editedTiles).forEach(key => {
        if (editedTiles[key]) {
          // Use the tileTitle state variable
          const title = tileTitle[key] || '';
          if (title) {
            formattedSlotLabels[key] = title;
          }
        }
      });
    }
    
    // Navigate to EventSignUpScreen
    navigation.navigate('EventSignUpScreen', {
      eventId: eventName,
      id: location,
      username: organizer,
      eventName: editedEventName || eventName,
      location: editedLocation || location,
      organizer: editedOrganizer || organizer,
      address: editedAddress || address,
      eventTime: editedEventTime || eventTime,
      neededItems: neededItems,
      dates: dates.map((date, index) => ({
        ...date,
        date: editedDate[index] || date.date,
        isTimeSlot: date.isTimeSlot !== undefined ? date.isTimeSlot : false, // Preserve the original isTimeSlot value
      })),
      timeSlots: editedTimeSlots, // Use the edited time slots
      bgColor: backgroundImage ? 'transparent' : screenBgColor,
      fontColor: modalFontColor,
      fontSize: modalFontSize,
      fontType: modalFontType,
      tileColor: modalTileColor,
      headerTileColor: headerTileColor,
      headerFontColor: headerFontColor,
      headerTextColor: headerTextColor,
      dateTextColor: dateTextColor,
      backgroundImage: backgroundImage,
      slotLabels: formattedSlotLabels,
      tileNames: tileNames, // Make sure to include tileNames
      editedTiles: editedTiles, // Make sure to include editedTiles
      textNotificationsEnabled: false,
      organizerPhone: '',
      emailNotificationsEnabled: false,
      organizerEmail: '',
      globalNote: '',
      textShadowEnabled: textShadowEnabled || false,
      isTimeSlot: true,
      isNewEvent: true,
      isPreview: true,
      fullScreenBackground: true,
      useTransparentBackground: !!backgroundImage,
      preserveTileColor: true,
      signupTileOpacity: 0.6,
      useOriginalTileColor: true,
      // Add a callback function to handle updates from EventSignUpScreen
      onSubmit: (updatedData) => {
        console.log('Received updated data from EventSignUpScreen:', updatedData);
        if (updatedData.timeSlots) {
          setEditedTimeSlots(updatedData.timeSlots);
        }
      }
    });
  };

  // Add this useFocusEffect hook inside your component
  useFocusEffect(
    React.useCallback(() => {
      // This code runs when the screen comes into focus
      const loadTimeSlots = async () => {
        try {
          // Check if we're returning from EventSignUpScreen with updated time slots
          if (route.params?.updatedTimeSlots) {
            console.log('Received updated time slots:', route.params.updatedTimeSlots);
            setEditedTimeSlots(route.params.updatedTimeSlots);
          }
        } catch (error) {
          console.error('Error loading time slots:', error);
        }
      };

      loadTimeSlots();
      
      return () => {
        // This code runs when the screen goes out of focus
      };
    }, [route.params?.updatedTimeSlots])
  ); // Close the useCallback

  // Add this function to your SignUpScreen component, near your other handler functions
  const handleSelectBackgroundImage = () => {
    launchImageLibrary({
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 1200,
      maxWidth: 1200,
    }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;
        setBackgroundImage({ uri: selectedImageUri });
        setScreenBgColor('transparent');
      }
    });
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        imageStyle={{ opacity: 0.8 }}
        resizeMode="cover"
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSpace} />
          
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>Create Your Event</Text>
              <TouchableOpacity
                style={styles.headerEditButton}
                onPress={() => setIsHeaderEditing(true)}
              >
                <MaterialIcons name="edit" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Theme Selection Buttons */}
          <View style={styles.themeButtonContainer}>
            <TouchableOpacity
              style={styles.themeButton}
              onPress={openThemeModal}
            >
              <Text style={styles.themeButtonText}>Theme Choices</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.customizeButton}
              onPress={() => setCustomizeModalVisible(true)}
            >
              <Text style={styles.customizeButtonText}>Customize Appearance</Text>
            </TouchableOpacity>
          </View>
          
          {/* Event Information Form */}
          {dates.map((dateData, dateIndex) => (
            <View key={dateIndex} style={styles.dateTile}>
              <TouchableOpacity 
                style={styles.dateEditableContainer} 
                onPress={() => setIsDateEditing(dateIndex)}
              >
                {isDateEditing === dateIndex ? (
                  <View style={styles.dateEditContainer}>
                    <TextInput
                      style={[
                        styles.dateInput,
                        { 
                          fontSize: modalFontSize + 4, 
                          fontFamily: modalFontType,
                          color: modalFontColor 
                        }
                      ]}
                      value={editedDate[dateIndex]}
                      onChangeText={(text) => {
                        const newDates = [...editedDate];
                        newDates[dateIndex] = text;
                        setEditedDate(newDates);
                      }}
                      placeholder="Enter Date"
                      placeholderTextColor="rgba(0,0,0,0.5)"
                    />
                    <TouchableOpacity 
                      style={styles.saveDateButton}
                      onPress={() => setIsDateEditing(null)}
                    >
                      <Text style={styles.saveDateButtonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.dateTextContainer}>
                  <Text 
                    style={[
                      styles.dateText,
                      {
                        color: dateTextColor,
                        backgroundColor: headerTileColor || 'rgba(0, 0, 0, 0.7)',
                        fontFamily: modalFontType,
                        fontSize: modalFontSize + 2,
                        borderColor: 'gold',
                        borderWidth: 2, // Add gold border
                        ...(textShadowEnabled ? {
                          textShadowColor: 'rgba(0, 0, 0, 0.75)',
                          textShadowOffset: { width: 1, height: 1 },
                          textShadowRadius: 2,
                        } : {})
                      }
                    ]}>
                    {editedDate[dateIndex] || dates[dateIndex].date}
                  </Text>
                    <View style={styles.dateEditIconContainer}>
                      <MaterialIcons 
                        name="edit" 
                        size={16} 
                        color={headerFontColor || 'white'} 
                        style={styles.dateEditIcon}
                      />
                    </View>
                  </View>
                )}
              </TouchableOpacity>
              <View style={styles.tileRow}>{renderSlotsOrAttendees(dateIndex)}</View>
            </View>
          ))}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveAsDraftButton}
              onPress={saveDraft}
            >
              <Text style={styles.saveAsDraftText}>Save as Draft</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.previewButton}
              onPress={handleSubmitEvent}
            >
              <Text style={styles.previewButtonText}>Submit Your Event</Text>
            </TouchableOpacity>
      </View>
    </ScrollView>
      </ImageBackground>

      {/* Theme Modal */}
      <Modal
        visible={isThemesModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeThemeModal}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: screenBgColor }]}>
            <Text style={[styles.modalTitle, { color: modalFontColor }]}>Choose a Theme</Text>
            <ScrollView horizontal contentContainerStyle={styles.themesContainer}>
              {themes.map((theme, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.themeOption,
                    { borderColor: currentTheme === theme.name ? 'gold' : 'transparent' },
                    { width: 150, height: 150 }
                  ]}
                  onPress={() => {
                    handleThemeSelection(theme.name);
                    closeThemeModal();
                  }}
                >
                  <View style={styles.themeContent}>
                    {theme.bgImage && (
                      <Image 
                        source={theme.bgImage} 
                        style={styles.themeImage}
                        resizeMode="cover"
                      />
                    )}
                    {!theme.bgImage && (
                  <View
                    style={[
                          styles.themeColorBackground, 
                          { backgroundColor: theme.bgColor || theme.tileColor || 'gray' }
                        ]} 
                      />
                    )}
                  </View>
                  <View style={styles.themeTextContainer}>
                    <Text style={[
                        styles.themeText,
                      { color: theme.fontColor || 'white', backgroundColor: 'gold', padding: 8, borderRadius: 5 }
                    ]}>
                      {theme.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={closeThemeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Customize Appearance Modal */}
      <Modal
        visible={customizeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCustomizeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: screenBgColor }]}>
            <Text style={[styles.modalTitle, { color: modalFontColor }]}>Customize Appearance</Text>
            
            <View style={styles.customizeSection}>
              <Text style={[styles.sectionTitle, { color: modalFontColor }]}>Colors</Text>
              
              <TouchableOpacity
                style={styles.customizeButton}
                onPress={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
              >
                <Text style={[styles.customizeButtonText, { color: modalFontColor }]}>Background Color</Text>
                <View style={[styles.colorPreview, { backgroundColor: screenBgColor }]} />
              </TouchableOpacity>
              
              {showBackgroundColorPicker && (
                <ColorPicker
                  color={screenBgColor}
                  onColorChange={(color) => setScreenBgColor(color)}
                />
              )}
              
              <TouchableOpacity
                style={styles.customizeButton}
                onPress={() => setShowFontColorPicker(!showFontColorPicker)}
              >
                <Text style={[styles.customizeButtonText, { color: modalFontColor }]}>Text Color</Text>
                <View style={[styles.colorPreview, { backgroundColor: modalFontColor }]} />
              </TouchableOpacity>
              
              {showFontColorPicker && (
                <ColorPicker
                  color={modalFontColor}
                  onColorChange={(color) => setModalFontColor(color)}
                />
              )}
              
              <TouchableOpacity
                style={styles.customizeButton}
                onPress={() => setShowTileColorPicker(!showTileColorPicker)}
              >
                <Text style={[styles.customizeButtonText, { color: modalFontColor }]}>Tile Color</Text>
                <View style={[styles.colorPreview, { backgroundColor: modalTileColor }]} />
              </TouchableOpacity>
              
              {showTileColorPicker && (
                <ColorPicker
                  color={modalTileColor}
                  onColorChange={(color) => setModalTileColor(color)}
                />
              )}
            </View>
            
            <View style={styles.customizeSection}>
              <Text style={[styles.sectionTitle, { color: modalFontColor }]}>Font</Text>
              
              <View style={styles.fontButtons}>
                <TouchableOpacity
                  style={[
                    styles.fontButton,
                    modalFontType === 'Arial' && styles.selectedFontButton,
                  ]}
                  onPress={() => setModalFontType('Arial')}
                >
                  <Text style={[styles.fontButtonText, { fontFamily: 'Arial' }]}>Arial</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.fontButton,
                    modalFontType === 'Helvetica' && styles.selectedFontButton,
                  ]}
                  onPress={() => setModalFontType('Helvetica')}
                >
                  <Text style={[styles.fontButtonText, { fontFamily: 'Helvetica' }]}>Helvetica</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.fontButton,
                    modalFontType === 'Georgia' && styles.selectedFontButton,
                  ]}
                  onPress={() => setModalFontType('Georgia')}
                >
                  <Text style={[styles.fontButtonText, { fontFamily: 'Georgia' }]}>Georgia</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.fontSizeSection}>
                <Text style={[styles.fontSectionTitle, { color: modalFontColor }]}>Font Size</Text>
                <View style={styles.fontSizeButtons}>
                  <TouchableOpacity
                    style={styles.fontSizeButton}
                    onPress={() => setModalFontSize(Math.max(12, modalFontSize - 2))}
                  >
                    <Text style={[styles.fontSizeButtonText, { color: modalFontColor }]}>-</Text>
                  </TouchableOpacity>
                  <Text style={[styles.fontSizeText, { color: modalFontColor }]}>{modalFontSize}</Text>
                  <TouchableOpacity
                    style={styles.fontSizeButton}
                    onPress={() => setModalFontSize(Math.min(24, modalFontSize + 2))}
                  >
                    <Text style={[styles.fontSizeButtonText, { color: modalFontColor }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.backgroundImageButton}
              onPress={handleSelectBackgroundImage}
            >
              <Text style={styles.backgroundImageButtonText}>
                {backgroundImage ? 'Change Background Image' : 'Add Background Image'}
              </Text>
            </TouchableOpacity>
            
            {backgroundImage && (
              <TouchableOpacity
                style={styles.removeBackgroundButton}
                onPress={() => {
                  setBackgroundImage(null);
                  setScreenBgColor('#f0f0f0');
                }}
              >
                <Text style={styles.removeBackgroundButtonText}>Remove Background Image</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.closeButton} onPress={() => setCustomizeModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for editing tile names */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeaderText}>Edit Tile Name</Text>
            <TextInput
              style={styles.modalInput}
              value={editedTileName}
              onChangeText={setEditedTileName}
              placeholder="Enter tile name"
            />
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={() => {
                  if (isEditingTileName !== null) {
                    const dateIndex = Math.floor(isEditingTileName / 10);
                    const slotIndex = isEditingTileName % 10;
                    handleTileNameChange(dateIndex, slotIndex, editedTileName);
                  }
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.applyToAllButton}
              onPress={() => {
                applyTileNameToAll(editedTileName);
                setModalVisible(false);
              }}
            >
              <Text style={styles.applyToAllButtonText}>Apply to All Tiles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  headerSpace: {
    height: 50,
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // Allow the scroll content to grow
    paddingBottom: 50, // Add extra padding at the bottom to ensure content is visible above the nav bar
  },
  header: {
    marginBottom: -5,
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  headerTextContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%',
    position: 'relative',
    borderColor: 'gold',
    borderWidth: 2,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerEditButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 1,
  },
  subHeaderText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
  },
  roundedButton: {
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
    marginHorizontal: 5,
  },
  roundedButtonText: {
    marginLeft: 6,
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
  },
  dateTile: {
    borderWidth: 0,
    borderRadius: 8,
    padding: 8,
    marginBottom: 15,
  },
  dateTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    marginBottom: 10,
  },
  dateText: {
    fontSize: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: 3,
    borderRadius: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: '70%',
    marginBottom: 0, // Changed from 10 to 0
    borderColor: 'gold',
    borderWidth: 2,
  },
  tileRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Changed from space-around to space-between
    width: '100%',
  },
  tile: {
    width: '48%',
    marginBottom: 15,
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
  tileText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  tileTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    width: '100%',
  },
  tileEditButton: {
    padding: 5,
    marginLeft: 5,
  },
  timeSlotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  timeText: {
    textAlign: 'center',
    marginRight: 5,
  },
  timeEditButton: {
    padding: 5,
  },
  slotTile: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '48%',
  },
  slotHeading: {
    fontSize: 18, // Increased base size
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
  },
  noteText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 5,
  },
  rsvpButton: {
    backgroundColor: 'gold',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  rsvpButtonText: {
    color: 'navy',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: 'gold',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'navy',
    fontWeight: 'bold',
    fontSize: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: 'navy',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  customizationContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    height: '70%',
    width: '100%',
  },
  selectButton: {
    width: '90%',
    height: 150,
    marginVertical: 8,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  customizationContent: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionButtonText: {
    fontSize: 16,
    color: 'black',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  previewText: {
    fontSize: 14,
    color: 'gray',
  },
  selectContainer: {
    padding: 8, // Reduced from 12
    borderRadius: 8,
    marginVertical: 4, // Reduced from 6
    backgroundColor: '#f8f9fa',
    width: '100%',
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownPicker: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginTop: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  colorGrid: {
    width: '100%',
  },
  colorOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: 'white',
  },
  colorOptionText: {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 8,
    fontWeight: '500',
  },
  editContainer: {
    padding: 20,
  },
  headerInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 5,
    marginBottom: 10,
  },
  headerColorButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 5,
    marginBottom: 10,
  },
  headerColorButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'navy',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 5,
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    color: 'white',
    textAlign: 'center',
    padding: 5,
  },
  saveDateButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  saveDateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollableDropdown: {
    maxHeight: 250,
  },
  fontOptionButton: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  fontOptionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fontPreviewText: {
    fontSize: 14,
    color: 'gray',
  },
  colorWheelContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginTop: 5,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  colorWheel: {
    height: 200,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Changed back from 0.5 to 0.3
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  themeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    gap: 15,
  },
  themeOption: {
    margin: 10,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  themesContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  themeTextContainer: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    alignItems: 'center',
  },
  themeText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
  },
  selectedTheme: {
    borderColor: '#007bff',
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  fontButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fontSizeSection: {
    marginBottom: 20,
  },
  fontSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fontSizeButton: {
    padding: 10,
    borderWidth: 2,
    borderRadius: 5,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  fontSizeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backgroundImageButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  backgroundImageButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeBackgroundButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  removeBackgroundButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: 'gold',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    alignSelf: 'center',
  },
  signUpButtonText: {
    color: 'navy',
    fontWeight: 'bold',
    fontSize: 14,
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 5,
  },
  customizeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  fontSizeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  colorPickerContainer: {
    width: '100%',
    height: 200,
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
  },
  colorPicker: {
    flex: 1,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  slotContainer: {
    width: '48%',
    marginBottom: 15,
  },
  slot: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 100,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tileContent: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 100,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  slotText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    width: '48%',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  saveButton: {
    backgroundColor: 'green',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  themeContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: 10,
  },
  themeColorBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    width: '100%',
  },
  saveAsDraftButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'gold',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '80%',
    marginBottom: 15,
  },
  saveAsDraftText: {
    color: 'navy',
    fontWeight: 'bold',
    fontSize: 16,
  },
  previewButton: {
    backgroundColor: 'navy',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  previewButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dateEditIconContainer: {
    position: 'absolute',
    right: '15%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    padding: 4,
    borderRadius: 12,
    marginLeft: 5,
  },
  dateEditIcon: {
    opacity: 0.8,
  },
  themeButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  themeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  customizeButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  fontButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  selectedFontButton: {
    borderColor: '#007bff',
    borderWidth: 2,
  },
  fontSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

const pickerSelectStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
};

export default SignUpScreen;