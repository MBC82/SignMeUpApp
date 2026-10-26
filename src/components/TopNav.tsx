import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme';

const TopNav = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.icon}>
          <MaterialIcons name="notifications" size={28} color={colors.navy} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.icon}>
          <MaterialIcons name="chat" size={28} color={colors.navy} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000, backgroundColor: colors.gold },
  row: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 5, paddingBottom: 10 },
  icon: { padding: 8, marginBottom: -5 },
});

export default TopNav;
