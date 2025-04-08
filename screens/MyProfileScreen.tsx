import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const MyProfileScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.chatButtonContainer}
        onPress={() => navigation.navigate('Chat', { params: { eventId: 'profile' } })}
      >
        <MaterialIcons name="chat" size={32} color="navy" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  chatButtonContainer: {
    position: 'absolute',
    top: 80,
    right: 30,
    backgroundColor: 'gold',
    padding: 8,
    borderRadius: 20,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
 