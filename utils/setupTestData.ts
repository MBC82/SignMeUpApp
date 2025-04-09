import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

export const setupTestData = async () => {
  try {
    // Set up test user ID
    await EncryptedStorage.setItem('userId', 'user123');
    
    // Set up test events
    const events = [
      {
        id: '1',
        name: 'Winter Ski Trip 2024',
        organizerId: 'user123',
      },
      {
        id: '2',
        name: 'Summer Camp 2024',
        organizerId: 'user123',
      }
    ];
    await AsyncStorage.setItem('events', JSON.stringify(events));

    // Set up test participants for each event
    const event1Participants = [
      { userId: 'p1', name: 'John Smith' },
      { userId: 'p2', name: 'Sarah Johnson' }
    ];
    await AsyncStorage.setItem('event_1_participants', JSON.stringify(event1Participants));

    const event2Participants = [
      { userId: 'p3', name: 'Mike Brown' },
      { userId: 'p4', name: 'Lisa Davis' }
    ];
    await AsyncStorage.setItem('event_2_participants', JSON.stringify(event2Participants));

    console.log('Test data setup complete');
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
}; 