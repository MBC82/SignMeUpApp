import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme';

const items: Record<string, { label: string; icon: string }> = {
  Home: { label: 'Home', icon: 'home' },
  MyEvents: { label: 'My Events', icon: 'calendar-today' },
  CreateEvent: { label: 'Create Event', icon: 'event' },
  Profile: { label: 'My Profile', icon: 'account-circle' },
};

const BottomBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.map((route, index) => {
        const item = items[route.name];
        const focused = state.index === index;
        return (
          <TouchableOpacity
            key={route.key}
            style={styles.button}
            onPress={() => navigation.navigate(route.name)}
          >
            <MaterialIcons name={item.icon} size={30} color={colors.navy} style={{ opacity: focused ? 1 : 0.7 }} />
            <Text style={[styles.label, focused && styles.labelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.gold, paddingTop: 10 },
  button: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.navy, fontSize: 12, marginTop: 2 },
  labelActive: { fontWeight: '700' },
});

export default BottomBar;
