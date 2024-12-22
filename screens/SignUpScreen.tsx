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
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

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

const SignUpScreen = ({ route }) => {
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

  const navigation = useNavigation();

  const [isModalVisible, setModalVisible] = useState(false);
  const [isThemesModalVisible, setThemesModalVisible] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [screenBgColor, setScreenBgColor] = useState(bgColor || 'white');
  const [modalFontColor, setModalFontColor] = useState(fontColor || 'black');
  const [modalFontSize, setModalFontSize] = useState(fontSize || 16);
  const [modalFontType, setModalFontType] = useState(fontType || 'sans-serif');
  const [modalTileColor, setModalTileColor] = useState(tileColor || '#f0f0f0');
  const [profileImage, setProfileImage] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isDesigner, setIsDesigner] = useState(false);

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
        setProfileImage(savedProfileImage || null);
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
      backgroundImage: backgroundImage?.uri || backgroundImage,
    };

    if (eventIndex !== undefined) {
      // Update the existing event
      submittedEvents[eventIndex] = updatedEvent;
    } else {
      // Add as a new submission
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
    const draftEvents = JSON.parse(await AsyncStorage.getItem('draftEvents')) || [];
    draftEvents.push({
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
      backgroundImage: backgroundImage?.uri || backgroundImage, // Save local image path or uploaded URI
    });
    await AsyncStorage.setItem('draftEvents', JSON.stringify(draftEvents));
    alert('Event saved as draft!');
  } catch (error) {
    console.error('Error saving draft:', error);
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
  
      // Restore draft design
      if (draftBackgroundImage) {
        setBackgroundImage(draftBackgroundImage);
        setScreenBgColor('transparent'); // Ensure the color doesn't override the image
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

  const renderSlotsOrAttendees = (dateIndex) => {
    const signups = dates[dateIndex].signups || 1;

    return Array.from({ length: signups }, (_, i) => {
      const slot = timeSlots?.[dateIndex]?.[i] || {};
      const start = slot.start ? String(slot.start) : null;
      const end = slot.end ? String(slot.end) : null;

      return (
        <View key={i} style={[styles.slotTile, { backgroundColor: modalTileColor, opacity: 0.9 }]}>
          <Text style={[styles.slotHeading, { color: modalFontColor, fontSize: modalFontSize }]}>
            {dates[dateIndex].isTimeSlot ? 'Time Slot' : `Attendee ${i + 1}`}
          </Text>
          {dates[dateIndex].isTimeSlot && start && end && (
            <Text style={[styles.timeText, { color: modalFontColor }]}>
              {start} - {end}
            </Text>
          )}
          {dates[dateIndex].notes && dates[dateIndex].notes[i] ? (
            <Text style={[styles.noteText, { color: modalFontColor }]}>
              {String(dates[dateIndex].notes[i])}
            </Text>
          ) : null}
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
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerText, { fontSize: modalFontSize + 8, fontFamily: modalFontType }]}>
                {eventName}
              </Text>
              <Text style={[styles.subHeaderText, { fontSize: modalFontSize, fontFamily: modalFontType }]}>
                Location: {location}
              </Text>
              <Text style={[styles.subHeaderText, { fontSize: modalFontSize, fontFamily: modalFontType }]}>
                Organizer: {organizer}
              </Text>
              {address && (
                <Text style={[styles.subHeaderText, { fontSize: modalFontSize, fontFamily: modalFontType }]}>
                  Address: {address}
                </Text>
              )}
              {eventTime && (
                <Text style={[styles.subHeaderText, { fontSize: modalFontSize, fontFamily: modalFontType }]}>
                  Event Time: {eventTime}
                </Text>
              )}
              {neededItems && neededItems.length > 0 && (
                <Text style={[styles.subHeaderText, { fontSize: modalFontSize, fontFamily: modalFontType }]}>
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
                style={styles.roundedButton}
              >
                <MaterialIcons name="edit" size={18} color="black" />
                <Text style={styles.roundedButtonText}>Customize Appearance</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setThemesModalVisible(true)} style={styles.roundedButton}>
                <MaterialIcons name="palette" size={18} color="black" />
                <Text style={styles.roundedButtonText}>Themes</Text>
              </TouchableOpacity>
            </View>
          </View>

          {dates.map((dateData, dateIndex) => (
            <View key={dateIndex} style={styles.dateTile}>
              <Text style={[styles.dateText, { fontSize: modalFontSize + 4, fontFamily: modalFontType }]}>
                {dateData.date}
              </Text>
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
                  <ScrollView contentContainerStyle={styles.customizationContent}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 10,
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
    marginLeft: 6, // Spacing between icon and text
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
  dateText: {
    fontSize: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    padding: 3,
    borderRadius: 10, // Add rounded corners
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'center',
    maxWidth: '70%',
    marginBottom: 10,
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
    opacity: 0.5, // Added opacity for semi-transparency
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    width: '70%', // Set the width to 70% of the screen
    alignSelf: 'center', // Center the button
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
    width: '70%', // Set the width to 70% of the screen
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
    paddingBottom: 20,
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
    backgroundColor: 'orange',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
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