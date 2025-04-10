import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChatService } from '../services/chatService';
import { ChatParticipant } from '../types/chat';
import { getAuth } from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the navigation type
type RootStackParamList = {
  Home: undefined;
  Chat: { eventId: string; eventName: string };
  // Add other routes as needed
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const CreateChatScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ChatParticipant[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<ChatParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

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
  }, []);

  const handleSearch = async (text: string) => {
    setSearchTerm(text);
    if (text.length >= 2) {
      try {
        setLoading(true);
        const results = await ChatService.searchUsers(text);
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
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.userId !== userId));
  };

  const handleCreateChat = async () => {
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Chat</Text>
          <TouchableOpacity 
            onPress={handleCreateChat}
            style={[styles.createButton, { opacity: selectedUsers.length > 0 ? 1 : 0.5 }]}
            disabled={selectedUsers.length === 0 || loading}
          >
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.centeredContent}>
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
                      <MaterialIcons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={24} color="white" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                placeholderTextColor="#999"
                value={searchTerm}
                onChangeText={handleSearch}
              />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
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
                      <MaterialIcons name="account-circle" size={40} color="white" />
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
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'navy',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  container: {
    flex: 1,
    backgroundColor: 'navy',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: 'navy',
    borderBottomWidth: 1,
    borderBottomColor: '#334',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'navy',
    paddingTop: 30,
  },
  centeredContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#001133',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  createButton: {
    padding: 8,
  },
  createButtonText: {
    color: '#7af',
    fontWeight: 'bold',
  },
  selectedUsers: {
    minHeight: 50,
    marginBottom: 16,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#334',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedUserText: {
    marginRight: 4,
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#223',
    borderRadius: 25,
    padding: 8,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
    color: '#7af',
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: 'white',
    fontSize: 16,
  },
  searchResults: {
    maxHeight: 300,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334',
  },
  userPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    color: 'white',
    fontSize: 16,
  },
});

export default CreateChatScreen; 