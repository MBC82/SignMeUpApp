import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ImageBackground } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

const EventDetailsScreen = ({ route }) => {
  const {
    eventName,
    location,
    dates,
    timeSlots = [[]],  // Ensures timeSlots is always defined as an array of arrays
    eventTime = "TBD",  // Adds a default value for eventTime if undefined
    backgroundColor,
    fontColor: initialFontColor,
    fontSize: initialFontSize,
    fontType: initialFontType,
    tileColor: initialTileColor,
  } = route.params;

  const [selectedSlot] = useState(timeSlots[0]?.[0] || "Not set");
  const [bgColor, setBgColor] = useState(backgroundColor || 'white');
  const [fontColor, setFontColor] = useState(initialFontColor || 'black');
  const [fontSize, setFontSize] = useState(initialFontSize || 16);
  const [fontType, setFontType] = useState(initialFontType || 'sans-serif');
  const [tileColor, setTileColor] = useState(initialTileColor || '#f0f0f0');
  const [backgroundImage, setBackgroundImage] = useState(null);

  const navigation = useNavigation();

  const handleConfirmCustomization = () => {
    console.log("Navigating to SignUpScreen with timeSlots:", timeSlots);
    navigation.navigate('SignUpScreen', {
      eventName,
      location,
      eventTime,  // This is now ensured to be passed as a defined value
      dates,
      timeSlots,
      bgColor,
      fontColor,
      fontSize,
      fontType,
      tileColor,
      backgroundImage,
    });
  };

  const handleImageUpload = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) return;
      if (response.errorMessage) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setBackgroundImage(response.assets[0].uri);
      }
    });
  };

  const ArrowRight = ({ onPress }) => (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.arrow}>&gt;</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Header with Background Image */}
      <ImageBackground source={backgroundImage ? { uri: backgroundImage } : null} style={[styles.headerContainer, { backgroundColor: bgColor }]}>
        <Text style={[styles.headerText, { fontSize: fontSize + 6, color: fontColor, fontFamily: fontType }]}>
          Customize Your Event Page
        </Text>

        <View style={styles.timeslotContainer}>
          <TouchableOpacity
            style={{
              padding: 15,
              backgroundColor: tileColor,
              borderRadius: 20,
              alignItems: 'center',
              marginTop: 10,
            }}
          >
            <Text style={{ fontSize: fontSize, color: fontColor, fontFamily: fontType }}>
              Time Slot: {selectedSlot}
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.customizationContainer}>
        {/* Background Image Upload */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Heading Image</Text>
            <TouchableOpacity onPress={handleImageUpload}>
              <Text style={styles.selectButtonText}>Select Heading Image</Text>
            </TouchableOpacity>
            <ArrowRight />
          </View>
        </View>

        {/* Background Color Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Background Color</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => setBgColor(itemValue)}
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
                style={pickerStyles}
                placeholder={{ label: "Select Background", value: null }}
                useNativeAndroidPickerStyle={false}
              />
              <ArrowRight />
            </View>
          </View>
        </View>

        {/* Font Color Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Font Color</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => setFontColor(itemValue)}
                items={[
                  { label: 'Black', value: 'black' },
                  { label: 'White', value: 'white' },
                  { label: 'Red', value: 'red' },
                  { label: 'Blue', value: 'blue' },
                  { label: 'Green', value: 'green' },
                  { label: 'Pink', value: 'hotpink' },
                  { label: 'Purple', value: 'purple' },
                  { label: 'Brown', value: 'brown' },
                  { label: 'Orange', value: 'orange' }
                ]}
                style={pickerStyles}
                placeholder={{ label: "Select Font Color", value: null }}
                useNativeAndroidPickerStyle={false}
              />
              <ArrowRight />
            </View>
          </View>
        </View>

        {/* Font Size Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Font Size</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => setFontSize(parseInt(itemValue))}
                items={[
                  { label: 'Small', value: '14' },
                  { label: 'Medium', value: '16' },
                  { label: 'Large', value: '20' }
                ]}
                style={pickerStyles}
                placeholder={{ label: "Select Font Size", value: null }}
                useNativeAndroidPickerStyle={false}
              />
              <ArrowRight />
            </View>
          </View>
        </View>

        {/* Font Type Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Font Type</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => setFontType(itemValue)}
                items={[
                  { label: 'Noteworthy', value: 'Noteworthy' },
                  { label: 'Futura', value: 'Futura' },
                  { label: 'Rockwell', value: 'Rockwell' },
                  { label: 'Sans-Serif', value: 'sans-serif' },
                  { label: 'SignPainter', value: 'SignPainter' },
                  { label: 'Marker Felt', value: 'Marker Felt' },
                  { label: 'Times New Roman', value: 'Times New Roman' },
                  { label: 'Arial', value: 'Arial' }
                ]}
                style={pickerStyles}
                placeholder={{ label: "Select Font Type", value: null }}
                useNativeAndroidPickerStyle={false}
              />
              <ArrowRight />
            </View>
          </View>
        </View>

        {/* Tile Color Picker */}
        <View style={styles.pickerContainer}>
          <View style={[styles.selectContainer, styles.fieldHeight]}>
            <Text style={styles.selectLabel}>Tile Color</Text>
            <View style={styles.arrowContainer}>
              <RNPickerSelect
                onValueChange={(itemValue) => setTileColor(itemValue)}
                items={[
                  { label: 'Light Gray', value: '#f0f0f0' },
                  { label: 'Black', value: 'black' },
                  { label: 'Light Blue', value: 'lightblue' },
                  { label: 'Pink', value: 'pink' },
                  { label: 'Purple', value: 'purple' },
                  { label: 'Red', value: 'red' },
                  { label: 'Blue', value: 'blue' },
                  { label: 'Yellow', value: 'yellow' },
                  { label: 'Orange', value: 'orange' },
                  { label: 'Brown', value: 'brown' },
                  { label: 'Green', value: 'green' },
                  { label: 'Light Green', value: '#90ee90' }
                ]}
                style={pickerStyles}
                placeholder={{ label: "Select Tile Color", value: null }}
                useNativeAndroidPickerStyle={false}
              />
              <ArrowRight />
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
});

// Picker styles function to adjust styles based on color and size
const pickerStyles = {
  inputAndroid: {
    color: 'black',
    textAlign: 'right',
    fontSize: 14,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  inputIOS: {
    color: 'black',
    textAlign: 'right',
    fontSize: 14,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
};

export default EventDetailsScreen;