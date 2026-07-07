import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Text } from 'react-native'
import EmployeeDashboard from '../screens/employee/EmployeeDashboard'
import ApplyLeaveScreen from '../screens/employee/ApplyLeaveScreen'
import MyLeaveScreen from '../screens/employee/MyLeaveScreen'
import ChatInboxScreen from '../screens/shared/ChatInboxScreen'
import ChatConversationScreen from '../screens/shared/ChatConversationScreen'
import ProfileScreen from '../screens/shared/ProfileScreen'
import { COLORS } from '../constants/colors'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={EmployeeDashboard} />
      <Stack.Screen name="ApplyLeave" component={ApplyLeaveScreen} />
    </Stack.Navigator>
  )
}

function ChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatInbox" component={ChatInboxScreen} />
      <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
    </Stack.Navigator>
  )
}

export default function EmployeeNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="MyLeave"
        component={MyLeaveScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💬</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  )
}