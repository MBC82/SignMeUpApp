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
  Image,
  TextInput,
  Alert,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import EncryptedStorage from 'react-native-encrypted-storage';

// Local images for themes
const localBackgrounds = {
  classic: require('../ios/assets/blue.jpg'),
  teacher2: require('../ios/assets/Notebook.jpg'),
  modern: require('../ios/assets/classic.jpg'),
  playful: require('../ios/assets/dreamy.jpg'),
  elegant: require('../ios/assets/elegant.jpg'),
  sporty: require('../ios/assets/sporty.jpg'),
  candy: require('../ios/assets/classygirl.jpg'),
  darkmode: require('../ios/assets/darkmode.jpg'),
};

// Define the type for the navigation parameters
type RootStackParamList = {
  Home: undefined;
  MyEvents: undefined;
  CreateEvent: undefined;
  ProfileSetup: undefined;
  SignUpScreen: {
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
    index?: number;
    headerTileColor?: string;
    headerFontColor?: string;
  };
  EventSignUp: {
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
    backgroundImage?: string | number | { uri: string } | null;
    isNewEvent: boolean;
    textNotificationsEnabled: boolean;
    organizerPhone: string;
    emailNotificationsEnabled: boolean;
    organizerEmail: string;
    globalNote: string;
    slotLabels: any;
    textShadowEnabled: boolean;
    isTimeSlot: boolean;
    isPreview: boolean;
    headerTileColor: string;
    headerFontColor: string;
    screenBgColor: string;
    modalFontColor: string;
    modalFontSize: number;
    modalFontType: string;
    modalTileColor: string;
  };
};

type SignUpScreenRouteProp = RouteProp<RootStackParamList, 'SignUpScreen'>;
type SignUpScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUpScreen'>;

