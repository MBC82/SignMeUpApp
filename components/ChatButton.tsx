import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
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
      onPress={() => navigation.navigate('Chat', { eventId })}
    >
      <View style={styles.iconWrapper}>
        <MaterialIcons name="chat" size={32} color="#FFD700" />
      </View>
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
  },
  iconWrapper: {
    shadowColor: 'navy',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 3,
  },
});

export default ChatButton; 