import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import ChatUserDropdown from '../components/ChatUserDropdown';
import { setupTestData } from '../utils/setupTestData';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const RecentChatsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  useEffect(() => {
    setupTestData();
  }, []);

  const handleSelectChat = (eventId: string, userId?: string) => {
    setIsDropdownVisible(false);
    navigation.navigate('Chat', { 
      eventId,
      userId, // If userId is provided, it's a direct message, otherwise it's a group chat
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Recent Chats</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setIsDropdownVisible(true)}
          >
            <MaterialIcons name="add" size={28} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => {/* TODO: Implement search */}}
          >
            <MaterialIcons name="search" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.emptyContainer}>
        <MaterialIcons name="chat-bubble-outline" size={64} color="#4B68FF" />
        <Text style={styles.emptyText}>No chats yet</Text>
        <Text style={styles.emptySubText}>
          Your recent conversations will appear here
        </Text>
      </View>

      <ChatUserDropdown
        visible={isDropdownVisible}
        onClose={() => setIsDropdownVisible(false)}
        onSelectChat={handleSelectChat}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F2C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 140,
    backgroundColor: '#0A0F2C',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
    paddingBottom: 15,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 200,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#8F9BB3',
    textAlign: 'center',
  },
});

export default RecentChatsScreen; 