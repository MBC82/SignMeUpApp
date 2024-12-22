import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, ImageBackground, Image, Alert } from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const CreateEventScreen: React.FC<any> = ({ route }) => {
  const {
    bgColor: customBgColor,
    fontColor: customFontColor,
    fontSize: customFontSize,
    fontType: customFontType,
    tileColor: customTileColor
  } = route.params || {};

  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState<string | null>('');
  const [organizer, setOrganizer] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<{ [key: number]: { start: string, end: string }[] }>({});
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [isEndTimePickerVisible, setEndTimePickerVisibility] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null);
  const [currentDateIndex, setCurrentDateIndex] = useState<number | null>(null);
  const [dates, setDates] = useState<Array<{ date: string | null, signups: number, notes: (string | null)[], isTimeSlot: boolean }>>([{ date: null, signups: 1, notes: [], isTimeSlot: true }]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  const navigation = useNavigation();
  const [neededItems, setNeededItems] = useState([{ id: 1, value: '' }]);

  // Profile data loaded from AsyncStorage
  const [profileData, setProfileData] = useState({
    profileImage: null,
    name: '',
    email: '',
    phone: '',
    bio: ''
  });

  // Load profile data from AsyncStorage on focus
  useFocusEffect(
    useCallback(() => {
      const loadProfileData = async () => {
        try {
          const profileImage = await AsyncStorage.getItem('profileImage');
          const name = await AsyncStorage.getItem('name');
          const email = await AsyncStorage.getItem('email');
          const phone = await AsyncStorage.getItem('phone');
          const bio = await AsyncStorage.getItem('bio');

          setProfileData({
            profileImage: profileImage || null,
            name: name || '',
            email: email || '',
            phone: phone || '',
            bio: bio || ''
          });
        } catch (error) {
          console.log('Error loading profile data:', error);
        }
      };

      loadProfileData();
    }, [])
  );

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const showTimePicker = (dateIndex: number, slotIndex: number, isEndTime = false) => {
    setCurrentSlotIndex(slotIndex);
    setCurrentDateIndex(dateIndex);
    isEndTime ? setEndTimePickerVisibility(true) : setTimePickerVisibility(true);
  };

  const handleConfirmTime = (selectedTime: Date) => {
    const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimeSlots((prev) => {
      const updatedSlots = { ...prev };
      if (!updatedSlots[currentDateIndex as number]) {
        updatedSlots[currentDateIndex as number] = [];
      }
      if (!updatedSlots[currentDateIndex as number][currentSlotIndex as number]) {
        updatedSlots[currentDateIndex as number][currentSlotIndex as number] = { start: "", end: "" };
      }
      updatedSlots[currentDateIndex as number][currentSlotIndex as number].start = formattedTime;
      return updatedSlots;
    });
    setTimePickerVisibility(false);
  };

  const handleConfirmEndTime = (selectedEndTime: Date) => {
    const formattedEndTime = selectedEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setTimeSlots((prev) => {
      const updatedSlots = { ...prev };
      if (!updatedSlots[currentDateIndex as number]) {
        updatedSlots[currentDateIndex as number] = [];
      }
      if (!updatedSlots[currentDateIndex as number][currentSlotIndex as number]) {
        updatedSlots[currentDateIndex as number][currentSlotIndex as number] = { start: "", end: "" };
      }
      updatedSlots[currentDateIndex as number][currentSlotIndex as number].end = formattedEndTime;
      return updatedSlots;
    });
    setEndTimePickerVisibility(false);
  };

  const showDatePicker = (index: number) => {
    setCurrentDateIndex(index);
    setDatePickerVisibility(true);
  };

  const handleConfirmDate = (selectedDate: Date) => {
    const newDates = [...dates];
    newDates[currentDateIndex as number].date = selectedDate.toDateString();
    setDates(newDates);
    setDatePickerVisibility(false);
  };

  const addNeededField = () => {
    setNeededItems([...neededItems, { id: neededItems.length + 1, value: '' }]);
  };

  const removeNeededField = (id: number) => {
    setNeededItems(neededItems.filter((item) => item.id !== id));
  };

  const addNote = (dateIndex: number, slotIndex: number) => {
    const updatedDates = [...dates];
    if (!updatedDates[dateIndex].notes[slotIndex]) { 
      updatedDates[dateIndex].notes[slotIndex] = ""; 
      setDates(updatedDates);
    }
  };

  const renderSlotsOrAttendees = (dateIndex: number) => {
    const slots = [];
    const signups = dates[dateIndex].signups || 1;
    for (let i = 0; i < signups; i++) {
      slots.push(
        <View key={i} style={{ marginTop: 5 }}>
          <Text style={{ fontSize: 16, marginBottom: 5 }}>{dates[dateIndex].isTimeSlot ? `Time Slot ${i + 1}` : `Attendee ${i + 1}`}:</Text>
          {dates[dateIndex].isTimeSlot ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <TouchableOpacity onPress={() => showTimePicker(dateIndex, i)} style={styles.timeBox}>
                <Text style={styles.timeText}>
                  {timeSlots[dateIndex] && timeSlots[dateIndex][i] && timeSlots[dateIndex][i].start ? timeSlots[dateIndex][i].start : "Start Time"}
                </Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 5, fontSize: 16 }}>to</Text>
              <TouchableOpacity onPress={() => showTimePicker(dateIndex, i, true)} style={styles.timeBox}>
                <Text style={styles.timeText}>
                  {timeSlots[dateIndex] && timeSlots[dateIndex][i] && timeSlots[dateIndex][i].end ? timeSlots[dateIndex][i].end : "End Time"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={{ fontSize: 16, color: 'gray', marginBottom: 10 }}>RSVP Pending</Text>
          )}
          {dates[dateIndex].notes[i] !== undefined && dates[dateIndex].notes[i] !== null && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <TextInput
                placeholder={`Note or ${dates[dateIndex].isTimeSlot ? `item to bring` : `item to bring`}`}
                value={dates[dateIndex].notes[i]}
                onChangeText={(text) => {
                  const updatedDates = [...dates];
                  updatedDates[dateIndex].notes[i] = text;
                  setDates(updatedDates);
                }}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: 'navy',
                  padding: 10,
                  fontSize: 16,
                  backgroundColor: 'white',
                  borderRadius: 5
                }}
              />
              <TouchableOpacity onPress={() => {
                const updatedDates = [...dates];
                updatedDates[dateIndex].notes[i] = null;
                setDates(updatedDates);
              }} style={{ padding: 5 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'gold' }}>X</Text>
                </TouchableOpacity>
            </View>
          )}
          {dates[dateIndex].notes[i] === undefined || dates[dateIndex].notes[i] === null ? (
            <TouchableOpacity onPress={() => addNote(dateIndex, i)} style={{ alignSelf: 'center', marginTop: 5 }}>
              <Text style={{ fontSize: 16, color: 'blue' }}>+ Add Note</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }
    return slots;
  };

  const toggleShowTimeSlots = (dateIndex) => {
    const updatedDates = [...dates];
    updatedDates[dateIndex].isTimeSlot = !updatedDates[dateIndex].isTimeSlot;
    setDates(updatedDates);
  };

  const addNewDate = () => {
    setDates([...dates, { date: null, signups: 1, notes: [], isTimeSlot: true }]);
  };

  const removeDate = (index: number) => {
    const newDates = dates.filter((_, i) => i !== index);
    setDates(newDates);
  };

 const handleCreateEvent = () => {
  navigation.navigate('SignUpScreen', {
    eventName,
    location,
    organizer,
    address, // Pass the address
    eventTime,
    neededItems, // Pass the needed items
    dates,
    timeSlots,
    notificationsEnabled,
    emailRemindersEnabled,
    phoneNumber,
    email,
    bgColor: customBgColor,
    fontColor: customFontColor,
    fontSize: customFontSize,
    fontType: customFontType,
    tileColor: customTileColor,
  });
};

  const incrementSignup = (dateIndex) => {
    const newDates = [...dates];
    newDates[dateIndex].signups += 1;
    newDates[dateIndex].notes.push(null); 
    setDates(newDates);
  };

  const decrementSignup = (dateIndex) => {
    const newDates = [...dates];
    if (newDates[dateIndex].signups > 1) {
      newDates[dateIndex].signups -= 1;
      newDates[dateIndex].notes.pop();
      setDates(newDates);
    }
  };

  const checkTimeOverlap = () => {
    for (const dateIndex in timeSlots) {
      const slots = timeSlots[dateIndex];
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const [start1, end1] = [new Date(`1970-01-01T${slots[i].start}`), new Date(`1970-01-01T${slots[i].end}`)];
          const [start2, end2] = [new Date(`1970-01-01T${slots[j].start}`), new Date(`1970-01-01T${slots[j].end}`)];
          if ((start1 < end2 && start2 < end1)) {
            Alert.alert("Time Overlap Detected", `Time slots for date ${parseInt(dateIndex) + 1} overlap.`);
            return;
          }
        }
      }
    }
  };

  useEffect(() => {
    checkTimeOverlap();
  }, [timeSlots]);

  return (
    <ImageBackground source={require('../ios/assets/navy.jpg')} style={{ flex: 1 }}>
      <ScrollView style={{ padding: 25, marginBottom: 80 }}>
        <Image
          source={require('../ios/assets/logo.jpg')}
          style={{ width: '100%', height: 215, resizeMode: 'contain', marginTop: -28, marginBottom: -35 }}
        />
        
        <TextInput
          placeholder="Event Name"
          placeholderTextColor="gray"
          value={eventName}
          onChangeText={setEventName}
          style={{ borderWidth: 1, borderColor: 'white', padding: 10, marginBottom: 18, fontSize: 18, borderRadius: 5, backgroundColor: 'white' }}
        />
        
        <TextInput
          placeholder="Location"
          placeholderTextColor="gray"
          value={location}
          onChangeText={setLocation}
          style={{ borderWidth: 1, borderColor: 'white', padding: 10, marginBottom: 8, fontSize: 18, borderRadius: 5, backgroundColor: 'white' }}
        />
        <TextInput
          placeholder="Organizer"
          placeholderTextColor="gray"
          value={organizer}
          onChangeText={setOrganizer}
          style={{ borderWidth: 1, borderColor: 'white', padding: 10, marginTop: 10, marginBottom: 8, fontSize: 18, borderRadius: 5, backgroundColor: 'white' }}
        />

        {/* Address Field with removable X */}
        {address !== null ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <TextInput
              placeholder="Address"
              placeholderTextColor="gray"
              value={address}
              onChangeText={setAddress}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: 'white',
                padding: 10,
                marginBottom: -3,
                fontSize: 18,
                backgroundColor: 'white',
                borderRadius: 5,
              }}
            />
            <TouchableOpacity onPress={() => setAddress(null)} style={{ padding: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'gold' }}>X</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setAddress('')} style={{ alignSelf: 'center', marginVertical: 10 }}>
            <Text style={{ fontSize: 18, color: 'white' }}>+ Add Address</Text>
          </TouchableOpacity>
        )}

        {/* Time Field with removable X */}
        {eventTime !== null ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <TextInput
              placeholder="Time"
              placeholderTextColor="gray"
              value={eventTime}
              onChangeText={setEventTime}
              style={{
                flex: 1,
                borderColor: 'white',
                padding: 10,
                marginBottom: 8,
                fontSize: 18,
                borderRadius: 5,
                backgroundColor: 'white',
              }}
            />
            <TouchableOpacity onPress={() => setEventTime(null)} style={{ padding: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'gold' }}>X</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEventTime('')} style={{ alignSelf: 'center', marginVertical: 10 }}>
            <Text style={{ fontSize: 18, color: 'white' }}>+ Add Time</Text>
          </TouchableOpacity>
        )}

        {neededItems.map((item) => (
          <View key={item.id} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
            <TextInput
              placeholder="What's Needed"
              placeholderTextColor="gray"
              value={item.value}
              onChangeText={(text) => {
                const newItems = neededItems.map((field) =>
                  field.id === item.id ? { ...field, value: text } : field
                );
                setNeededItems(newItems);
              }}
              style={{
                flex: 1,
                borderWidth: 1,
                marginTop: -10,
                marginBottom: 8,
                borderColor: 'white',
                padding: 10,
                marginRight: 1,
                fontSize: 18,
                backgroundColor: 'white',
                borderRadius: 5,
              }}
            />
            <TouchableOpacity onPress={() => removeNeededField(item.id)} style={{ padding: 5 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'gold' }}>X</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Conditionally render "+ Add What's Needed" button only if all fields are removed */}
        {neededItems.length === 0 && (
          <TouchableOpacity onPress={addNeededField} style={{ alignSelf: 'center', marginTop: 10, marginVertical: 16 }}>
            <Text style={{ fontSize: 18, color: 'white' }}>+ Add What's Needed</Text>
          </TouchableOpacity>
        )}

        <View style={{ borderWidth: 1, borderColor: 'white', borderRadius: 8, padding: 10, backgroundColor: 'white', marginBottom: 15 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 5, marginBottom: 10 }}>
            <Text style={{ fontSize: 18 }}>Organizer Text Notifications</Text>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: 'navy', true: 'gold' }} />
          </View>

          {notificationsEnabled && (
            <TextInput
              placeholder="Enter Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={{ borderWidth: 1, borderColor: 'navy', padding: 10, marginBottom: 10, borderRadius: 5, fontSize: 18, backgroundColor: 'white' }}
            />
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 18 }}>Organizer Email Reminders</Text>
            <Switch value={emailRemindersEnabled} onValueChange={setEmailRemindersEnabled} trackColor={{ false: 'navy', true: 'gold' }} />
          </View>

          {emailRemindersEnabled && (
            <TextInput
              placeholder="Enter Email"
              value={email}
              onChangeText={setEmail}
              style={{ borderWidth: 1, borderColor: 'navy', padding: 10, marginTop: 10, fontSize: 18, borderRadius: 5, backgroundColor: 'white' }}
            />
          )}
        </View>

        {dates.map((dateData, dateIndex) => (
          <View key={dateIndex} style={{ borderWidth: 1, borderColor: 'white', borderRadius: 8, padding: 10, marginBottom: 15, backgroundColor: 'white' }}>
            <TouchableOpacity onPress={() => showDatePicker(dateIndex)}>
              <Text style={{ fontSize: 20, color: 'blue', marginBottom: 8, textAlign: 'center', fontWeight: 'bold' }}>
                {dateData.date || "Select a Date"}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 18 }}>Show time slots</Text>
              <Switch
                value={dateData.isTimeSlot}
                onValueChange={() => toggleShowTimeSlots(dateIndex)}
                trackColor={{ false: 'navy', true: 'gold' }}
              />
            </View>

            <Text style={{ fontSize: 17, color: 'black', marginBottom: 2, textAlign: 'center' }}>
              {dateData.isTimeSlot ? "Select number of timeslots needed:" : "Select number of attendees needed:"}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
              <TouchableOpacity onPress={() => decrementSignup(dateIndex)} style={{ padding: 10, backgroundColor: 'gold', borderRadius: 5, marginRight: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>-</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>{dateData.signups}</Text>
              <TouchableOpacity onPress={() => incrementSignup(dateIndex)} style={{ padding: 10, backgroundColor: 'gold', borderRadius: 5, marginLeft: 15 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>+</Text>
              </TouchableOpacity>
            </View>

            {renderSlotsOrAttendees(dateIndex)}

            <TouchableOpacity onPress={() => removeDate(dateIndex)} style={{ alignSelf: 'flex-end', marginTop: 5 }}>
              <Text style={{ color: 'orange', fontSize: 18 }}>X</Text>
            </TouchableOpacity>

            <DateTimePickerModal
              isVisible={isTimePickerVisible}
              mode="time"
              onConfirm={handleConfirmTime}
              onCancel={() => setTimePickerVisibility(false)}
            />

            <DateTimePickerModal
              isVisible={isEndTimePickerVisible}
              mode="time"
              onConfirm={handleConfirmEndTime}
              onCancel={() => setEndTimePickerVisibility(false)}
            />

            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirmDate}
              onCancel={() => setDatePickerVisibility(false)}
            />
          </View>
        ))}

        {/* Select Another Date button */}
        <TouchableOpacity onPress={addNewDate} style={{ marginBottom: 10, borderWidth: 1, borderColor: 'white', borderRadius: 8, backgroundColor: 'white', padding: 10 }}>
          <Text style={{ color: 'blue', fontSize: 18, textAlign: 'center' }}>Select Another Date</Text>
        </TouchableOpacity>

        {/* See My Event button */}
        <View style={{ padding: 10, backgroundColor: '#ADD8E6', width: '70%', alignSelf: 'center', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 30, marginBottom: 40 }}>
          <TouchableOpacity onPress={handleCreateEvent} style={{ backgroundColor: '#ADD8E6', padding: 10, borderRadius: 5,  alignItems: 'center' }}>
            <Text style={{ color: 'navy', fontSize: 18, fontFamily: 'SF-Pro-Display-Black', fontWeight: 'regular' }}>See My Event</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar */}
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
          {profileData.profileImage ? (
            <Image source={{ uri: profileData.profileImage }} style={styles.profileImageNav} />
          ) : (
            <MaterialIcons name="account-circle" size={30} color="navy" />
          )}
          <Text style={styles.iconLabel}>My Profile</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = {
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
};

export default CreateEventScreen;