import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  ImageBackground,
  SafeAreaView,
  Linking,
  Modal,
} from 'react-native';
import { ProfileContext } from '../ProfileContext';
import { launchImageLibrary } from 'react-native-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import StatBox from '../components/StatBox';
import ToggleOption from '../components/ToggleOption';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EncryptedStorage from 'react-native-encrypted-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import Header from '../components/Header';
import { uploadProfileImage, getProfileImageUrl } from '../utils/firebaseStorage';

type EventDate = {
  date: string;
  signups: number;
  isTimeSlot?: boolean;
};

type RootStackParamList = {
  Home: undefined;
  EventDetails: { eventId: string };
  CreateEvent: undefined;
  MyEvents: undefined;
  ProfileSetup: undefined;
  EnhancedSignUp: {
    eventId: string;
    id: string;
    username: string;
    eventName: string;
    location: string;
    organizer: string;
    address: string;
    eventTime: string;
    neededItems: string[];
    dates: EventDate[];
    timeSlots: any[];
    bgColor: string;
    fontColor: string;
    fontSize: number;
    fontType: string;
    tileColor: string;
    textNotificationsEnabled: boolean;
    organizerPhone: string;
    emailNotificationsEnabled: boolean;
    organizerEmail: string;
    globalNote: string;
    slotLabels: Record<string, string>;
    backgroundImage: string | null;
    textShadowEnabled: boolean;
    isTimeSlot: boolean;
    isNewEvent: boolean;
    isPreview: boolean;
    showThemes: boolean;
  };
  UserProfile: {
    username?: string;
    isOwnProfile?: boolean;
  };
  EventSignUp: { eventId: string };
};

type UserProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'UserProfile'>;

