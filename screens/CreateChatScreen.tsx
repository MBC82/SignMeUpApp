import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  StatusBar,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';
import { ChatService } from '../services/chatService';
import { ChatParticipant } from '../types/chat';
import { getAuth } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chatColors } from '../styles/chatStyles';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const CreateChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ChatParticipant[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const loadUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        }
      } catch (error) {
        console.error('Error loading username:', error);
      }
    };
    
    loadUsername();
    
    // Focus the input when the screen loads
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  }, []);

  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    if (text.length >= 2) {
      try {
        setLoading(true);
        let results;
        
        try {
          // Try to search by username first
          results = await ChatService.searchUsers(text);
        } catch (error) {
          console.log('Error searching by username, falling back to getting all users:', error);
          // Fallback to getting all users and filtering them
          results = await ChatService.getAllUsers();
          results = results.filter(user => 
            user.userName.toLowerCase().includes(text.toLowerCase())
          );
        }
        
        // Filter out current user
        const filteredResults = results.filter(user => user.userName !== username);
        setSearchResults(filteredResults);
        setLoading(false);
      } catch (error) {
        console.error('Error searching users:', error);
        setLoading(false);
        Alert.alert('Error', 'Failed to search users. Please try again.');
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectUser = (user: ChatParticipant) => {
    if (!selectedUsers.find(u => u.userId === user.userId)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchTerm('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.userId !== userId));
  };

  const handleDone = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      setLoading(true);
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'No user logged in. Please log in and try again.');
        return;
      }
      
      const participantIds = selectedUsers.map(user => user.userId);
      const chatId = await ChatService.createChat(currentUser.uid, participantIds);
      setLoading(false);
      
      // Navigate to the chat screen with the new chat ID
      navigation.navigate('Chat', { 
        eventId: chatId,
        eventName: selectedUsers.map(user => user.userName).join(', ')
      });
    } catch (error) {
      setLoading(false);
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create chat. Please try again.');
    }
  };

  return (
    <>
      <StatusBar backgroundColor="royalblue" barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <MaterialIcons name="arrow-back" size={36} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Chat</Text>
            <TouchableOpacity 
              onPress={() => {}}
              style={styles.createButton}
            >
              <Text style={styles.createButtonText}>Create Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.toContainer}>
              <Text style={styles.toLabel}>to:</Text>
              <View style={styles.searchContainer}>
                <View style={styles.selectedUsers}>
                  <FlatList
                    data={selectedUsers}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.userId}
                    renderItem={({ item }) => (
                      <View style={styles.selectedUserChip}>
                        <Text style={styles.selectedUserText}>{item.userName}</Text>
                        <TouchableOpacity onPress={() => handleRemoveUser(item.userId)}>
                          <MaterialIcons name="close" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>
                
                <TextInput
                  ref={inputRef}
                  style={styles.searchInput}
                  placeholder="Search for..."
                  placeholderTextColor="#aaa"
                  value={searchTerm}
                  onChangeText={handleSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="royalblue" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={item => item.userId}
                style={styles.searchResults}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={styles.userItem}
                    onPress={() => handleSelectUser(item)}
                  >
                    {item.userPhotoURL ? (
                      <Image source={{ uri: item.userPhotoURL }} style={styles.userPhoto} />
                    ) : (
                      <MaterialIcons name="account-circle" size={40} color="darkgray" />
                    )}
                    <Text style={styles.userName}>{item.userName}</Text>
                  </TouchableOpacity>
                )}
              />
            ) : searchTerm.length >= 2 ? (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>No users found</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerButton} onPress={() => inputRef.current?.focus()}>
              <Text style={styles.footerButtonText}>⬆</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.footerButton} onPress={() => inputRef.current?.focus()}>
              <Text style={styles.footerButtonText}>⬇</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'royalblue',
  },
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: 'royalblue',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    padding: 8,
  },
  createButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    opacity: 0.7,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
  },
  toContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toLabel: {
    fontSize: 22,
    color: 'black',
    marginRight: 10,
    fontWeight: '400',
  },
  searchContainer: {
    flex: 1,
  },
  selectedUsers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 5,
  },
  selectedUserText: {
    marginRight: 4,
    color: 'black',
  },
  searchInput: {
    color: '#666',
    fontSize: 20,
    paddingVertical: 10,
    paddingHorizontal: 0,
  },
  searchResults: {
    marginTop: 10,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  noResultsText: {
    color: '#999',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    height: 50,
    backgroundColor: '#d0d0d0',
    borderTopWidth: 1,
    borderTopColor: '#b0b0b0',
  },
  footerButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 24,
    color: '#666',
  },
  doneButton: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'royalblue',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default CreateChatScreen; 