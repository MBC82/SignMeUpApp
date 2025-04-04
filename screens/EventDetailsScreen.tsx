import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Modal,
  TouchableWithoutFeedback,
  Switch,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { RouteProp, useNavigation as useNavigationType } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface RouteParams {
  eventId?: string;
  id?: string;
  username?: string;
  eventName?: string;
  location?: string;
  organizer?: string;
  address?: string;
  eventTime?: string;
  neededItems?: any[];
  dates?: any[];
  timeSlots?: any[][];
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
  slotLabels?: Record<string, any>;
  backgroundImage?: string | null;
  textShadowEnabled?: boolean;
  isTimeSlot?: boolean;
  isPreview?: boolean;
  isNewEvent?: boolean;
  showThemes?: boolean;
}

type RootStackParamList = {
  EnhancedSignUp: RouteParams;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  route: RouteProp<Record<string, RouteParams>, string>;
}

const EventDetailsScreen: React.FC<Props> = ({ route }) => {
  console.log('EventDetailsScreen rendered with params:', route.params);

  const {
    eventName,
    location,
    organizer,
    dates,
    timeSlots = [[]],
    eventTime = "TBD",
    bgColor: initialBgColor,
    fontColor: initialFontColor,
    fontSize: initialFontSize,
    fontType: initialFontType,
    tileColor: initialTileColor,
    isPreview = false,
  } = route.params;

  const [selectedSlot] = useState(timeSlots[0]?.[0] || "Not set");
  const [bgColor, setBgColor] = useState(initialBgColor || 'white');
  const [fontColor, setFontColor] = useState(initialFontColor || 'black');
  const [fontSize, setFontSize] = useState(initialFontSize || 16);
  const [fontType, setFontType] = useState(initialFontType || 'sans-serif');
  const [tileColor, setTileColor] = useState(initialTileColor || '#f0f0f0');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [openFontSizePicker, setOpenFontSizePicker] = useState(false);
  const [openTileColorPicker, setOpenTileColorPicker] = useState(false);
  const [openFontColorPicker, setOpenFontColorPicker] = useState(false);
  const [openBgColorPicker, setOpenBgColorPicker] = useState(false);
  const [openFontTypePicker, setOpenFontTypePicker] = useState(false);
  const [textShadowEnabled, setTextShadowEnabled] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isThemesModalVisible, setThemesModalVisible] = useState(false);

  const navigation = useNavigationType<NavigationProp>();

  // Function to render slots or attendees
  const renderSlotsOrAttendees = (dateIndex: number) => {
    if (!dates || !dates[dateIndex]) return null;
    
    if (dates[dateIndex].isTimeSlot && timeSlots && timeSlots[dateIndex]) {
      return (
        <View style={styles.slotsContainer}>
          {timeSlots[dateIndex].map((slot: any, slotIndex: number) => (
            <TouchableOpacity
              key={slotIndex}
              style={[styles.slot, { backgroundColor: tileColor }]}
            >
              <Text style={[styles.slotText, { color: fontColor, fontFamily: fontType }]}>
                {slot.start} - {slot.end}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.slotsContainer}>
          {Array.from({ length: dates[dateIndex].signups || 1 }).map((_, slotIndex: number) => (
            <TouchableOpacity
              key={slotIndex}
              style={[styles.slot, { backgroundColor: tileColor }]}
            >
              <Text style={[styles.slotText, { color: fontColor, fontFamily: fontType }]}>
                Attendee {slotIndex + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      );
    }
  };

  const handleConfirmCustomization = () => {
    console.log("Navigating to EnhancedSignUp with customization:", {
      bgColor,
      fontColor,
      fontSize,
      fontType,
      tileColor,
      backgroundImage
    });

    navigation.navigate('EnhancedSignUp', {
      eventId: route.params.eventId || '',
      id: route.params.id || '',
      username: route.params.username || '',
      eventName: eventName || '',
      location: location || '',
      organizer: organizer || '',
      address: route.params.address || '',
      eventTime: eventTime || '',
      neededItems: route.params.neededItems || [],
      dates: dates || [],
      timeSlots: timeSlots || [],
      bgColor: bgColor || '#FFFFFF',
      fontColor: fontColor || '#000000',
      fontSize: fontSize || 16,
      fontType: fontType || 'Arial',
      tileColor: tileColor || '#F0F0F0',
      textNotificationsEnabled: route.params.textNotificationsEnabled || false,
      organizerPhone: route.params.organizerPhone || '',
      emailNotificationsEnabled: route.params.emailNotificationsEnabled || false,
      organizerEmail: route.params.organizerEmail || '',
      globalNote: route.params.globalNote || '',
      slotLabels: route.params.slotLabels || {},
      backgroundImage: backgroundImage || null,
      textShadowEnabled: textShadowEnabled || false,
      isTimeSlot: route.params.isTimeSlot !== undefined ? route.params.isTimeSlot : true,
      isNewEvent: false,
      isPreview: false,
      showThemes: false
    });
  };

  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setBackgroundImage(response.assets[0].uri || null);
      }
    });
  };

  interface ArrowRightProps {
    onPress: () => void;
  }

  const ArrowRight: React.FC<ArrowRightProps> = ({ onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.arrow}>&gt;</Text>
    </TouchableOpacity>
  );

  const pickerStyle = {
    inputAndroid: {
      color: fontColor,
      textAlign: 'left' as const,
      fontSize: fontSize,
      padding: 10,
      backgroundColor: tileColor,
      borderRadius: 5,
    },
    inputIOS: {
      color: fontColor,
      textAlign: 'left' as const,
      fontSize: fontSize,
      padding: 10,
      backgroundColor: tileColor,
      borderRadius: 5,
    },
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header with Background Image */}
      <ImageBackground 
        source={backgroundImage ? { uri: backgroundImage } : undefined} 
        style={[styles.headerContainer, { backgroundColor: bgColor }]}
      >
        <Text style={[styles.headerText, { fontSize: fontSize + 6, color: fontColor, fontFamily: fontType }]}>
          Customize Your Event Page
        </Text>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.customizationContainer}>
        {/* Background Image Upload */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Heading Image</Text>
            <TouchableOpacity onPress={handleImageUpload}>
              <Text style={styles.selectButtonText}>Select Heading Image</Text>
            </TouchableOpacity>
            <ArrowRight onPress={handleImageUpload} />
          </View>
        </View>

        {/* Background Color Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Background Color</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => {
                  console.log('Selected background color:', itemValue);
                  setBgColor(itemValue);
                }}
                items={[
                  { label: 'White', value: 'white' },
                  { label: 'Light Gray', value: 'lightgray' },
                  { label: 'Light Blue', value: 'lightblue' },
                  { label: 'Pink', value: 'pink' },
                  { label: 'Green', value: 'green' },
                  { label: 'Dark Grey', value: 'grey' },
                  { label: 'Red', value: 'red' },
                  { label: 'Orange', value: 'orange' },
                  { label: 'Yellow', value: 'yellow' }
                ]}
                style={pickerStyle}
                value={bgColor}
                placeholder={{ label: "Select Background", value: null }}
                useNativeAndroidPickerStyle={false}
              />
            </View>
          </View>
        </View>

        {/* Font Color Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Font Color</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => {
                  console.log('Selected font color:', itemValue);
                  setFontColor(itemValue);
                }}
                items={[
                  { label: 'Black', value: 'black' },
                  { label: 'White', value: 'white' },
                  { label: 'Gray', value: 'gray' },
                ]}
                style={pickerStyle}
                value={fontColor}
                placeholder={{ label: "Select Font Color", value: null }}
                useNativeAndroidPickerStyle={false}
              />
            </View>
          </View>
        </View>

        {/* Font Size Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Font Size</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => {
                  console.log('Selected font size:', itemValue);
                  setFontSize(itemValue);
                }}
                items={[
                  { label: '12', value: 12 },
                  { label: '14', value: 14 },
                  { label: '16', value: 16 },
                  { label: '18', value: 18 },
                  { label: '20', value: 20 },
                  { label: '24', value: 24 },
                  { label: '30', value: 30 }
                ]}
                style={pickerStyle}
                value={fontSize}
                placeholder={{ label: "Select Font Size", value: null }}
                useNativeAndroidPickerStyle={false}
              />
            </View>
          </View>
        </View>

        {/* Font Type Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Font Type</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => {
                  console.log('Selected font type:', itemValue);
                  setFontType(itemValue);
                }}
                items={[
                  { label: 'Arial', value: 'Arial' },
                  { label: 'Times New Roman', value: 'Times New Roman' },
                  { label: 'Verdana', value: 'Verdana' }
                ]}
                style={pickerStyle}
                value={fontType}
                placeholder={{ label: "Select Font Type", value: null }}
                useNativeAndroidPickerStyle={false}
              />
            </View>
          </View>
        </View>

        {/* Tile Color Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Tile Color</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => {
                  console.log('Selected tile color:', itemValue);
                  setTileColor(itemValue);
                }}
                items={[
                  { label: 'White', value: '#FFFFFF' },
                  { label: 'Light Gray', value: '#F0F0F0' },
                  { label: 'Light Blue', value: '#E6F3FF' },
                  { label: 'Light Green', value: '#90ee90' }
                ]}
                style={pickerStyle}
                value={tileColor}
                placeholder={{ label: "Select Tile Color", value: null }}
                useNativeAndroidPickerStyle={false}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button to pass customizations */}
      <View style={styles.confirmContainer}>
        <TouchableOpacity 
          style={styles.confirmButton}
          onPress={handleConfirmCustomization}
        >
          <Text style={styles.confirmButtonText}>Confirm Customization</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  headerContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    backgroundColor: 'white',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    fontFamily: 'sans-serif',
    marginBottom: 4,
  },
  timeslotContainer: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  customizationContainer: {
    padding: 10,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    backgroundColor: 'white',
  },
  selectLabel: {
    fontSize: 16,
    color: 'black',
  },
  selectButtonText: {
    color: 'blue',
    fontSize: 16,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldHeight: {
    height: 50,
  },
  arrow: {
    fontSize: 18,
    color: 'gray',
    marginLeft: 8,
  },
  confirmContainer: {
    paddingBottom: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: 'orange',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  slot: {
    width: '45%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  slotText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  dateTile: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 10,
    marginBottom: 15,
  },
  dateText: {
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default EventDetailsScreen;