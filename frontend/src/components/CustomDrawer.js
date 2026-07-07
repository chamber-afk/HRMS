import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/colors';

// Role colors — each role gets a distinct color for their avatar
const ROLE_COLORS = {
  admin: '#7C3AED',
  hr: '#059669',
  manager: '#D97706',
  employee: COLORS.primary,
};

// Role labels shown under the name
const ROLE_LABELS = {
  admin: 'Administrator',
  hr: 'HR Manager',
  manager: 'Team Manager',
  employee: 'Employee',
};

export default function CustomDrawer(props) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const roleColor = ROLE_COLORS[user.role] || COLORS.primary;
  const roleLabel = ROLE_LABELS[user.role] || user.role;

  return (
    <SafeAreaView style={styles.safe}>
      {/* User info header at the top of the drawer */}
      <View style={[styles.header, { borderBottomColor: roleColor }]}>
        <View style={[styles.avatar, { backgroundColor: roleColor }]}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={[styles.role, { color: roleColor }]}>{roleLabel}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Navigation items — rendered by React Navigation automatically */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.drawerItems}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout button pinned to the bottom */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 2,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '700',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  role: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  drawerItems: {
    paddingTop: 8,
  },
  logoutButton: {
    margin: 16,
    padding: 14,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: COLORS.error,
    alignItems: 'center',
    marginBottom: 32,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: 15,
  },
});
