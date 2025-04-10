import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { ChatService } from '../services/chatService';
import { getAuth } from '@react-native-firebase/auth';
import { Unsubscribe } from '@react-native-firebase/firestore';
import { initializeFirebase } from '../firebaseInit';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { chatStyles } from '../styles/chatStyles';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  timestamp: FirebaseFirestoreTypes.Timestamp;
}

interface ChatScreenProps {
  route: {
    params: {
      eventId: string;
      eventName: string;
    };
  };
  navigation: any;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ route, navigation }) => {
  const { eventId, eventName } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [currentUser, setCurrentUser] = useState(getAuth().currentUser);

  useEffect(() => {
    const setupFirebase = async () => {
      try {
        await initializeFirebase();
        setCurrentUser(getAuth().currentUser);
      } catch (error) {
        console.error('Error initializing Firebase:', error);
        setError('Failed to initialize chat service');
        setIsLoading(false);
      }
    };

    setupFirebase();
  }, []);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    const setupChat = async () => {
      try {
        if (!currentUser) {
          setError('User not authenticated');
          setIsLoading(false);
          return;
        }

        // Check if user can access chat
        const canAccess = await ChatService.canAccessChat(eventId, currentUser.uid);
        if (!canAccess) {
          setError('You do not have access to this chat');
          setIsLoading(false);
          return;
        }

        // Subscribe to messages
        unsubscribe = ChatService.subscribeToMessages(eventId, (newMessages: Message[]) => {
          setMessages(newMessages);
          // Scroll to bottom when new messages arrive
          setTimeout(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          }, 100);
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error setting up chat:', error);
        setError('Failed to load chat messages');
        setIsLoading(false);
      }
    };

    if (currentUser) {
      setupChat();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [eventId, currentUser]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    try {
      await ChatService.sendMessage(
        eventId,
        currentUser.uid,
        currentUser.displayName || 'Anonymous',
        currentUser.photoURL || undefined,
        newMessage.trim()
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.userId === currentUser?.uid;
    return (
      <View style={[
        chatStyles.messageContainer,
        isCurrentUser ? chatStyles.currentUserMessage : chatStyles.otherUserMessage
      ]}>
        <Text style={chatStyles.senderName}>{item.userName}</Text>
        <Text style={chatStyles.messageText}>{item.text}</Text>
        <Text style={chatStyles.timestamp}>
          {item.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={chatStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={chatStyles.container}>
        <Text style={chatStyles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={chatStyles.container}>
      <View style={chatStyles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={chatStyles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={chatStyles.headerTitle}>{eventName}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {messages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 10 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        ) : (
          <View style={chatStyles.loadingContainer}>
            <Text style={chatStyles.emptyMessage}>No messages yet. Start the conversation!</Text>
          </View>
        )}
        
        <View style={chatStyles.inputContainer}>
          <TextInput
            style={chatStyles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity style={chatStyles.sendButton} onPress={sendMessage} disabled={!newMessage.trim()}>
            <MaterialIcons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}; 