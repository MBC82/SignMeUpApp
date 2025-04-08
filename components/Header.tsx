import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface HeaderProps {
  eventId?: string;
  isPremium?: boolean;
  isDesigner?: boolean;
  username?: string;
  hideChat?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  eventId = 'global', 
  isPremium = false, 
  isDesigner = false, 
  username = '',
  hideChat = false
}) => {
  const navigation = useNavigation<NavigationProp>();
  const shouldShowChat = (isPremium || isDesigner || username === 'mbc82') && !hideChat;

  return (
    <View style={styles.container}>
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <MaterialIcons name="notifications" size={32} color="navy" />
        </TouchableOpacity>
        {shouldShowChat && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Chat', { params: { eventId } })}
          >
            <MaterialIcons name="chat" size={32} color="navy" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 90,
    backgroundColor: 'gold',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 0,
  },
  iconButton: {
    padding: 8,
    marginBottom: 0,
  },
});

export default Header; 