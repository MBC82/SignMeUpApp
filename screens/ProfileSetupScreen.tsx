import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import EncryptedStorage from 'react-native-encrypted-storage'; // For secure password storage
import { useNavigation } from '@react-navigation/native';
import { ProfileContext } from '../ProfileContext'; // Import Profile Context

const ProfileSetupScreen = () => {
  const navigation = useNavigation();
  const { profile, updateProfile } = useContext(ProfileContext); // Access ProfileContext

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    loadProfile();
  }, [navigation]);

  const [name, setName] = useState(profile.name || '');
  const [username, setUsername] = useState(profile.username || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for toggling password visibility
  const [email, setEmail] = useState(profile.email || '');
  const [phone, setPhone] = useState(profile.phone || '');
  const [profileImage, setProfileImage] = useState(profile.profileImage || '');
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(false);

  const loadProfile = async () => {
    try {
      const storedUsername = await EncryptedStorage.getItem('username');
      const storedPassword = await EncryptedStorage.getItem('password');
      const userProfile = await EncryptedStorage.getItem('userProfile');
      if (storedUsername && storedPassword && userProfile) {
        setIsLoginMode(true);
        const parsedProfile = JSON.parse(userProfile);
        setName(parsedProfile.name);
        setEmail(parsedProfile.email);
        setPhone(parsedProfile.phone);
        setProfileImage(parsedProfile.profileImage);
        updateProfile(parsedProfile); // Update context
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 300,
        maxHeight: 300,
        quality: 0.5,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          setProfileImage(response.assets[0].uri);
        }
      }
    );
  };

  const handleSaveProfile = async () => {
    if (!name || !username || !password || !email) {
      Alert.alert('Missing Information', 'Please fill out all required fields.');
      return;
    }

    try {
      const newProfile = { name, username, email, phone, profileImage };
      await EncryptedStorage.setItem('username', username);
      await EncryptedStorage.setItem('password', password);
      await EncryptedStorage.setItem('userProfile', JSON.stringify(newProfile));
      setIsSignedIn(true);
      setIsLoginMode(false);
      updateProfile(newProfile); // Update context
      Alert.alert('Profile Saved', 'Your profile has been successfully updated.');
    } catch (error) {
      console.log('Error saving profile data:', error);
      Alert.alert('Error', 'Failed to save profile data.');
    }
  };

  const handleLogin = async () => {
    try {
      const storedUsername = await EncryptedStorage.getItem('username');
      const storedPassword = await EncryptedStorage.getItem('password');
      if (username === storedUsername && password === storedPassword) {
        setIsSignedIn(true);
        setIsLoginMode(false);
        const userProfile = await EncryptedStorage.getItem('userProfile');
        if (userProfile) {
          const parsedProfile = JSON.parse(userProfile);
          setName(parsedProfile.name);
          setEmail(parsedProfile.email);
          setPhone(parsedProfile.phone);
          setProfileImage(parsedProfile.profileImage);
          updateProfile(parsedProfile); // Update context
        }
        Alert.alert('Welcome Back', 'You have successfully logged in.');
      } else {
        Alert.alert('Invalid Credentials', 'The username or password is incorrect.');
      }
    } catch (error) {
      console.log('Error during login:', error);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const storedUsername = await EncryptedStorage.getItem('username');
      if (!storedUsername) {
        Alert.alert('No User Found', 'No account is associated with this app.');
        return;
      }
      Alert.alert(
        'Password Reset',
        'Your password has been reset. Use the temporary password: "temp1234" to log in.',
        [{ text: 'OK' }]
      );
      await EncryptedStorage.setItem('password', 'temp1234'); // Reset to temporary password
    } catch (error) {
      console.log('Error resetting password:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await EncryptedStorage.clear();
      setName('');
      setUsername('');
      setPassword('');
      setEmail('');
      setPhone('');
      setProfileImage('');
      setIsSignedIn(false);
      setIsLoginMode(true);
      updateProfile({}); // Clear context
      Alert.alert('Signed Out', 'You have successfully signed out.');
    } catch (error) {
      console.log('Error signing out:', error);
    }
  };

  return (
    <ImageBackground source={require('../ios/assets/navy.jpg')} style={styles.background}>
      <View style={styles.container}>
        {isSignedIn ? (
          <>
            <Text style={styles.headerText}>Profile Setup</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.profileImage} />
              ) : (
                <Text style={styles.imagePlaceholderText}>+ Add Profile Image</Text>
              )}
            </TouchableOpacity>
            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // Toggles visibility
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
            <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.headerText}>{isLoginMode ? 'Login' : 'Sign Up'}</Text>
            <TextInput
              placeholder="Name"
              placeholderTextColor="gray"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              placeholder="Username"
              placeholderTextColor="gray"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
            />
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="gray"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // Toggles visibility
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Email"
              placeholderTextColor="gray"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              placeholder="Phone Number"
              placeholderTextColor="gray"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.input}
            />
                        <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>
                {isLoginMode ? 'Log In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
            {isLoginMode ? (
              <>
                <TouchableOpacity onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setIsLoginMode(false)}>
                  <Text style={styles.switchModeText}>Don't have an account? Sign Up</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => setIsLoginMode(true)}>
                  <Text style={styles.switchModeText}>
                    Already have an account? Log In
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </View>
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.navButton}>
          <MaterialIcons name="home" size={30} color="navy" />
          <Text style={styles.iconLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('MyEventsScreen')}
          style={styles.navButton}
        >
          <MaterialIcons name="calendar-today" size={30} color="navy" />
          <Text style={styles.iconLabel}>My Events</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateEventScreen')}
          style={styles.navButton}
        >
          <MaterialIcons name="event" size={30} color="navy" />
          <Text style={styles.iconLabel}>Create Event</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileSetupScreen')}
          style={styles.navButton}
        >
          <MaterialIcons name="account-circle" size={30} color="navy" />
          <Text style={styles.iconLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(240, 240, 240, 0.9)',
    marginTop: 50,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imagePicker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e1e1e1',
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  imagePlaceholderText: {
    color: '#888',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    padding: 10,
  },
  toggleButton: {
    padding: 10,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signOutButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInButton: {
    backgroundColor: 'green',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  switchModeText: {
    color: '#007bff',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: 80,
    backgroundColor: 'gold',
    paddingBottom: 10,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    color: 'navy',
    fontSize: 12,
    marginTop: 2,
  },
});

export default ProfileSetupScreen;
