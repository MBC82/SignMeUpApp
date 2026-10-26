import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useEvents } from '../context/EventsContext';
import { colors, cardShadow } from '../theme';

const MyEventsScreen = () => {
  const navigation = useNavigation<any>();
  const { events, removeEvent } = useEvents();

  return (
    <ImageBackground source={require('../../assets/blue.jpg')} style={styles.bg}>
      {events.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>You have no events yet</Text>
          <TouchableOpacity style={styles.pill} onPress={() => navigation.navigate('CreateEvent')}>
            <Text style={styles.pillText}>Create Event</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {events.map(e => (
            <View key={e.id} style={styles.card}>
              <View style={[styles.badge, e.draft && { backgroundColor: colors.gold }]}>
                <Text style={[styles.badgeText, e.draft && { color: colors.navy }]}>{e.draft ? 'DRAFT' : 'LIVE'}</Text>
              </View>
              <View style={styles.tile}>
                <Text style={styles.name}>{e.name}</Text>
                <Text style={styles.detail}>Location: {e.location}</Text>
                <Text style={styles.detail}>Organizer: {e.organizer}</Text>
              </View>
              <View style={styles.actions}>
                <View style={[styles.action, { backgroundColor: colors.green }]}>
                  <MaterialIcons name="visibility" size={24} color="white" />
                </View>
                <View style={[styles.action, { backgroundColor: colors.gold }]}>
                  <MaterialIcons name="edit" size={24} color={colors.navy} />
                </View>
                <TouchableOpacity style={[styles.action, { backgroundColor: colors.red }]} onPress={() => removeEvent(e.id)}>
                  <MaterialIcons name="delete" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#fff', fontSize: 20, marginBottom: 24 },
  pill: { backgroundColor: colors.gold, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 30 },
  pillText: { color: colors.navy, fontSize: 18, fontWeight: 'bold' },
  list: { padding: 16, paddingTop: 110, paddingBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16, ...cardShadow },
  badge: { position: 'absolute', top: 8, right: 8, zIndex: 2, backgroundColor: colors.red, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  tile: { backgroundColor: 'rgba(255,215,0,0.25)', borderRadius: 8, padding: 12 },
  name: { fontSize: 18, fontWeight: 'bold', color: '#000', marginBottom: 6 },
  detail: { fontSize: 14, color: '#000', marginBottom: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  action: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
});

export default MyEventsScreen;
