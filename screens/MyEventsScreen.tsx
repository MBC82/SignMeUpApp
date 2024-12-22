import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyEventsScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [draftEvents, setDraftEvents] = useState([]);
  const [submittedEvents, setSubmittedEvents] = useState([]);

  // Fetch events when the screen is focused
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const drafts = JSON.parse(await AsyncStorage.getItem('draftEvents')) || [];
        const submissions = JSON.parse(await AsyncStorage.getItem('submittedEvents')) || [];
        setDraftEvents(drafts);
        setSubmittedEvents(submissions);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (isFocused) {
      fetchEvents();
    }
  }, [isFocused]);

  // Delete a draft or submitted event
  const handleDeleteEvent = async (index, status) => {
    const events = status === 'Draft' ? draftEvents : submittedEvents;
    const updatedEvents = [...events];
    updatedEvents.splice(index, 1);

    if (status === 'Draft') {
      setDraftEvents(updatedEvents);
      await AsyncStorage.setItem('draftEvents', JSON.stringify(updatedEvents));
    } else {
      setSubmittedEvents(updatedEvents);
      await AsyncStorage.setItem('submittedEvents', JSON.stringify(updatedEvents));
    }
  };

  // Confirm delete dialog
  const confirmDelete = (index, status) => {
    Alert.alert(
      `Delete ${status} Event`,
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteEvent(index, status),
        },
      ]
    );
  };

  // Navigate to edit an event
  const handleEditEvent = (event) => {
    navigation.navigate('SignUpScreen', { ...event });
  };

  // Render a single event item
  const renderEventItem = (event, status, index) => {
    const {
      eventName,
      location,
      organizer,
      bgColor = '#FFF',
      fontSize = 16,
      fontType = 'Arial',
      backgroundImage = null,
    } = event;

    // Ensure the image source handles both URI strings and file references
    const imageSource = backgroundImage
      ? (typeof backgroundImage === 'string' ? { uri: backgroundImage } : backgroundImage)
      : null;

    return (
      <View style={styles.eventCardContainer}>
        <ImageBackground
          source={imageSource}
          style={[
            styles.eventCard,
            { backgroundColor: imageSource ? 'transparent' : bgColor },
          ]}
          imageStyle={{ borderRadius: 10 }}
        >
          <View style={styles.headerOverlay}>
            <Text
              style={[
                styles.eventTitle,
                { fontSize: fontSize + 2, fontFamily: fontType },
              ]}
            >
              {eventName}
            </Text>
            <Text
              style={[
                styles.eventDetails,
                { fontSize, fontFamily: fontType },
              ]}
            >
              Location: {location}
            </Text>
            <Text
              style={[
                styles.eventDetails,
                { fontSize, fontFamily: fontType },
              ]}
            >
              Organizer: {organizer}
            </Text>
            <Text
              style={[
                styles.eventStatus,
                { fontSize, fontFamily: fontType },
              ]}
            >
              Status: {status}
            </Text>
          </View>
          <View style={styles.draftActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditEvent(event)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDelete(index, status)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../ios/assets/blue.jpg')}
      style={styles.background}
      resizeMode="stretch"
    >
      <View style={styles.content}>
        <Text style={styles.title}>My Events</Text>

        {/* Submitted Events */}
        <Text style={styles.subTitle}>Submitted Events</Text>
        <FlatList
          data={submittedEvents}
          renderItem={({ item, index }) => renderEventItem(item, 'Submitted', index)}
          keyExtractor={(item, index) => `submitted-${index}`}
          ListEmptyComponent={
            <Text style={styles.emptyMessage}>No submitted events found.</Text>
          }
        />

        {/* Draft Events */}
        <Text style={styles.subTitle}>Draft Events</Text>
        <FlatList
          data={draftEvents}
          renderItem={({ item, index }) => renderEventItem(item, 'Draft', index)}
          keyExtractor={(item, index) => `draft-${index}`}
          ListEmptyComponent={
            <Text style={styles.emptyMessage}>No draft events found.</Text>
          }
        />
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate('HomeScreen')}
          style={styles.navButton}
        >
          <MaterialIcons name="home" size={30} color="navy" />
          <Text style={styles.iconLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('MyEventsScreen')}
          style={styles.navButton}
        >
          <MaterialIcons name="calendar-today" size={30} color="navy" />
          <Text style={styles.iconLabel}>My Events</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('CreateEventScreen')}
          style={styles.navButton}
        >
          <MaterialIcons name="event" size={30} color="navy" />
          <Text style={styles.iconLabel}>Create Event</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('ProfileSetupScreen')} style={styles.navButton}>
  <MaterialIcons name="account-circle" size={30} color="navy" />
  <Text style={styles.iconLabel}>Profile</Text>
</TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    padding: 16,
  },
  title: {
    fontSize: 36,
    marginTop: 60,
    alignSelf: 'center',
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 18,
    alignSelf: 'center',
    fontWeight: '600',
    color: 'gold',
    marginTop: 8,
  },
  eventCardContainer: {
    marginVertical: 8,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#000',
  },
  eventCard: {
    padding: 16,
    borderRadius: 10,
  },
  headerOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 5,
    width: '78%',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 5,
  },
  eventTitle: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  eventDetails: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  eventStatus: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  draftActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: 'gold',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: 'navy',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyMessage: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 16,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 80,
    backgroundColor: 'gold',
    paddingBottom: 10,
  },
  navButton: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    color: 'navy',
    fontSize: 12,
    marginTop: 2,
  },
});

export default MyEventsScreen;