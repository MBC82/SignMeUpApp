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
    dates,
    timeSlots,
    bgColor,
    fontColor,
    fontSize,
    fontType,
    tileColor,
  } = route.params;

  const [isModalVisible, setModalVisible] = useState(false);
  const [isThemesModalVisible, setThemesModalVisible] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingDateIndex, setEditingDateIndex] = useState<number | null>(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState<number | null>(null);
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

  const themes = [
    { name: 'Classic', tileColor: 'gold', fontColor: 'navy', bgColor: '#f0f0f0', fontType: 'Roboto', bgImage: localBackgrounds.classic },
    { name: 'Teacher', tileColor: 'lightblue', fontColor: 'black', bgColor: '#f0f0f0', fontType: 'Marker Felt', bgImage: localBackgrounds.teacher2 },
    { name: 'Modern', tileColor: 'darkgray', fontColor: 'white', bgColor: '#263238', fontType: 'Roboto', bgImage: localBackgrounds.modern },
    { name: 'Fancy', tileColor: 'lightyellow', fontColor: 'black', bgColor: '#ffccbc', fontType: 'Comic Sans MS', bgImage: localBackgrounds.playful },
    { name: 'Elegant', tileColor: 'white', fontColor: 'black', bgColor: '#ede7f6', fontType: 'Georgia', bgImage: localBackgrounds.elegant },
    { name: 'Sporty', tileColor: '#81c784', fontColor: 'white', bgColor: '#a5d6a7', fontType: 'Comic Sans MS', bgImage: localBackgrounds.sporty },
    { name: 'Classy', tileColor: '#FFE4E1', fontColor: 'lightblue', bgColor: '#a5d6a7', fontType: 'Comic Sans MS', bgImage: localBackgrounds.candy },
    { name: 'Dark Mode', tileColor: '#424242', fontColor: '#e0e0e0', bgColor: '#212121', fontType: 'Arial New', bgImage: localBackgrounds.darkmode },
  ];

  const applyTheme = (theme) => {
    setModalTileColor(theme.tileColor);
    setModalFontColor(theme.fontColor);
    setModalFontType(theme.fontType);

    if (theme.bgImage) {
      setBackgroundImage(theme.bgImage);
      setScreenBgColor('transparent');
    } else {
      setBackgroundImage(null);
      setScreenBgColor(theme.bgColor);
    }

    setThemesModalVisible(false);
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
      const submittedEvents = JSON.parse(await AsyncStorage.getItem('submittedEvents')) || [];
      const eventIndex = route.params?.index;

      const updatedEvent = {
        eventName,
        location,
        organizer,
        address,
        eventTime,
        neededItems,
        dates,
        timeSlots,
        bgColor: screenBgColor,
      fontColor: modalFontColor,
      fontSize: modalFontSize,
      fontType: modalFontType,
      tileColor: modalTileColor,
        backgroundImage: backgroundImage?.uri || backgroundImage || '',
      };

      if (eventIndex !== undefined) {
        submittedEvents[eventIndex] = updatedEvent;
      } else {
        submittedEvents.push(updatedEvent);
      }

      await AsyncStorage.setItem('submittedEvents', JSON.stringify(submittedEvents));
      alert('Event submitted successfully!');
      navigation.navigate('MyEventsScreen');
    } catch (error) {
      console.error('Error submitting event:', error);
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
      const draftEvents = JSON.parse(await AsyncStorage.getItem(draftKey)) || [];
      const newDraft = {
        eventId: Date.now().toString(),
        id: Date.now().toString(),
        username: username,
        eventName: headerValues.eventName,
        location: headerValues.location,
        organizer: headerValues.organizer,
        address: headerValues.address,
        eventTime: headerValues.eventTime,
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
      };
      
      draftEvents.push(newDraft);
      await AsyncStorage.setItem(draftKey, JSON.stringify(draftEvents));
      Alert.alert('Success', 'Event saved as draft!');
      navigation.navigate('MyEventsScreen');
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
        setBackgroundImage({ uri: selectedImageUri });
        setScreenBgColor('transparent');
      }
    });
  };

  const handleEditName = (dateIndex: number, slotIndex: number) => {
    setEditingDateIndex(dateIndex);
    setEditingSlotIndex(slotIndex);
    setEditName(dates[dateIndex].notes?.[slotIndex] || '');
    setIsEditingDate(false);
    setEditModalVisible(true);
  };

  const handleEditDate = (dateIndex: number) => {
    setEditingDateIndex(dateIndex);
    setEditingDate(dates[dateIndex].date);
    setIsEditingDate(true);
    setEditModalVisible(true);
  };

  const applyNameEdit = () => {
    if (editingDateIndex === null) return;

    if (isEditingDate) {
      // Update the date
      dates[editingDateIndex].date = editingDate;
    } else if (editingSlotIndex !== null) {
      // Update attendee name
      if (applyToAll) {
        // Apply to all slots across all dates
        dates.forEach((date, dateIdx) => {
          const signups = date.signups || 1;
          for (let i = 0; i < signups; i++) {
            if (!date.notes) date.notes = [];
            if (applyNumbers) {
              date.notes[i] = `${editName} ${i + 1}`;
            } else {
              date.notes[i] = editName;
            }
          }
        });
          } else {
        // Apply only to the current slot
        if (!dates[editingDateIndex].notes) dates[editingDateIndex].notes = [];
        if (applyNumbers) {
          dates[editingDateIndex].notes[editingSlotIndex] = `${editName} ${editingSlotIndex + 1}`;
            } else {
          dates[editingDateIndex].notes[editingSlotIndex] = editName;
        }
      }
    }

    setEditModalVisible(false);
    setEditingDateIndex(null);
    setEditingSlotIndex(null);
    setEditName('');
    setEditingDate('');
    setIsEditingDate(false);
    setApplyToAll(false);
    setApplyNumbers(false);
  };

  const handleEditHeader = () => {
    setIsEditingHeader(true);
    setEditModalVisible(true);
  };

  const applyHeaderEdit = () => {
    setHeaderValues({
      eventName: headerValues.eventName,
      location: headerValues.location,
      organizer: headerValues.organizer,
      address: headerValues.address,
      eventTime: headerValues.eventTime,
    });
    setEditModalVisible(false);
    setIsEditingHeader(false);
  };

  const renderHeaderField = (label: string, value: string) => (
    <Text style={[styles.subHeaderText, { fontSize: modalFontSize, fontFamily: modalFontType, color: modalFontColor }]}>
      {label}: {value}
                </Text>
  );

  const renderSlotsOrAttendees = (dateIndex: number) => {
    const signups = dates[dateIndex].signups || 1;

    return Array.from({ length: signups }, (_, i) => {
      const slot = timeSlots?.[dateIndex]?.[i] || {};
      const start = slot.start ? String(slot.start) : null;
      const end = slot.end ? String(slot.end) : null;
      const attendeeName = dates[dateIndex].notes?.[i] || `Attendee ${i + 1}`;

      return (
        <View key={i} style={[styles.slotTile, { backgroundColor: modalTileColor, opacity: 0.9 }]}>
          <View style={styles.attendeeHeader}>
            <Text style={[styles.slotHeading, { color: modalFontColor, fontSize: modalFontSize }]}>
              {dates[dateIndex].isTimeSlot ? 'Time Slot' : attendeeName}
            </Text>
            <TouchableOpacity 
              onPress={() => handleEditName(dateIndex, i)}
              style={styles.editIconButton}
            >
              <MaterialIcons name="edit" size={16} color="navy" />
                  </TouchableOpacity>
                </View>
          {dates[dateIndex].isTimeSlot && start && end && (
            <Text style={[styles.timeText, { color: modalFontColor }]}>
              {start} - {end}
            </Text>
          )}
          <TouchableOpacity style={styles.rsvpButton}>
            <Text style={styles.rsvpButtonText}>Sign Me Up</Text>
              </TouchableOpacity>
            </View>
          );
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={backgroundImage ? backgroundImage : null}
        style={[styles.container, { backgroundColor: backgroundImage ? 'transparent' : screenBgColor }]}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
          <View style={styles.header}>
            <View style={[styles.headerTextContainer, { backgroundColor: modalTileColor }]}>
              <View style={styles.headerFieldContainer}>
                <Text style={[styles.headerText, { fontSize: modalFontSize + 8, fontFamily: modalFontType, color: modalFontColor }]}>
                  {headerValues.eventName}
                </Text>
                <TouchableOpacity 
                  onPress={handleEditHeader}
                  style={styles.editIconButton}
                >
                  <MaterialIcons name="edit" size={20} color={modalFontColor} />
                </TouchableOpacity>
              </View>
              {renderHeaderField('Location', headerValues.location)}
              {renderHeaderField('Organizer', headerValues.organizer)}
              {headerValues.address && renderHeaderField('Address', headerValues.address)}
              {headerValues.eventTime && renderHeaderField('Event Time', headerValues.eventTime)}
              {neededItems && neededItems.length > 0 && (
                <Text style={[styles.subHeaderText, { fontSize: modalFontSize, fontFamily: modalFontType, color: modalFontColor }]}>
                  Items Needed: {neededItems.map((item) => item.value).join(', ')}
        </Text>
              )}
      </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15 }}>
              <TouchableOpacity 
                onPress={() => {
                  if (isPremium || isDesigner) {
                    setModalVisible(true);
                  } else {
                    alert('This feature requires a premium subscription.');
                  }
                }}
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
              <View style={[styles.dateHeader, { backgroundColor: modalTileColor }]}>
                <Text style={[styles.dateText, { fontSize: modalFontSize + 4, fontFamily: modalFontType, color: modalFontColor }]}>
                  {dateData.date}
                </Text>
                <TouchableOpacity 
                  onPress={() => handleEditDate(dateIndex)}
                  style={styles.editIconButton}
                >
                  <MaterialIcons name="edit" size={20} color={modalFontColor} />
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
                        onValueChange={(value) => {
                          setScreenBgColor(value);
                          setBackgroundImage(null);
                        }}
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
                        placeholder={{ label: 'Select Background Color', value: null }}
                        style={pickerSelectStyles}
                      />
                    </View>

                    {/* Font Color */}
                    <View style={styles.pickerContainer}>
                      <Text style={styles.selectLabel}>Font Color</Text>
                      <RNPickerSelect
                        onValueChange={setModalFontColor}
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
                        placeholder={{ label: 'Select Font Color', value: null }}
                        style={pickerSelectStyles}
                      />
            </View>
            
                    {/* Font Size */}
                    <View style={styles.pickerContainer}>
                      <Text style={styles.selectLabel}>Font Size</Text>
                      <RNPickerSelect
                        onValueChange={(value) => setModalFontSize(parseInt(value))}
                        items={[
                          { label: 'Small', value: '14' },
                          { label: 'Medium', value: '16' },
                          { label: 'Large', value: '20' },
                        ]}
                        placeholder={{ label: 'Select Font Size', value: null }}
                        style={pickerSelectStyles}
                      />
                    </View>

                    {/* Font Type */}
                    <View style={styles.pickerContainer}>
                      <Text style={styles.selectLabel}>Font Type</Text>
                      <RNPickerSelect
                        onValueChange={setModalFontType}
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
                        placeholder={{ label: 'Select Font Type', value: null }}
                        style={pickerSelectStyles}
                      />
                    </View>

                    {/* Tile Color */}
                    <View style={styles.pickerContainer}>
                      <Text style={styles.selectLabel}>Tile Color</Text>
                      <RNPickerSelect
                        onValueChange={setModalTileColor}
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
                    {isEditingHeader ? 'Edit Header Fields' : isEditingDate ? 'Edit Date' : 'Edit Attendee Name'}
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
                      onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                      style={[styles.modalButton, styles.confirmButton]}
                      onPress={isEditingHeader ? applyHeaderEdit : applyNameEdit}
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
          <TouchableOpacity onPress={() => navigation.navigate('MyEventsScreen')} style={styles.navButton}>
            <MaterialIcons name="calendar-today" size={30} color="navy" />
            <Text style={styles.iconLabel}>My Events</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CreateEventScreen')} style={styles.navButton}>
            <MaterialIcons name="event" size={30} color="navy" />
            <Text style={styles.iconLabel}>Create Event</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileSetupScreen')} style={styles.navButton}>
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
    justifyContent: 'space-between',
  },
  slotTile: {
    width: '48%',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    opacity: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'gold',
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