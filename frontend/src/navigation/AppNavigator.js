import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { View, ActivityIndicator } from 'react-native'
import { useAuth } from '../context/AuthContext'
import { COLORS } from '../constants/colors'
import LoginScreen from '../screens/auth/LoginScreen'
import EmployeeNavigator from './EmployeeNavigator'
import AdminNavigator from './AdminNavigator'
import HRNavigator from './HRNavigator'
import ManagerNavigator from './ManagerNavigator'

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {!user ? (
        <LoginScreen />
      ) : user.role === 'admin' ? (
        <AdminNavigator />
      ) : user.role === 'hr' ? (
        <HRNavigator />
      ) : user.role === 'manager' ? (
        <ManagerNavigator />
      ) : (
        <EmployeeNavigator />
      )}
    </NavigationContainer>
  )
}