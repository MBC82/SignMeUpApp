import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

interface Event {
  id: string;
  name: string;
  participants: Participant[];
}

interface Participant {
  id: string;
  name: string;
}

interface ChatUserDropdownProps {
  visible: boolean;
  onClose: () => void;
  onSelectChat: (eventId: string, userId?: string) => void;
}

const ChatUserDropdown = ({ visible, onClose, onSelectChat }: ChatUserDropdownProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadEvents();
    }
  }, [visible]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const organizerId = await EncryptedStorage.getItem('userId');
      
      // Fetch events from AsyncStorage
      const eventsData = await AsyncStorage.getItem('events');
      const allEvents = eventsData ? JSON.parse(eventsData) : [];
      
      // Filter events where current user is the organizer
      const organizerEvents = allEvents.filter((event: any) => event.organizerId === organizerId);
      
      // Fetch participants for each event
      const eventsWithParticipants = await Promise.all(
        organizerEvents.map(async (event: any) => {
          const participantsData = await AsyncStorage.getItem(`event_${event.id}_participants`);
          const participants = participantsData ? JSON.parse(participantsData) : [];
          
          return {
            id: event.id,
            name: event.name,
            participants: participants.map((p: any) => ({
              id: p.userId,
              name: p.name || p.username
            }))
          };
        })
      );
      
      setEvents(eventsWithParticipants);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleEventExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  if (loading) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#4B68FF" />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerText}>New Chat</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No events found</Text>
              <Text style={styles.emptySubText}>
                Create an event to start chatting with participants
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.eventList}>
              {events.map((event) => (
                <View key={event.id} style={styles.eventContainer}>
                  <TouchableOpacity
                    style={styles.eventHeader}
                    onPress={() => toggleEventExpand(event.id)}
                  >
                    <Text style={styles.eventName}>{event.name}</Text>
                    <View style={styles.eventActions}>
                      <TouchableOpacity
                        style={styles.groupChatButton}
                        onPress={() => onSelectChat(event.id)}
                      >
                        <MaterialIcons name="groups" size={24} color="white" />
                      </TouchableOpacity>
                      <MaterialIcons
                        name={expandedEventId === event.id ? "expand-less" : "expand-more"}
                        size={24}
                        color="white"
                      />
                    </View>
                  </TouchableOpacity>

                  {expandedEventId === event.id && (
                    <View style={styles.participantsList}>
                      {event.participants.map((participant) => (
                        <TouchableOpacity
                          key={participant.id}
                          style={styles.participantItem}
                          onPress={() => onSelectChat(event.id, participant.id)}
                        >
                          <MaterialIcons name="person" size={20} color="#8F9BB3" />
                          <Text style={styles.participantName}>{participant.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A0F2C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  eventList: {
    padding: 15,
  },
  eventContainer: {
    marginBottom: 15,
    backgroundColor: 'rgba(75, 104, 255, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  groupChatButton: {
    padding: 5,
  },
  participantsList: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingLeft: 20,
    gap: 10,
  },
  participantName: {
    fontSize: 14,
    color: '#8F9BB3',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#8F9BB3',
    textAlign: 'center',
  },
});

export default ChatUserDropdown; 