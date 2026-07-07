import React from 'react'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { createStackNavigator } from '@react-navigation/stack'
import ManagerDashboard from '../screens/manager/ManagerDashboard'
import MyTeamScreen from '../screens/manager/MyTeamScreen'
import LeaveRequestsScreen from '../screens/hr/LeaveRequestsScreen'
import CustomDrawer from '../components/CustomDrawer'
import { COLORS } from '../constants/colors'

const Drawer = createDrawerNavigator()
const Stack = createStackNavigator()

function MyTeamStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyTeamHome" component={MyTeamScreen} />
    </Stack.Navigator>
  )
}

function TeamLeavesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeamLeavesHome" component={LeaveRequestsScreen} initialParams={{ color: COLORS.roleManager }} />
    </Stack.Navigator>
  )
}

export default function ManagerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: COLORS.roleManager,
        drawerInactiveTintColor: COLORS.textSecondary,
        drawerStyle: { width: 280 },
        drawerLabelStyle: { fontSize: 15, fontWeight: '600' },
      }}
    >
      <Drawer.Screen name="Dashboard" component={ManagerDashboard} options={{ drawerLabel: '🏠  Dashboard' }} />
      <Drawer.Screen name="MyTeam" component={MyTeamStack} options={{ drawerLabel: '👥  My Team' }} />
      <Drawer.Screen name="TeamLeaves" component={TeamLeavesStack} options={{ drawerLabel: '📋  Team Leaves' }} />
    </Drawer.Navigator>
  )
}