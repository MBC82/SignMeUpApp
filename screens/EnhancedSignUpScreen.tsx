import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ImageBackground,
  Modal,
  Switch,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../App';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Predefined themes
const THEMES = {
  DARK: {
    name: 'Dark Theme',
    bgColor: '#222222',
    fontColor: '#FFFFFF',
    fontSize: 16,
    fontType: 'sans-serif',
    tileColor: '#444444'
  },
  TEACHER: {
    name: 'Teacher Theme',
    bgColor: '#F5F5DC', // Beige
    fontColor: '#000080', // Navy
    fontSize: 18,
    fontType: 'serif',
    tileColor: '#ADD8E6' // Light Blue
  },
  CLASSIC: {
    name: 'Classic Theme',
    bgColor: '#FFFFFF',
    fontColor: '#000000',
    fontSize: 16,
    fontType: 'Times New Roman',
    tileColor: '#F0F0F0'
  },
  MODERN: {
    name: 'Modern Theme',
    bgColor: '#F8F9FA',
    fontColor: '#212529',
    fontSize: 16,
    fontType: 'Roboto',
    tileColor: '#E9ECEF'
  },
  FANCY: {
    name: 'Fancy Theme',
    bgColor: '#FFF8DC', // Cornsilk
    fontColor: '#800080', // Purple
    fontSize: 18,
    fontType: 'cursive',
    tileColor: '#FFD700' // Gold
  }
};

type TimeSlot = {
  start: string;
  end: string;
  isTimeSlot?: boolean;
};

type SignupData = {
  name: string;
  email: string;
  phone: string;
  note: string;
  timestamp: string;
};

type NeededItem = {
  value: string;
};

type Theme = {
  name: string;
  bgColor: string;
  fontColor: string;
  fontSize: number;
  fontType: string;
  tileColor: string;
};

type ItemResponses = {
  [key: number]: string;
};

