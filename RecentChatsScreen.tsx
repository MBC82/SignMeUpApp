import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
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
    // In a real app, you would load chats from a service
    // For now, we'll use mock data
    const mockChats: ChatItem[] = [
      // You could add mock data here if desired
    ];
    setChats(mockChats);
    setLoading(false);
  };

  const handleCreateChat = () => {
    navigation.navigate('CreateChat');
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
          {item.lastMessage}
        </Text>
      </View>
      <Text style={styles.chatTime}>
        {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chats</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleCreateChat}
          >
            <MaterialIcons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="chat-bubble-outline" size={64} color={chatColors.accent} />
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySubText}>
            Start a conversation by tapping the + button
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
    backgroundColor: chatColors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: chatColors.primary,
    borderBottomWidth: 1,
    borderBottomColor: chatColors.highlight,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: chatColors.text,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: chatColors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: chatColors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    color: '#8F9BB3',
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
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: chatColors.accent,
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
    color: chatColors.text,
    marginBottom: 4,
  },
  chatMessage: {
    fontSize: 14,
    color: '#8F9BB3',
  },
  chatTime: {
    fontSize: 12,
    color: '#8F9BB3',
    marginLeft: 10,
  },
});

export default RecentChatsScreen; 