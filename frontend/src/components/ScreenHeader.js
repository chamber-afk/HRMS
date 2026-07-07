import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { DrawerActions, useNavigation } from '@react-navigation/native'
import BackButton from './BackButton'
import { COLORS } from '../constants/colors'

export default function ScreenHeader({
  title,
  showDrawerMenu = false,   // show ☰ icon for drawer root screens
  showBack = true,          // show ← back button for stack screens
  color = COLORS.primary,   // tint color for icons and back button
  rightComponent = null,    // optional right side button (like "+ Add")
}) {
  const navigation = useNavigation()

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showDrawerMenu ? (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Text style={[styles.menuIcon, { color }]}>☰</Text>
          </TouchableOpacity>
        ) : showBack ? (
          <BackButton color={color} />
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      <View style={styles.right}>
        {rightComponent || null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  left: {
    width: 80,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  right: {
    width: 80,
    alignItems: 'flex-end',
  },
  menuButton: {
    padding: 4,
  },
  menuIcon: {
    fontSize: 22,
  },
})