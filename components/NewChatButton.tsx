import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const NewChatButton = () => {
  const navigation = useNavigation<NavigationProp>();

  const handlePress = () => {
    console.log('NewChatButton pressed');
    try {
      // Show an alert before navigating
      Alert.alert(
        'Create New Chat',
        'Do you want to create a new chat?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Yes, Create Chat',
            onPress: () => {
              console.log('Confirmed, navigating to CreateChat');
              // Add a slight delay before navigating
              setTimeout(() => {
                console.log('Executing delayed navigation');
                navigation.navigate('CreateChat');
              }, 300);
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error in NewChatButton:', error);
      Alert.alert('Error', 'Failed to navigate to create chat screen.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <MaterialIcons name="add" size={40} color="white" />
        <Text style={styles.buttonText}>New Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    zIndex: 1000,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'royalblue',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
});

export default NewChatButton; 