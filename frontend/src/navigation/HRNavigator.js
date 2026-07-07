import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import HRDashboard from '../screens/hr/HRDashboard';
import EmployeeListScreen from '../screens/shared/EmployeeListScreen';
import AddEmployeeScreen from '../screens/shared/AddEmployeeScreen';
import LeaveRequestsScreen from '../screens/hr/LeaveRequestsScreen';
import CustomDrawer from '../components/CustomDrawer';
import { COLORS } from '../constants/colors';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function EmployeesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="EmployeeList"
        component={EmployeeListScreen}
        initialParams={{ role: 'hr' }}
      />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
    </Stack.Navigator>
  );
}

function LeaveRequestsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="LeaveRequestsHome"
        component={LeaveRequestsScreen}
        initialParams={{ color: COLORS.roleHR }}
      />
    </Stack.Navigator>
  );
}

export default function HRNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: COLORS.roleHR,
        drawerInactiveTintColor: COLORS.textSecondary,
        drawerStyle: { width: 280 },
        drawerLabelStyle: { fontSize: 15, fontWeight: '600' },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={HRDashboard}
        options={{ drawerLabel: '🏠  Dashboard' }}
      />
      <Drawer.Screen
        name="Employees"
        component={EmployeesStack}
        options={{ drawerLabel: '👥  Employees' }}
      />
      <Drawer.Screen
        name="LeaveRequests"
        component={LeaveRequestsStack}
        options={{ drawerLabel: '📋  Leave Requests' }}
      />
    </Drawer.Navigator>
  );
}