const EnhancedSignUpScreen = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'EnhancedSignUp'>>();
  const navigation = useNavigation();

  // Extract parameters from route
  const {
    eventId,
    id,
    username,
    eventName,
    location,
    organizer,
    address,
    eventTime,
    neededItems = [],
    dates = [],
    timeSlots = [],
    bgColor = '#FFFFFF',
    fontColor = '#000000',
    fontSize = 16,
    fontType = 'Arial',
    tileColor = '#F0F0F0',
    textNotificationsEnabled = false,
    organizerPhone = '',
    emailNotificationsEnabled = false,
    organizerEmail = '',
    globalNote = '',
    slotLabels = {},
    backgroundImage = null,
    textShadowEnabled = false,
    isTimeSlot = true,
    isNewEvent = false,
    isPreview = false,
    showThemes = false
  } = route.params || {};

  // State variables
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [attendeeNote, setAttendeeNote] = useState('');
  const [showThemeSelector, setShowThemeSelector] = useState(showThemes);
  const [currentTheme, setCurrentTheme] = useState({
    bgColor,
    fontColor,
    fontSize,
    fontType,
    tileColor
  });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const [showNeededItems, setShowNeededItems] = useState(false);
  const [itemResponses, setItemResponses] = useState<ItemResponses>({});

  // Load user profile on mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userProfileString = await EncryptedStorage.getItem('userProfile');
        if (userProfileString) {
          const userProfile = JSON.parse(userProfileString);
          setAttendeeName(userProfile.name || '');
          setAttendeeEmail(userProfile.email || '');
          setAttendeePhone(userProfile.phone || '');
          setCurrentUserName(userProfile.name || '');
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  // Apply a predefined theme
  const applyTheme = (theme: Theme) => {
    setCurrentTheme({
      bgColor: theme.bgColor,
      fontColor: theme.fontColor,
      fontSize: theme.fontSize,
      fontType: theme.fontType,
      tileColor: theme.tileColor
    });
    setShowThemeSelector(false);
  };

  // Handle slot selection
  const handleSlotSelection = (dateIndex: number, slotIndex: number) => {
    setSelectedDateIndex(dateIndex);
    setSelectedSlot(slotIndex);
    setIsSigningUp(true);
  };

  // Submit signup
  const handleSubmitSignup = async () => {
    if (!attendeeName) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (selectedSlot === null) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    try {
      // Create signup data
      const signupData = {
        name: attendeeName,
        email: attendeeEmail,
        phone: attendeePhone,
        note: attendeeNote,
        timestamp: new Date().toISOString()
      };

      // Get existing signups
      const existingSignups = await AsyncStorage.getItem(`eventSignups_${eventId}`) || '{}';
      const allSignups = JSON.parse(existingSignups);

      // Initialize date index if not exists
      if (!allSignups[selectedDateIndex]) {
        allSignups[selectedDateIndex] = {};
      }

      // Add signup to the selected slot
      allSignups[selectedDateIndex][selectedSlot] = signupData;
      
      // Save updated signups
      await AsyncStorage.setItem(`eventSignups_${eventId}`, JSON.stringify(allSignups));

      // Send notification if enabled
      if (textNotificationsEnabled && organizerPhone) {
        // Implement notification logic here
        Alert.alert('Success', 'Signup successful! Organizer has been notified.');
      } else {
        Alert.alert('Success', 'You have successfully signed up for this event!');
      }

      // Reset form
      setIsSigningUp(false);
      setSelectedSlot(null);
      setAttendeeNote('');
    } catch (error) {
      console.error('Error submitting signup:', error);
      Alert.alert('Error', 'Failed to submit signup. Please try again.');
    }
  };

  // Render a time slot
  const renderTimeSlot = (dateIndex: number, slotIndex: number, slot: TimeSlot, signup: SignupData | null = null) => {
    const isSelected = selectedDateIndex === dateIndex && selectedSlot === slotIndex;
    const slotLabel = slotLabels[`${dateIndex}-${slotIndex}`] || '';

    return (
      <TouchableOpacity
        key={`${dateIndex}-${slotIndex}`}
        style={[
          styles.slot,
          { backgroundColor: currentTheme.tileColor },
          isSelected && styles.selectedSlot,
          signup && styles.takenSlot
        ]}
        onPress={() => !signup && handleSlotSelection(dateIndex, slotIndex)}
        disabled={!!signup}
      >
        <Text style={[
          styles.slotTime,
          { color: currentTheme.fontColor, fontFamily: currentTheme.fontType, fontSize: currentTheme.fontSize - 2 }
        ]}>
          {isTimeSlot ? `${slot.start} - ${slot.end}` : `Slot ${slotIndex + 1}`}
        </Text>
        
        {slotLabel && (
          <Text style={[
            styles.slotLabel,
            { color: currentTheme.fontColor, fontFamily: currentTheme.fontType, fontSize: currentTheme.fontSize - 4 }
          ]}>
            {slotLabel}
          </Text>
        )}

        {signup && (
          <View style={styles.takenBadge}>
            <Text style={styles.takenBadgeText}>
              {signup.name === currentUserName ? 'You signed up!' : 'Taken'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render theme selector
  const renderThemeSelector = () => (
    <Modal
      visible={showThemeSelector}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowThemeSelector(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.themeSelector}>
          <Text style={styles.themeSelectorTitle}>Select a Theme</Text>
          
          {Object.values(THEMES).map((theme, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.themeOption,
                { backgroundColor: theme.bgColor, borderColor: theme.tileColor }
              ]}
              onPress={() => applyTheme(theme)}
            >
              <Text style={[
                styles.themeOptionText,
                { color: theme.fontColor, fontFamily: theme.fontType, fontSize: theme.fontSize }
              ]}>
                {theme.name}
              </Text>
              <View style={[styles.themeSample, { backgroundColor: theme.tileColor }]}>
                <Text style={{ color: theme.fontColor, fontFamily: theme.fontType }}>Sample Tile</Text>
              </View>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowThemeSelector(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Render signup form
  const renderSignupForm = () => (
    <Modal
      visible={isSigningUp}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsSigningUp(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.signupForm}>
          <Text style={styles.signupFormTitle}>Sign Up for Event</Text>
          
          <Text style={styles.inputLabel}>Name *</Text>
          <TextInput
            style={styles.input}
            value={attendeeName}
            onChangeText={setAttendeeName}
            placeholder="Your Name"
          />
          
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={attendeeEmail}
            onChangeText={setAttendeeEmail}
            placeholder="Your Email"
            keyboardType="email-address"
          />
          
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={attendeePhone}
            onChangeText={setAttendeePhone}
            placeholder="Your Phone"
            keyboardType="phone-pad"
          />
          
          <Text style={styles.inputLabel}>Note</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            value={attendeeNote}
            onChangeText={setAttendeeNote}
            placeholder="Add a note (optional)"
            multiline
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setIsSigningUp(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmitSignup}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Render needed items
  const renderNeededItems = () => (
    <Modal
      visible={showNeededItems}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowNeededItems(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.neededItemsContainer}>
          <Text style={styles.neededItemsTitle}>Items Needed</Text>
          
          {neededItems.map((item: string, index: number) => (
            <View key={index} style={styles.neededItemRow}>
              <Text style={styles.neededItemText}>{item}</Text>
              <TextInput
                style={styles.neededItemInput}
                placeholder="I'll bring..."
                value={itemResponses[index] || ''}
                onChangeText={(text) => {
                  setItemResponses({...itemResponses, [index]: text});
                }}
              />
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowNeededItems(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <ImageBackground
      source={backgroundImage ? { uri: backgroundImage } : undefined}
      style={[styles.container, { backgroundColor: currentTheme.bgColor }]}
    >
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[
            styles.eventName,
            { color: currentTheme.fontColor, fontFamily: currentTheme.fontType, fontSize: currentTheme.fontSize + 8 }
          ]}>
            {eventName}
          </Text>
          
          <Text style={[
            styles.eventDetails,
            { color: currentTheme.fontColor, fontFamily: currentTheme.fontType, fontSize: currentTheme.fontSize }
          ]}>
            {location} • {eventTime}
          </Text>
          
          {organizer && (
            <Text style={[
              styles.organizer,
              { color: currentTheme.fontColor, fontFamily: currentTheme.fontType, fontSize: currentTheme.fontSize - 2 }
            ]}>
              Organized by: {organizer}
            </Text>
          )}
          
          {globalNote && (
            <View style={styles.globalNoteContainer}>
              <Text style={[
                styles.globalNote,
                { color: currentTheme.fontColor, fontFamily: currentTheme.fontType, fontSize: currentTheme.fontSize - 2 }
              ]}>
                {globalNote}
              </Text>
            </View>
          )}
        </View>
        
        {/* Theme Button */}
        {isPreview && (
          <TouchableOpacity
            style={styles.themeButton}
            onPress={() => setShowThemeSelector(true)}
          >
            <MaterialIcons name="color-lens" size={24} color="#FFFFFF" />
            <Text style={styles.themeButtonText}>Choose Theme</Text>
          </TouchableOpacity>
        )}
        
        {/* Needed Items Button */}
        {neededItems.length > 0 && (
          <TouchableOpacity
            style={styles.neededItemsButton}
            onPress={() => setShowNeededItems(true)}
          >
            <MaterialIcons name="shopping-basket" size={24} color="#FFFFFF" />
            <Text style={styles.neededItemsButtonText}>Items Needed</Text>
          </TouchableOpacity>
        )}
        
        {/* Dates Tabs */}
        {dates.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateTabsContainer}
          >
            {dates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateTab,
                  selectedDateIndex === index && styles.selectedDateTab
                ]}
                onPress={() => setSelectedDateIndex(index)}
              >
                <Text style={[
                  styles.dateTabText,
                  selectedDateIndex === index && styles.selectedDateTabText,
                  { fontFamily: currentTheme.fontType }
                ]}>
                  {date.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        {/* Time Slots Grid */}
        <View style={styles.slotsContainer}>
          {dates.length > 0 && dates[selectedDateIndex] && (
            <>
              <Text style={[
                styles.dateTitle,
                { color: currentTheme.fontColor, fontFamily: currentTheme.fontType, fontSize: currentTheme.fontSize + 2 }
              ]}>
                {dates[selectedDateIndex].date}
              </Text>
              
              <View style={styles.slotsGrid}>
                {timeSlots[selectedDateIndex]?.map((slot: TimeSlot, slotIndex: number) => 
                  renderTimeSlot(selectedDateIndex, slotIndex, slot)
                )}
                
                {/* If no time slots, show signup slots based on signups count */}
                {(!timeSlots[selectedDateIndex] || timeSlots[selectedDateIndex].length === 0) && 
                  Array.from({ length: 1 }).map((_, slotIndex) => 
                    renderTimeSlot(selectedDateIndex, slotIndex, { start: '', end: '' })
                  )
                }
              </View>
            </>
          )}
        </View>
      </ScrollView>
      
      {/* Render modals */}
      {renderThemeSelector()}
      {renderSignupForm()}
      {renderNeededItems()}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16
  },
  eventName: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center'
  },
  eventDetails: {
    marginBottom: 8,
    textAlign: 'center'
  },
  organizer: {
    marginBottom: 8,
    textAlign: 'center'
  },
  globalNoteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    width: '100%'
  },
  globalNote: {
    textAlign: 'center',
    fontStyle: 'italic'
  },
  themeButton: {
    backgroundColor: '#007BFF',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 16,
    alignSelf: 'center'
  },
  themeButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600'
  },
  neededItemsButton: {
    backgroundColor: '#28A745',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 16,
    alignSelf: 'center'
  },
  neededItemsButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '600'
  },
  dateTabsContainer: {
    flexDirection: 'row',
    marginBottom: 16
  },
  dateTab: {
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  selectedDateTab: {
    backgroundColor: '#007BFF',
    borderColor: 'gold',
    borderWidth: 2,
  },
  dateTabText: {
    color: '#333333'
  },
  selectedDateTabText: {
    color: '#FFFFFF',
    fontWeight: '600'
  },
  slotsContainer: {
    marginBottom: 24
  },
  dateTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  slot: {
    width: '48%',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedSlot: {
    borderWidth: 2,
    borderColor: '#007BFF'
  },
  takenSlot: {
    opacity: 0.7
  },
  slotTime: {
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center'
  },
  slotLabel: {
    textAlign: 'center',
    fontStyle: 'italic'
  },
  takenBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#DC3545',
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  takenBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600'
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  themeSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%'
  },
  themeSelectorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  themeOption: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    alignItems: 'center'
  },
  themeOptionText: {
    fontWeight: '600',
    marginBottom: 8
  },
  themeSample: {
    padding: 8,
    borderRadius: 4,
    width: '80%',
    alignItems: 'center'
  },
  signupForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%'
  },
  signupFormTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '500'
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  noteInput: {
    height: 100,
    textAlignVertical: 'top'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  button: {
    borderRadius: 8,
    padding: 12,
    width: '48%',
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#6C757D'
  },
  submitButton: {
    backgroundColor: '#007BFF'
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16
  },
  closeButton: {
    backgroundColor: '#6C757D',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16
  },
  neededItemsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%'
  },
  neededItemsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center'
  },
  neededItemRow: {
    marginBottom: 16
  },
  neededItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4
  },
  neededItemInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12
  }
});

export default EnhancedSignUpScreen; 