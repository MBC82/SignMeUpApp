import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from 'react-native';
import { colors } from '../theme';

const ProfileScreen = () => (
  <ImageBackground source={require('../../assets/home.jpg')} style={styles.bg} resizeMode="stretch">
    <View style={styles.center}>
      <View style={styles.tile}>
        <Text style={styles.title}>Welcome to Sign Me Up</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ImageBackground>
);

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 36 },
  tile: { backgroundColor: colors.gold, borderRadius: 14, padding: 22, alignItems: 'center', width: '100%' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: colors.blue, borderRadius: 6, paddingVertical: 16, width: '70%', alignItems: 'center', marginBottom: 14 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default ProfileScreen;