const SignUpScreen = ({ route }: { route: SignUpScreenRouteProp }) => {
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const {
    eventName,
    location,
    organizer,
    address,
    eventTime,
    neededItems,
    dates: initialDates,
    timeSlots,
    bgColor,
    fontColor,
    fontSize,
    fontType,
    tileColor,
    headerTileColor,
    headerFontColor,
  } = route.params;

  const [dates, setDates] = useState(route.params?.dates || []);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isThemesModalVisible, setThemesModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editDateIndex, setEditDateIndex] = useState<number | null>(null);
  const [editSlotIndex, setEditSlotIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [applyToAll, setApplyToAll] = useState(false);
  const [applyNumbers, setApplyNumbers] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editingDate, setEditingDate] = useState('');
  const [backgroundImage, setBackgroundImage] = useState<{ uri: string } | null>(null);
  const [screenBgColor, setScreenBgColor] = useState(bgColor || 'white');
  const [modalFontColor, setModalFontColor] = useState(fontColor || 'black');
  const [modalFontSize, setModalFontSize] = useState(fontSize || 16);
  const [modalFontType, setModalFontType] = useState(fontType || 'sans-serif');
  const [modalTileColor, setModalTileColor] = useState(tileColor || '#f0f0f0');
  const [currentHeaderTileColor, setCurrentHeaderTileColor] = useState(headerTileColor || tileColor || '#f0f0f0');
  const [currentHeaderFontColor, setCurrentHeaderFontColor] = useState(headerFontColor || fontColor || 'black');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isDesigner, setIsDesigner] = useState(false);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editingHeaderField, setEditingHeaderField] = useState('');
  const [editingHeaderValue, setEditingHeaderValue] = useState('');
  const [headerValues, setHeaderValues] = useState({
    eventName,
    location,
    organizer,
    address,
    eventTime,
  });
  const [tileNames, setTileNames] = useState<Array<Array<string>>>([]);
  const [notes, setNotes] = useState<Array<Array<string>>>([]);
  const [showNotes, setShowNotes] = useState<Array<Array<boolean>>>([]);

  const themes = [
    { name: 'Classic', tileColor: 'gold', fontColor: 'navy', bgColor: '#f0f0f0', fontType: 'Roboto', bgImage: localBackgrounds.classic },
    { name: 'Teacher', tileColor: 'lightpink', fontColor: 'black', bgColor: '#f0f0f0', fontType: 'Marker Felt', bgImage: localBackgrounds.teacher2 },
    { name: 'Modern', tileColor: 'darkgray', fontColor: 'white', bgColor: '#263238', fontType: 'Roboto', bgImage: localBackgrounds.modern },
    { name: 'Fancy', tileColor: 'lightyellow', fontColor: 'black', bgColor: '#ffccbc', fontType: 'Comic Sans MS', bgImage: localBackgrounds.playful },
    { name: 'Elegant', tileColor: 'white', fontColor: 'black', bgColor: '#ede7f6', fontType: 'Georgia', bgImage: localBackgrounds.elegant },
    { name: 'Sporty', tileColor: '#81c784', fontColor: 'white', bgColor: '#a5d6a7', fontType: 'Comic Sans MS', bgImage: localBackgrounds.sporty },
    { name: 'Classy', tileColor: '#FFE4E1', fontColor: 'black', bgColor: '#a5d6a7', fontType: 'Comic Sans MS', bgImage: localBackgrounds.candy },
    { name: 'Dark Mode', tileColor: '#424242', fontColor: '#e0e0e0', bgColor: '#212121', fontType: 'Arial New', bgImage: localBackgrounds.darkmode },
  ];

  const applyTheme = (theme: any) => {
    setModalTileColor(theme.tileColor);
    setModalFontColor(theme.fontColor);
    setModalFontType(theme.fontType);
    setModalFontSize(theme.fontSize || 16);
    setCurrentHeaderTileColor(theme.tileColor);
    setCurrentHeaderFontColor(theme.fontColor);

    if (theme.bgImage) {
      setBackgroundImage(theme.bgImage);
      setScreenBgColor('transparent');
    } else {
      setBackgroundImage(null);
      setScreenBgColor(theme.bgColor);
    }

    setThemesModalVisible(false);
  };

  const handleBackgroundColorChange = (value: string) => {
    console.log('Selected background color:', value);
    if (value) {
      setBackgroundImage(null);
      setScreenBgColor(value);
    }
  };

  const handleFontColorChange = (value: string) => {
    console.log('Selected font color:', value);
    setModalFontColor(value);
  };

  const handleFontSizeChange = (value: string) => {
    console.log('Selected font size:', value);
    setModalFontSize(parseInt(value));
  };

  const handleFontTypeChange = (value: string) => {
    console.log('Selected font type:', value);
    setModalFontType(value);
  };

  const handleTileColorChange = (value: string) => {
    console.log('Selected tile color:', value);
    setModalTileColor(value);
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userPremiumStatus = true;
        const userDesignerStatus = true;

        setIsPremium(userPremiumStatus);
        setIsDesigner(userDesignerStatus);

        const savedProfileImage = await AsyncStorage.getItem('profileImage');
        setProfileImage(savedProfileImage || '');
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const submitEvent = async () => {
    try {
      const username = await EncryptedStorage.getItem('username');
      if (!username) {
        Alert.alert('Error', 'You must be logged in to submit events');
        return;
      }

      const storedEvents = await AsyncStorage.getItem(`submittedEvents_${username}`);
      const submittedEvents = storedEvents ? JSON.parse(storedEvents) : [];
      
      // Use the current tileNames state instead of initializing empty ones
      const updatedEvent = {
        id: Date.now().toString(),
        eventId: Date.now().toString(),
        username,
        eventName: route.params.eventName,
        location: route.params.location,
        organizer: route.params.organizer,
        address: route.params.address,
        eventTime: route.params.eventTime,
        neededItems: route.params.neededItems || [],
        dates: dates.map(date => ({
          ...date,
          notes: date.notes || []
        })),
        timeSlots: route.params.timeSlots || [],
        bgColor: screenBgColor,
        fontColor: modalFontColor,
        fontSize: modalFontSize,
        fontType: modalFontType,
        tileColor: modalTileColor,
        textNotificationsEnabled: false,
        organizerPhone: '',
        emailNotificationsEnabled: false,
        organizerEmail: '',
        globalNote: '',
        slotLabels: {},
        backgroundImage: backgroundImage || 2,
        textShadowEnabled: false,
        isTimeSlot: false,
        isNewEvent: true,
        isPreview: false,
        isEditing: false,
        headerTileColor: currentHeaderTileColor,
        headerFontColor: currentHeaderFontColor,
        screenBgColor: screenBgColor,
        modalFontColor: modalFontColor,
        modalFontSize: modalFontSize,
        modalFontType: modalFontType,
        modalTileColor: modalTileColor,
        tileNames: tileNames, // Pass the current tileNames state
        editedTiles: {}
      };

      submittedEvents.push(updatedEvent);
      await AsyncStorage.setItem(`submittedEvents_${username}`, JSON.stringify(submittedEvents));
      
      navigation.navigate('EventSignUp', updatedEvent);
    } catch (error) {
      console.error('Error submitting event:', error);
      Alert.alert('Error', 'Failed to submit event');
    }
  };

  const saveDraft = async () => {
    try {
      const username = await EncryptedStorage.getItem('username');
      if (!username) {
        Alert.alert('Error', 'You must be logged in to save drafts');
        return;
      }
      
      const draftKey = `draftEvents_${username}`;
      const draftEventsJson = await AsyncStorage.getItem(draftKey);
      const draftEvents = draftEventsJson ? JSON.parse(draftEventsJson) : [];
      const newDraft = {
        eventId: Date.now().toString(),
        id: Date.now().toString(),
        username: username,
        eventName: eventName,
        location: location,
        organizer: organizer,
        address: address,
        eventTime: eventTime,
        neededItems,
        dates,
        timeSlots,
        bgColor: screenBgColor,
        fontColor: modalFontColor,
        fontSize: modalFontSize,
        fontType: modalFontType,
        tileColor: modalTileColor,
        backgroundImage: backgroundImage?.uri || backgroundImage || null,
        isDraft: true,
        createdAt: Date.now(),
        textNotificationsEnabled: false,
        organizerPhone: '',
        emailNotificationsEnabled: false,
        organizerEmail: '',
        globalNote: '',
        slotLabels: {},
        textShadowEnabled: false,
        headerTileColor: currentHeaderTileColor,
        headerFontColor: currentHeaderFontColor,
        currentTheme: {
          bgColor: screenBgColor,
          fontColor: modalFontColor,
          fontSize: modalFontSize,
          fontType: modalFontType,
          tileColor: modalTileColor
        }
      };
      
      draftEvents.push(newDraft);
      await AsyncStorage.setItem(draftKey, JSON.stringify(draftEvents));
      Alert.alert('Success', 'Event saved as draft!');
      navigation.navigate('MyEvents' as never);
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft. Please try again.');
    }
  };
  
  useEffect(() => {
    if (route.params) {
      const {
        backgroundImage: draftBackgroundImage,
        screenBgColor: draftScreenBgColor,
        modalTileColor: draftTileColor,
        modalFontColor: draftFontColor,
        modalFontSize: draftFontSize,
        modalFontType: draftFontType,
      } = route.params;
  
      if (draftBackgroundImage) {
        setBackgroundImage(draftBackgroundImage);
        setScreenBgColor('transparent');
      } else if (draftScreenBgColor) {
        setBackgroundImage(null);
        setScreenBgColor(draftScreenBgColor);
      }
      setModalTileColor(draftTileColor || modalTileColor);
      setModalFontColor(draftFontColor || modalFontColor);
      setModalFontSize(draftFontSize || modalFontSize);
      setModalFontType(draftFontType || modalFontType);
    }
  }, [route.params]);

  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;
        if (selectedImageUri) {
        setBackgroundImage({ uri: selectedImageUri });
        setScreenBgColor('transparent');
        }
      }
    });
  };

  const handleEditName = (dateIndex: number, slotIndex: number) => {
    setEditDateIndex(dateIndex);
    setEditSlotIndex(slotIndex);
    setEditName(tileNames[dateIndex]?.[slotIndex] || '');
    setIsEditingDate(false);
    setEditModalVisible(true);
  };

  const handleEditDate = (dateIndex: number) => {
    setEditDateIndex(dateIndex);
    setEditingDate(dates[dateIndex].date);
    setIsEditingDate(true);
    setEditModalVisible(true);
  };

  const handleEditConfirm = () => {
    if (editDateIndex === null) return;
    
    if (isEditingDate) {
      const updatedDates = [...dates];
      updatedDates[editDateIndex].date = editingDate;
      setDates(updatedDates);
    } else if (editSlotIndex !== null) {
      if (applyToAll) {
        handleApplyToAllAttendees();
        setApplyToAll(false);
      } else if (applyNumbers) {
        handleApplyNumbersToAttendees();
        setApplyNumbers(false);
      } else {
        handleTileNameChange(editDateIndex, editSlotIndex, editName);
      }
    }
    setEditName('');
    setEditDateIndex(null);
    setEditSlotIndex(null);
    setEditModalVisible(false);
  };

  const handleEditHeader = () => {
    setIsEditingHeader(true);
    setEditModalVisible(true);
  };

  const applyHeaderEdit = () => {
    setHeaderValues({
      eventName,
      location,
      organizer,
      address,
      eventTime,
    });
    setEditModalVisible(false);
    setIsEditingHeader(false);
  };

  const renderHeaderField = (label: string, value: string) => (
    <Text style={[styles.subHeaderText, { fontSize: modalFontSize, fontFamily: modalFontType, color: currentHeaderFontColor }]}>
      {label}: {value}
    </Text>
  );

  // Initialize notes state
  useEffect(() => {
    if (dates.length > 0) {
      // Initialize tile names only if they don't exist
      const initialTileNames = dates.map((date, dateIndex) => 
        Array(date.signups || 1).fill('').map((_, slotIndex) => 
          tileNames[dateIndex]?.[slotIndex] || ''
        )
      );
      setTileNames(initialTileNames);

      // Initialize notes array with notes from route params
      const initialNotes = dates.map(date => {
        const numSlots = date.signups || 1;
        const dateNotes = Array(numSlots).fill('');
        
        if (date.notes) {
          date.notes.forEach((note: string | null | undefined, index: number) => {
            if (note !== undefined && note !== null) {
              dateNotes[index] = note;
            }
          });
        }
        
        return dateNotes;
      });
      setNotes(initialNotes);

      // Initialize showNotes based on whether a note was added in create event screen
      const initialShowNotes = dates.map(date => {
        const numSlots = date.signups || 1;
        const dateShowNotes = Array(numSlots).fill(false);
        
        if (date.notes) {
          date.notes.forEach((note: string | null | undefined, index: number) => {
            if (note !== undefined && note !== null && note !== '') {
              dateShowNotes[index] = true;
            }
          });
        }
        
        return dateShowNotes;
      });
      
      setShowNotes(initialShowNotes);
    }
  }, [dates, timeSlots]);

  const handleNoteChange = (dateIndex: number, slotIndex: number, text: string) => {
    const updatedNotes = [...notes];
    if (!updatedNotes[dateIndex]) {
      updatedNotes[dateIndex] = [];
    }
    updatedNotes[dateIndex][slotIndex] = text;
    setNotes(updatedNotes);
  };

  const handleTileNameChange = (dateIndex: number, slotIndex: number, name: string) => {
    const updatedTileNames = [...tileNames];
    if (!updatedTileNames[dateIndex]) {
      updatedTileNames[dateIndex] = [];
    }
    updatedTileNames[dateIndex][slotIndex] = name;
    setTileNames(updatedTileNames);
  };

  const handleApplyToAllAttendees = () => {
    if (editName !== null && editName !== '' && editDateIndex !== null) {
      const updatedTileNames = [...tileNames];
      updatedTileNames[editDateIndex] = updatedTileNames[editDateIndex].map((_, index) => `${editName} ${index + 1}`);
      setTileNames(updatedTileNames);
      setEditName('');
      setEditDateIndex(null);
      setEditSlotIndex(null);
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
    }
  };

  const renderSlotsOrAttendees = (dateIndex: number) => {
    const signups = dates[dateIndex].signups || 1;

    return Array.from({ length: signups }, (_, i) => {
      const slot = timeSlots?.[dateIndex]?.[i] || {};
      const start = slot.start ? String(slot.start) : null;
      const end = slot.end ? String(slot.end) : null;
      const attendeeName = tileNames[dateIndex]?.[i] || (dates[dateIndex].isTimeSlot ? 'Time Slot' : `Attendee ${i + 1}`);
      const hasNote = notes[dateIndex]?.[i] && notes[dateIndex][i] !== '';

      return (
        <View key={i} style={[styles.slotTile, signups === 1 && styles.singleTile, { backgroundColor: modalTileColor, opacity: 0.9 }]}>
          <View style={styles.attendeeHeader}>
            <Text style={[styles.slotHeading, { color: currentHeaderFontColor, fontSize: modalFontSize }]}>
              {attendeeName}
            </Text>
            <TouchableOpacity 
              onPress={() => handleEditName(dateIndex, i)}
              style={styles.editIconButton}
            >
              <MaterialIcons name="edit" size={16} color={currentHeaderFontColor} />
            </TouchableOpacity>
          </View>
          {dates[dateIndex].isTimeSlot && start && end && (
            <Text style={[styles.timeText, { color: currentHeaderFontColor }]}>
              {start} - {end}
            </Text>
          )}
          {hasNote ? (
            <Text style={[styles.noteText, { color: currentHeaderFontColor }]}>
              {notes[dateIndex][i]}
            </Text>
          ) : showNotes[dateIndex]?.[i] ? (
            <TextInput
              style={[styles.noteInput, { color: currentHeaderFontColor }]}
              placeholder="Add a note (optional)"
              placeholderTextColor="gray"
              value={notes[dateIndex]?.[i] || ''}
              onChangeText={(text) => handleNoteChange(dateIndex, i, text)}
            />
          ) : null}
          <TouchableOpacity style={styles.rsvpButton}>
            <Text style={styles.rsvpButtonText}>Sign Me Up</Text>
          </TouchableOpacity>
        </View>
      );
    });
  };

  const handleCustomizePress = () => {
    if (isPremium || isDesigner) {
      setModalVisible(true);
    } else {
      Alert.alert('Premium Feature', 'This feature requires a premium subscription.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={backgroundImage || undefined}
        style={[styles.container, { backgroundColor: screenBgColor }]}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: screenBgColor }]}>
          <View style={styles.header}>
            <View style={[styles.headerTextContainer, { backgroundColor: currentHeaderTileColor }]}>
              <View style={styles.headerFieldContainer}>
                <Text style={[styles.headerText, { fontSize: modalFontSize + 8, fontFamily: modalFontType, color: currentHeaderFontColor }]}>
                  {headerValues.eventName}
                </Text>
                <TouchableOpacity 
                  onPress={handleEditHeader}
                  style={styles.editIconButton}
                >
                  <MaterialIcons name="edit" size={20} color={currentHeaderFontColor} />
                </TouchableOpacity>
              </View>
              {renderHeaderField('Location', headerValues.location)}
              {renderHeaderField('Organizer', headerValues.organizer)}
              {headerValues.address && renderHeaderField('Address', headerValues.address)}
              {headerValues.eventTime && renderHeaderField('Event Time', headerValues.eventTime)}
              {neededItems && neededItems.length > 0 && (
                <Text style={[styles.subHeaderText, { fontSize: modalFontSize, fontFamily: modalFontType, color: currentHeaderFontColor }]}>
                  Items Needed: {neededItems.map((item) => item.value).join(', ')}
                </Text>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 }}>
              <TouchableOpacity 
                onPress={handleCustomizePress}
                style={styles.customizeButton}
              >
                <MaterialIcons name="edit" size={18} color="black" />
                <Text style={styles.customizeButtonText}>Customize Appearance</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setThemesModalVisible(true)} style={styles.themesButton}>
                <MaterialIcons name="palette" size={18} color="black" />
                <Text style={styles.themesButtonText}>Themes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {dates.map((dateData, dateIndex) => (
            <View key={dateIndex} style={styles.dateTile}>
              <View style={[styles.dateHeader, { backgroundColor: currentHeaderTileColor }]}>
                <Text style={[styles.dateText, { fontSize: modalFontSize + 4, fontFamily: modalFontType, color: currentHeaderFontColor }]}>
                  {dateData.date}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleEditDate(dateIndex)}
                  style={styles.editIconButton}
                >
                  <MaterialIcons name="edit" size={20} color={currentHeaderFontColor} />
                </TouchableOpacity>
              </View>
              <View style={styles.tileRow}>{renderSlotsOrAttendees(dateIndex)}</View>
            </View>
          ))}

          <TouchableOpacity onPress={submitEvent} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Your Event</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={saveDraft} style={styles.saveDraftButton}>
            <Text style={styles.saveDraftButtonText}>Save as Draft</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Themes Modal */}
        <Modal visible={isThemesModalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => setThemesModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.customizationContainer}>
                  <ScrollView contentContainerStyle={styles.customizationContent}>
                    <Text style={styles.modalHeaderText}>Select a Theme</Text>
                    {themes.map((theme, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[styles.selectButton, { backgroundColor: theme.tileColor }]}
                        onPress={() => applyTheme(theme)}
                      >
                        {theme.bgImage && (
                          <Image 
                            source={theme.bgImage} 
                            style={{ width: '100%', height: 100, borderRadius: 10 }}
                            resizeMode="cover"
                          />
                        )}
                        <Text style={{ color: theme.fontColor, fontFamily: theme.fontType, fontSize: 16, marginTop: 10 }}>
                          {theme.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                  <TouchableOpacity onPress={() => setThemesModalVisible(false)} style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Customize Appearance Modal */}
        <Modal visible={isModalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.customizationContainer}>
                  <ScrollView
                    contentContainerStyle={styles.customizationContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    <Text style={styles.modalHeaderText}>Customize Your Event Page</Text>

                    {/* Background Image */}
                    <TouchableOpacity onPress={handleImageUpload} style={styles.selectButton}>
                      <Text style={styles.selectButtonText}>Select Background Image</Text>
                    </TouchableOpacity>
                    
                    {/* Background Color */}
                    <View style={styles.pickerContainer}>
                      <Text style={styles.selectLabel}>Background Color</Text>
                      <RNPickerSelect
                        onValueChange={handleBackgroundColorChange}
                        items={[
                          { label: 'White', value: 'white' },
                          { label: 'Light Green', value: 'lightgreen' },
                          { label: 'Orange', value: 'orange' },
                          { label: 'Light Gray', value: 'lightgray' },
                          { label: 'Light Blue', value: 'lightblue' },
                          { label: 'Dark Gray', value: 'darkgray' },
                          { label: 'Purple', value: 'purple' },
                          { label: 'Pink', value: 'pink' },
                        ]}
                        value={screenBgColor}
                        placeholder={{ label: 'Select Background Color', value: null }}
                        style={pickerSelectStyles}
                      />
                    </View>

                    {/* Font Color */}
                    <View style={styles.pickerContainer}>
                      <Text style={styles.selectLabel}>Font Color</Text>
                      <RNPickerSelect
                        onValueChange={handleFontColorChange}
                        items={[
                          { label: 'Black', value: 'black' },
                          { label: 'Gold', value: 'gold' },
                          { label: 'Pink', value: 'hotpink' },
                          { label: 'White', value: 'white' },
                          { label: 'Red', value: 'red' },
                          { label: 'Light Blue', value: 'lightblue' },
                          { label: 'Blue', value: 'blue' },
                          { label: 'Navy', value: 'navy' },
                          { label: 'Light Green', value: 'lightgreen' },
                          { label: 'Green', value: 'green' },
                        ]}
                        value={modalFontColor}
                        placeholder={{ label: 'Select Font Color', value: null }}
                        style={pickerSelectStyles}
                      />
                    </View>
                    
                    {/* Font Size */}
                    <View style={styles.pickerContainer}>
                      <Text style={styles.selectLabel}>Font Size</Text>
                      <RNPickerSelect
                        onValueChange={handleFontSizeChange}
                        items={[
                          { label: 'Small', value: '14' },
                          { label: 'Medium', value: '16' },
                          { label: 'Large', value: '20' },
                        ]}
                        value={modalFontSize.toString()}
                        placeholder={{ label: 'Select Font Size', value: null }}
                        style={pickerSelectStyles}
                      />
                    </View>

                    {/* Font Type */}
                    <View style={styles.pickerContainer}>
                      <Text style={styles.selectLabel}>Font Type</Text>
                      <RNPickerSelect
                        onValueChange={handleFontTypeChange}
                        items={[
                          { label: 'Arial', value: 'Arial' },
                          { label: 'Georgia', value: 'Georgia' },
                          { label: 'Sign Painter', value: 'SignPainter' },
                          { label: 'Noteworthy', value: 'Noteworthy' },
                          { label: 'Impact', value: 'Impact' },
                          { label: 'Courier New', value: 'Courier New' },
                          { label: 'Roboto', value: 'Roboto' },
                          { label: 'Comic Sans MS', value: 'Comic Sans MS' },
                        ]}
                        value={modalFontType}
                        placeholder={{ label: 'Select Font Type', value: null }}
                        style={pickerSelectStyles}
                      />
                    </View>

                    {/* Tile Color */}
                    <View style={styles.pickerContainer}>
                      <Text style={styles.selectLabel}>Tile Color</Text>
                      <RNPickerSelect
                        onValueChange={handleTileColorChange}
                        items={[
                          { label: 'White', value: '#ffffff' },
                          { label: 'Black', value: 'black' },
                          { label: 'Light Gray', value: '#f0f0f0' },
                          { label: 'Dark Gray', value: 'darkgray' },
                          { label: 'Light Blue', value: 'lightblue' },
                          { label: 'Turquoise', value: '#00FFFF' },
                          { label: 'Purple', value: 'purple' },
                          { label: 'Pink', value: 'pink' },
                          { label: 'Red', value: 'red' },
                          { label: 'Gold', value: 'gold' },
                          { label: 'Navy', value: 'navy' },
                          { label: 'Light Green', value: 'lightgreen' },
                          { label: 'Green', value: 'green' },
                        ]}
                        value={modalTileColor}
                        placeholder={{ label: 'Select Tile Color', value: null }}
                        style={pickerSelectStyles}
                      />
                    </View>
                    
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.confirmButton}>
                      <Text style={styles.confirmButtonText}>Confirm Customization</Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Edit Name Modal */}
        <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
          <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
            <View style={styles.modalContainer}>
              <TouchableWithoutFeedback>
                <View style={styles.customizationContainer}>
                  <Text style={styles.modalHeaderText}>
                    {isEditingHeader ? 'Edit Header Fields' : isEditingDate ? 'Edit Date' : 'Edit Tile Name'}
                  </Text>
                  {isEditingHeader ? (
                    <>
                      <View style={styles.headerEditContainer}>
                        <Text style={styles.headerEditLabel}>Event Name</Text>
                        <TextInput
                          style={styles.headerEditInput}
                          value={headerValues.eventName}
                          onChangeText={(text) => setHeaderValues({ ...headerValues, eventName: text })}
                          placeholder="Enter event name"
                        />
                        <Text style={styles.headerEditLabel}>Location</Text>
                        <TextInput
                          style={styles.headerEditInput}
                          value={headerValues.location}
                          onChangeText={(text) => setHeaderValues({ ...headerValues, location: text })}
                          placeholder="Enter location"
                        />
                        <Text style={styles.headerEditLabel}>Organizer</Text>
                        <TextInput
                          style={styles.headerEditInput}
                          value={headerValues.organizer}
                          onChangeText={(text) => setHeaderValues({ ...headerValues, organizer: text })}
                          placeholder="Enter organizer"
                        />
                        <Text style={styles.headerEditLabel}>Address</Text>
                        <TextInput
                          style={styles.headerEditInput}
                          value={headerValues.address}
                          onChangeText={(text) => setHeaderValues({ ...headerValues, address: text })}
                          placeholder="Enter address"
                        />
                        <Text style={styles.headerEditLabel}>Event Time</Text>
                        <TextInput
                          style={styles.headerEditInput}
                          value={headerValues.eventTime}
                          onChangeText={(text) => setHeaderValues({ ...headerValues, eventTime: text })}
                          placeholder="Enter event time"
                        />
                      </View>
                    </>
                  ) : isEditingDate ? (
                    <TextInput
                      style={styles.editInput}
                      value={editingDate}
                      onChangeText={setEditingDate}
                      placeholder="Enter date"
                    />
                  ) : (
                    <>
                      <TextInput
                        style={styles.editInput}
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="Enter attendee name"
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
                    </>
                  )}
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setEditModalVisible(false);
                        setApplyToAll(false);
                        setApplyNumbers(false);
                      }}
                    >
                      <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={isEditingHeader ? applyHeaderEdit : handleEditConfirm}
                    >
                      <Text style={styles.modalButtonText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.navButton}>
            <MaterialIcons name="home" size={30} color="navy" />
            <Text style={styles.iconLabel}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('MyEvents')} style={styles.navButton}>
            <MaterialIcons name="calendar-today" size={30} color="navy" />
            <Text style={styles.iconLabel}>My Events</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CreateEvent')} style={styles.navButton}>
            <MaterialIcons name="event" size={30} color="navy" />
            <Text style={styles.iconLabel}>Create Event</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileSetup')} style={styles.navButton}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImageNav} />
            ) : (
              <MaterialIcons name="account-circle" size={30} color="navy" />
            )}
            <Text style={styles.iconLabel}>My Profile</Text>
          </TouchableOpacity>
        </View>
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
  customizeButton: {
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
    borderWidth: 1,
    borderColor: 'black',
  },
  customizeButtonText: {
    marginLeft: 6,
    color: 'black',
    fontSize: 14,
    fontWeight: '500',
  },
  themesButton: {
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
    borderWidth: 1,
    borderColor: 'black',
  },
  themesButtonText: {
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