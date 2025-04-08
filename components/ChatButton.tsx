import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ChatButtonProps {
  eventId: string;
  isPremium?: boolean;
  isDesigner?: boolean;
  username?: string;
}

const ChatButton: React.FC<ChatButtonProps> = ({ eventId, isPremium, isDesigner, username }) => {
  const navigation = useNavigation<NavigationProp>();

  // Show chat button if user is premium/designer or is the developer
  const shouldShowChat = isPremium || isDesigner || username === 'mbc82';

  if (!shouldShowChat) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.chatButtonContainer}
      onPress={() => navigation.navigate('Chat', { params: { eventId } })}
    >
      <MaterialIcons name="chat" size={32} color="navy" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 30,
    backgroundColor: 'gold',
    padding: 12,
    borderRadius: 30,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default ChatButton; 