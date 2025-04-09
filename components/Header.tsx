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
  username, 
  hideChat = false
}) => {
  const navigation = useNavigation<NavigationProp>();
  const shouldShowChat = (isPremium || isDesigner || username === 'mbc82') && !hideChat;
  const displayUsername = username || '';

  return (
    <View style={styles.container}>
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.iconWrapper}>
            <MaterialIcons name="notifications" size={28} color="navy" />
          </View>
        </TouchableOpacity>
        {shouldShowChat && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('Chat', { eventId })}
          >
            <View style={styles.iconWrapper}>
              <MaterialIcons name="chat" size={28} color="navy" />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 150,
    backgroundColor: 'gold',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 80,
    paddingBottom: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 0,
  },
  iconButton: {
    padding: 8,
    marginBottom: -5,
  },
  iconWrapper: {
    // Removed shadow styles
  },
});

export default Header; 