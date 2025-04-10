import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { chatColors } from '../styles/chatStyles';
import { ChatService } from '../services/chatService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  isGroup: boolean;
}

const RecentChatsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    loadUserData();
    const unsubscribe = navigation.addListener('focus', () => {
      loadChats();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername) {
        setUsername(storedUsername);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadChats = async () => {
    setLoading(true);
    try {
      // Try to load chats from Firebase
      const userChats = await ChatService.getUserChats();
      setChats(userChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      // Fallback to mock data
      const mockChats: ChatItem[] = [
        // You could add mock data here if desired
      ];
      setChats(mockChats);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = (chat: ChatItem) => {
    navigation.navigate('Chat', {
      eventId: chat.id,
      eventName: chat.name
    });
  };

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleSelectChat(item)}
    >
      <View style={styles.chatAvatar}>
        <MaterialIcons 
          name={item.isGroup ? "group" : "person"} 
          size={24} 
          color="white" 
        />
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.name}</Text>
        <Text style={styles.chatMessage} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
      <Text style={styles.chatTime}>
        {item.timestamp && item.timestamp.toLocaleTimeString ? 
          item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chats</Text>
      </View>

      {/* Floating Action Button positioned over header */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          navigation.navigate('CreateChat');
        }}
      >
        <MaterialIcons name="add" size={36} color="navy" />
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="royalblue" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={80} color="#B0B0B0" />
          <Text style={styles.emptyText}>Start a Conversation</Text>
          <Text style={styles.emptySubText}>
            Tap the + button to chat with others
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 120,
    backgroundColor: 'royalblue',
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -150,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  chatList: {
    padding: 10,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'royalblue',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 14,
    color: '#999',
  },
  chatTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  fab: {
    position: 'absolute',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    top: 115,  // Changed from 110 to 115 to move it down slightly
    backgroundColor: '#FFD700', // Gold color
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'navy',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    zIndex: 999,
  }
});

export default RecentChatsScreen; 