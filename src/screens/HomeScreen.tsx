import React from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

const HomeScreen = () => (
  <ImageBackground source={require('../../assets/home.jpg')} style={styles.bg} resizeMode="stretch" />
);

const styles = StyleSheet.create({ bg: { flex: 1, width: '100%', height: '100%' } });

export default HomeScreen;
