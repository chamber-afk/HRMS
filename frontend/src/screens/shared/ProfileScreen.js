import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../../context/AuthContext'
import { COLORS } from '../../constants/colors'
import ScreenHeader from '../../components/ScreenHeader'

export default function ProfileScreen() {
  const { user } = useAuth()

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="My Profile" showBack={false} showDrawerMenu={false} />
      <View style={styles.container}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user.name}</Text>

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user.role}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 24,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  value: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginTop: 4,
  },
})