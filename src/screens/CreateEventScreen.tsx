import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEvents } from '../context/EventsContext';
import { colors, cardShadow } from '../theme';

const CreateEventScreen = () => {
  const navigation = useNavigation<any>();
  const { addEvent } = useEvents();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('');

  const save = (draft: boolean) => {
    if (!name.trim()) return;
    addEvent({ name: name.trim(), location: location.trim(), organizer: organizer.trim(), draft });
    setName('');
    setLocation('');
    setOrganizer('');
    navigation.navigate('MyEvents');
  };

  return (
    <ImageBackground source={require('../../assets/navy.jpg')} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require('../../assets/logo.jpg')} style={styles.logo} />
        <View style={styles.panel}>
          <Text style={styles.title}>Event Details</Text>
          <Text style={styles.label}>Event Name</Text>
          <TextInput style={styles.input} placeholder="Enter Event Name" placeholderTextColor="#8a8ab8" value={name} onChangeText={setName} />
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} placeholder="Enter Location" placeholderTextColor="#8a8ab8" value={location} onChangeText={setLocation} />
          <Text style={styles.label}>Organizer</Text>
          <TextInput style={styles.input} placeholder="Enter Organizer" placeholderTextColor="#8a8ab8" value={organizer} onChangeText={setOrganizer} />
          {['+ Add Address', '+ Add Time', '+ Add Note to All Participants'].map(t => (
            <View key={t} style={styles.addButton}>
              <Text style={styles.addText}>{t}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.save} onPress={() => save(false)}>
            <Text style={styles.saveText}>Publish Event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.draft} onPress={() => save(true)}>
            <Text style={styles.saveText}>Save as Draft</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 25, paddingTop: 100, paddingBottom: 40 },
  logo: { width: '100%', height: 215, resizeMode: 'contain', marginTop: -28, marginBottom: -45 },
  panel: { backgroundColor: 'rgba(240,240,245,0.97)', borderRadius: 15, padding: 20, ...cardShadow },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.navy, textAlign: 'center', marginBottom: 12 },
  label: { fontSize: 16, fontWeight: '600', color: colors.navy, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: 'rgba(0,0,128,0.3)', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: 'white', marginBottom: 15, color: '#000' },
  addButton: { backgroundColor: 'rgba(253,253,253,0.95)', padding: 15, borderRadius: 15, alignItems: 'center', marginBottom: 14, ...cardShadow },
  addText: { color: colors.navy, fontSize: 16, fontWeight: '600' },
  save: { backgroundColor: colors.gold, padding: 15, borderRadius: 15, alignItems: 'center', marginTop: 6, marginBottom: 10 },
  draft: { backgroundColor: colors.gold, opacity: 0.8, padding: 15, borderRadius: 15, alignItems: 'center' },
  saveText: { color: colors.navy, fontSize: 16, fontWeight: 'bold' },
});

export default CreateEventScreen;
