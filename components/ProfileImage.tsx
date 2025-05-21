import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadProfileImage } from '../utils/firebaseStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getProfileImage, preloadProfileImage } from '../utils/ImageUtils';

interface ProfileImageProps {
  username: string;
  currentImageUrl: string | null;
  onImageUpdate: (newImageUrl: string) => void;
  size?: number;
  showEditButton?: boolean;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({
  username,
  currentImageUrl,
  onImageUpdate,
  size = 100,
  showEditButton = false,
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      if (!username) return;
      
      try {
        setIsImageLoading(true);
        setLoadError(false);
        
        // Get the image URL with caching
        const url = await getProfileImage(username);
        if (url) {
          setImageUrl(url);
          // Preload the image for faster subsequent loads
          preloadProfileImage(url);
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
        setLoadError(true);
      } finally {
        setIsImageLoading(false);
      }
    };

    loadImage();
  }, [username]);

  const handleImageLoadStart = () => {
    setIsImageLoading(true);
    setLoadError(false);
  };

  const handleImageLoadEnd = () => {
    setIsImageLoading(false);
  };

  const handleImageLoadError = (error: any) => {
    console.error('Error loading image:', error);
    setLoadError(true);
    setIsImageLoading(false);
  };

  const handleProfileImageSelect = async () => {
    try {
      setIsLoading(true);
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 500,
        maxHeight: 500,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedImage = result.assets[0].uri;
      if (selectedImage && username) {
        // Upload to Firebase Storage
        const downloadURL = await uploadProfileImage(username, selectedImage);
        if (downloadURL) {
          setImageUrl(downloadURL);
          onImageUpdate(downloadURL);
          // Preload the new image
          preloadProfileImage(downloadURL);
        }
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to update profile image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.imageContainer, { width: size, height: size }]}>
        {(isLoading || isImageLoading) && (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loadingIndicator}
          />
        )}
        <Image
          source={
            imageUrl && !loadError
              ? { uri: imageUrl }
              : require('../assets/default-profile.png')
          }
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
            (isLoading || isImageLoading) && styles.imageLoading,
          ]}
          onLoadStart={handleImageLoadStart}
          onLoadEnd={handleImageLoadEnd}
          onError={handleImageLoadError}
        />
      </View>
      {showEditButton && (
        <TouchableOpacity
          style={[styles.editButton, { bottom: -5, right: -5 }]}
          onPress={handleProfileImageSelect}
          disabled={isLoading || isImageLoading}
        >
          <MaterialIcons name="add-a-photo" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageLoading: {
    opacity: 0.5,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 1,
  },
  editButton: {
    position: 'absolute',
    backgroundColor: 'navy',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'gold',
  },
}); 