const UserProfileScreen = () => {
  const { profile, updateProfile, signOut } = useContext(ProfileContext);
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const isFocused = useIsFocused();
  
  const [userStats, setUserStats] = useState({
    eventsCreated: 0,
    eventsAttended: 0,
    upcomingEvents: 0
  });

  const [preferences, setPreferences] = useState({
    language: 'English',
    notificationsEnabled: true,
    privacySettings: {
      profileVisibility: 'public'
    },
    subscription: 'free'
  });

  const [memberSince, setMemberSince] = useState<string>('');

  // Add this state for managing phone number editing
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState(profile.phone);

  // Add this state for name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(profile.name);

  const [isOwnProfile, setIsOwnProfile] = useState(true); // Default to true to show all fields

  // Add new state variables at the top with other states
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState<string>(profile.username || '');

  // Add new state variables for verification
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationModalVisible, setIsVerificationModalVisible] = useState(false);

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(profile.email);
  
  // Add missing state variables
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'phone' | 'email' | ''>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [isProfileInfoExpanded, setIsProfileInfoExpanded] = useState(true);

  const [isPremium, setIsPremium] = useState(false);
  const [isDesigner, setIsDesigner] = useState(false);

  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    if (!profile.username) {
      navigation.navigate('ProfileSetup');
      return;
    }
  }, [profile.username, navigation]);

  useEffect(() => {
    const loadMemberSince = async () => {
      try {
        // First check if the date is in the profile
        if (profile.memberSince) {
          setMemberSince(profile.memberSince);
          return;
        }
        
        // Fallback to AsyncStorage if not in profile
        const memberSinceDate = await AsyncStorage.getItem('memberSince');
        if (memberSinceDate) {
          setMemberSince(memberSinceDate);
        }
      } catch (error) {
        console.log('Error loading member since date:', error);
      }
    };
    
    loadMemberSince();
  }, [profile.memberSince]);

  useEffect(() => {
    loadUserStats();
  }, []);

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) {
          setProfileImage(savedImage);
        }
      } catch (error) {
        console.log('Error loading profile image:', error);
      }
    };

    loadProfileImage();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedImage = await AsyncStorage.getItem('profileImage');
        if (savedImage) {
          updateProfile({ profileImage: savedImage });
        }
        const username = await AsyncStorage.getItem('username');
        if (username) {
          setIsPremium(await AsyncStorage.getItem('isPremium') === 'true');
          setIsDesigner(await AsyncStorage.getItem('isDesigner') === 'true');
        }
      } catch (error) {
        console.log('Error loading user data:', error);
      }
    };

    if (isFocused) {
      loadUserData();
    }
  }, [isFocused, updateProfile]);

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      try {
        // Try getting profile from EncryptedStorage first
        const profileData = await EncryptedStorage.getItem('userProfile');
        
        if (profileData) {
          const parsedData = JSON.parse(profileData);
          setNewUsername(parsedData.username || '');
          setNewName(parsedData.name || '');
          setNewEmail(parsedData.email || '');
          setNewPhoneNumber(parsedData.phone || '');
          
          // For the profile image, try to get it from Firebase first
          const firebaseImage = await getProfileImageUrl(parsedData.username || '');
          if (firebaseImage) {
            setProfileImage(firebaseImage);
          } else if (parsedData.profileImage) {
            setProfileImage(parsedData.profileImage);
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const loadUserStats = async () => {
    try {
      const username = await EncryptedStorage.getItem('username');
      if (!username) {
        console.error('No username found');
        return;
      }

      // Get user-specific events
      const submittedEvents = JSON.parse(await AsyncStorage.getItem(`submittedEvents_${username}`) || '[]') || [];
      const eventSignups = JSON.parse(await AsyncStorage.getItem(`eventSignups_${username}`) || '{}') || {};
      
      // Calculate upcoming events
      const now = new Date();
      const upcomingEvents = submittedEvents.filter((event: any) => {
        const eventDate = new Date(event.dates?.[0]?.date); // Assuming first date is primary
        return eventDate > now;
      });

      setUserStats({
        eventsCreated: submittedEvents.length,
        eventsAttended: Object.keys(eventSignups).length,
        upcomingEvents: upcomingEvents.length
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Set default values if there's an error
      setUserStats({
        eventsCreated: 0,
        eventsAttended: 0,
        upcomingEvents: 0
      });
    }
  };

  const pickImage = async () => {
    try {
      setIsLoading(true);
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        includeBase64: false,
      });
      
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0].uri;
        
        // Update state immediately for UI feedback
        if (selectedImage) {
          setProfileImage(selectedImage);
        
          try {
            // Upload to Firebase Storage and get download URL
            const downloadUrl = await uploadProfileImage(selectedImage, profile.username || '');
            
            if (downloadUrl) {
              // Update state and encrypted storage with the download URL
              setProfileImage(downloadUrl);
              
              // Update profile in encrypted storage
              const profileData = await EncryptedStorage.getItem('userProfile');
              if (profileData) {
                const parsedData = JSON.parse(profileData);
                await EncryptedStorage.setItem('userProfile', JSON.stringify({
                  ...parsedData,
                  profileImage: downloadUrl
                }));
              }
            }
          } catch (error) {
            console.error('Error saving profile image:', error);
            Alert.alert('Error', 'Failed to save profile image. Please try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(navigation);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const updatePrivacySetting = (setting: string, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      privacySettings: {
        profileVisibility: value === 'public' ? 'public' : 'private'
      }
    }));
  };

  const handleUpgradeSubscription = () => {
    Alert.alert('Coming Soon', 'Subscription upgrade functionality will be available soon.');
  };

  const handleMessage = () => {
    if (profile.phone) {
      Linking.openURL(`sms:${profile.phone}`).catch(err => {
        Alert.alert('Error', 'Unable to open messaging app');
      });
    } else {
      Alert.alert('No Phone Number', 'This user has not provided a phone number for messaging.');
    }
  };

  const updatePreference = (key: string, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Add this function to handle phone number updates
  const handleUpdatePhone = async () => {
    try {
      const updatedProfile = {
        ...profile,
        phone: newPhoneNumber
      };
      
      await EncryptedStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      updateProfile(updatedProfile);
      setIsEditingPhone(false);
      Alert.alert('Success', 'Phone number updated successfully');
    } catch (error) {
      console.log('Error updating phone number:', error);
      Alert.alert('Error', 'Failed to update phone number');
    }
  };

  // Add this function to handle name updates
  const handleUpdateName = async () => {
    try {
      const updatedProfile = {
        ...profile,
        name: newName
      };
      
      await EncryptedStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      updateProfile(updatedProfile);
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      console.log('Error updating name:', error);
      Alert.alert('Error', 'Failed to update name');
    }
  };

  // Add search function
  const searchUsers = async (query: string) => {
    try {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      // Get all users from storage
      const allUsersString = await EncryptedStorage.getItem('allUsers');
      if (allUsersString) {
        const allUsers = JSON.parse(allUsersString);
        // Filter users based on search query and privacy settings
        const filteredUsers = allUsers.filter((user: any) => {
          const matchesSearch = 
            (user.name?.toLowerCase() || '').includes(query.toLowerCase()) ||
            (user.username?.toLowerCase() || '').includes(query.toLowerCase());
          const isPublic = user.privacySettings?.profileVisibility === 'public';
          const isNotCurrentUser = user.username !== (profile?.username || '');
          return matchesSearch && (isPublic || isNotCurrentUser);
        });
        setSearchResults(filteredUsers);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    }
  };

  // Add new handler functions
  const handleUpdateUsername = async () => {
    try {
      // Ensure newUsername is not undefined or empty
      if (!newUsername.trim()) {
        Alert.alert('Error', 'Username cannot be empty');
        return;
      }
      
      const updatedProfile = {
        ...profile,
        username: newUsername
      };
      
      await EncryptedStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      await EncryptedStorage.setItem('username', newUsername);
      updateProfile(updatedProfile);
      setIsEditingUsername(false);
      Alert.alert('Success', 'Username updated successfully');
    } catch (error) {
      console.error('Error updating username:', error);
      Alert.alert('Error', 'Failed to update username');
    }
  };

  // Add function to generate verification code
  const generateVerificationCode = (): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    return code;
  };

  // Add function to send verification code
  const sendVerificationCode = async () => {
    if (!profile) return;
    
    setIsVerifying(true);
    try {
      // Make sure we have a valid string for the destination
      let destination = '';
      
      if (verificationMethod === 'phone') {
        // Safe type handling for phone
        const phoneValue = profile.phone as string | number | undefined;
        if (typeof phoneValue === 'string') {
          destination = phoneValue;
        } else if (typeof phoneValue === 'number') {
          destination = phoneValue.toString();
        }
      } else if (verificationMethod === 'email') {
        // Safe type handling for email
        const emailValue = profile.email as string | undefined;
        if (typeof emailValue === 'string') {
          destination = emailValue;
        }
      }
        
      if (!destination) {
        Alert.alert('Error', 'No valid phone or email to send verification code');
        setIsVerifying(false);
        return;
      }
      
      // Mock implementation - in a real app, this would call an actual service
      const code = generateVerificationCode();
      console.log(`Mock verification code sent to ${destination}: ${code}`);
      
      // Simulate successful verification
      setVerificationSent(true);
      Alert.alert('Success', `Verification code sent to ${verificationMethod === 'phone' ? 'phone' : 'email'}`);
    } catch (error) {
      console.error('Error sending verification code:', error);
      Alert.alert('Error', 'Failed to send verification code');
    } finally {
      setIsVerifying(false);
    }
  };

  // Update the password section in the JSX
  const handleUpdatePassword = async () => {
    try {
      // Get the stored password for the current user
      const username = await EncryptedStorage.getItem('username');
      if (!username) {
        Alert.alert('Error', 'User information not found');
        return;
      }
      
      const storedPassword = await EncryptedStorage.getItem(`password_${username}`);
      if (currentPassword !== storedPassword) {
        Alert.alert('Error', 'Current password is incorrect');
        return;
      }
      
      await EncryptedStorage.setItem(`password_${username}`, newPassword);
      setIsEditingPassword(false);
      Alert.alert('Success', 'Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      Alert.alert('Error', 'Failed to update password');
    }
  };

  const handleUpdateEmail = async () => {
    try {
      const updatedProfile = {
        ...profile,
        email: newEmail
      };
      
      await EncryptedStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      updateProfile(updatedProfile);
      setIsEditingEmail(false);
      Alert.alert('Success', 'Email updated successfully');
    } catch (error) {
      console.error('Error updating email:', error);
      Alert.alert('Error', 'Failed to update email');
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../ios/assets/blue.jpg')}
        style={styles.background}
      >
        <ScrollView 
          style={styles.scrollViewContainer}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <TouchableOpacity onPress={pickImage} style={styles.profileImagePlaceholder}>
                  <View style={styles.defaultProfileCircle}>
                    <Text style={styles.chooseImageText}>Choose Image</Text>
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.editImageButton}
                onPress={pickImage}
              >
                <MaterialIcons name="add-a-photo" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{profile.name}</Text>
            <Text style={styles.userInfo}>Member since: {new Date(profile.memberSince).toLocaleDateString()}</Text>
          </View>

          <View style={styles.statsContainer}>
            <Text style={[styles.sectionTitle, styles.activityTitle]}>Activity</Text>
            <View style={styles.statsRow}>
              <StatBox title="Events Created" value={userStats.eventsCreated} />
              <StatBox title="Events Attended" value={userStats.eventsAttended} />
              <StatBox title="Upcoming Events" value={userStats.upcomingEvents} />
            </View>
          </View>

          {/* Profile Info Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profile Info</Text>
              <TouchableOpacity 
                onPress={() => setIsProfileInfoExpanded(!isProfileInfoExpanded)}
                style={styles.expandButton}
              >
                <MaterialIcons 
                  name={isProfileInfoExpanded ? "expand-less" : "expand-more"} 
                  size={24} 
                  color="navy" 
                />
              </TouchableOpacity>
            </View>
            
            {isProfileInfoExpanded && (
              <>
                {/* Username Field */}
                <View style={styles.infoField}>
                  <Text style={styles.fieldLabel}>Username</Text>
                  {isEditingUsername ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.input}
                        value={newUsername}
                        onChangeText={setNewUsername}
                        placeholder="Enter new username"
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity 
                          style={[styles.editButton, styles.cancelButton]}
                          onPress={() => {
                            setIsEditingUsername(false);
                            setNewUsername(profile.username || '');
                          }}
                        >
                          <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.editButton, styles.saveButton]}
                          onPress={handleUpdateUsername}
                        >
                          <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoText}>{profile.username}</Text>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => setIsEditingUsername(true)}
                      >
                        <MaterialIcons name="edit" size={24} color="#007bff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Email Field */}
                <View style={styles.infoField}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  {isEditingEmail ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.input}
                        value={newEmail}
                        onChangeText={setNewEmail}
                        placeholder="Enter new email"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity 
                          style={[styles.editButton, styles.cancelButton]}
                          onPress={() => {
                            setIsEditingEmail(false);
                            setNewEmail(profile.email || '');
                          }}
                        >
                          <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.editButton, styles.saveButton]}
                          onPress={handleUpdateEmail}
                        >
                          <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoText}>{profile.email}</Text>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => setIsEditingEmail(true)}
                      >
                        <MaterialIcons name="edit" size={24} color="#007bff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Phone Number Field */}
                <View style={styles.infoField}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  {isEditingPhone ? (
                    <View style={styles.editContainer}>
                      <TextInput
                        style={styles.input}
                        value={newPhoneNumber}
                        onChangeText={setNewPhoneNumber}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                      />
                      <View style={styles.editButtons}>
                        <TouchableOpacity 
                          style={[styles.editButton, styles.cancelButton]}
                          onPress={() => {
                            setIsEditingPhone(false);
                            setNewPhoneNumber(profile.phone || '');
                          }}
                        >
                          <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.editButton, styles.saveButton]}
                          onPress={handleUpdatePhone}
                        >
                          <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.infoContainer}>
                      <Text style={styles.infoText}>{profile.phone || 'No phone number set'}</Text>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => setIsEditingPhone(true)}
                      >
                        <MaterialIcons name="edit" size={24} color="#007bff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Privacy Setting */}
                <View style={styles.infoField}>
                  <Text style={styles.fieldLabel}>Profile Visibility</Text>
                  <ToggleOption
                    label="Public Profile"
                    value={preferences.privacySettings.profileVisibility === 'public'}
                    onToggle={(value) => updatePrivacySetting('profileVisibility', value ? 'public' : 'private')}
                  />
                </View>
              </>
            )}
          </View>

          {/* Only show these sections if it's the user's own profile */}
          {isOwnProfile && (
            <>
              {/* Subscription Status */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Subscription Status</Text>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionStatus}>
                    {preferences.subscription === 'premium' ? 'Premium Member' : 'Free Member'}
                  </Text>
                  {preferences.subscription !== 'premium' && (
                    <TouchableOpacity
                      style={styles.upgradeButton}
                      onPress={handleUpgradeSubscription}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="star" size={24} color="white" />
                        <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Find Users</Text>
                <TouchableOpacity 
                  style={styles.findUsersButton}
                  onPress={() => setShowSearchModal(true)}
                >
                  <MaterialIcons name="search" size={24} color="white" />
                  <Text style={styles.findUsersButtonText}>Search Users</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </>
          )}

          {/* User Search Modal */}
          <Modal
            visible={showSearchModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowSearchModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Search Users</Text>
                  <TouchableOpacity 
                    onPress={() => setShowSearchModal(false)}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search by name or username"
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    searchUsers(text);
                  }}
                  returnKeyType="search"
                  onSubmitEditing={() => searchUsers(searchQuery)}
                />

                <ScrollView style={styles.searchResults}>
                  {searchResults.length > 0 ? (
                    searchResults.map((user: any, index) => (
                      <TouchableOpacity 
                        key={index}
                        style={styles.userSearchResult}
                        onPress={() => {
                          setShowSearchModal(false);
                          navigation.navigate('UserProfile', { 
                            username: user.username,
                            isOwnProfile: false 
                          });
                        }}
                      >
                        <View style={styles.searchUserInfo}>
                          {user.profileImage ? (
                            <Image 
                              source={{ uri: user.profileImage }} 
                              style={styles.searchResultImage}
                            />
                          ) : (
                            <View style={styles.searchResultDefaultCircle}>
                              <MaterialIcons name="person" size={20} color="#666" />
                            </View>
                          )}
                          <Text style={styles.searchResultName}>{user.name}</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="#666" />
                      </TouchableOpacity>
                    ))
                  ) : searchQuery.length > 0 ? (
                    <View style={styles.noResultsContainer}>
                      <Text style={styles.noResultsText}>No users found</Text>
                    </View>
                  ) : null}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollViewContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 120,
  },
  scrollContent: {
    paddingBottom: 170,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'gold',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultProfileCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: 'gold',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chooseImageText: {
    fontSize: 16,
    color: 'gold',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'navy',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'gold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'navy',
    marginBottom: -5,
  },
  userInfo: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  upgradeButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  upgradeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  subscriptionStatus: {
    fontSize: 16,
    color: '#666',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 20,
    marginBottom: 40,
  },
  signOutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    minHeight: 80,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    minHeight: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'navy',
    marginBottom: 0,
    textAlign: 'center',
  },
  activityTitle: {
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 20,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  phoneEditContainer: {
    width: '100%',
    alignItems: 'center',
  },
  phoneInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    width: '80%',
    textAlign: 'center',
  },
  phoneEditButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '80%',
  },
  phoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  phoneButtonCancel: {
    backgroundColor: '#dc3545',
  },
  phoneButtonSave: {
    backgroundColor: '#28a745',
  },
  phoneButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editPhoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  editPhoneText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  messageButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  messageButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    width: '80%',
    textAlign: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    width: '80%',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    minWidth: 60,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'left',
    flex: 1,
  },
  editText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  verificationOptions: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  verificationButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '80%',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  verificationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verificationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  verificationForm: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  infoField: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
    fontWeight: '600',
  },
  searchResultDefaultCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#c0d6f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  searchResults: {
    maxHeight: '80%',
  },
  userSearchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchResultImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  searchResultName: {
    fontSize: 16,
    color: '#333',
  },
  findUsersButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  findUsersButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  expandButton: {
    padding: 5,
  },
});

export default UserProfileScreen; 