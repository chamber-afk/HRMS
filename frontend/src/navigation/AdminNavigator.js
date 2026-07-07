import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import AdminDashboard from '../screens/admin/AdminDashboard';
import EmployeeListScreen from '../screens/shared/EmployeeListScreen';
import AddEmployeeScreen from '../screens/shared/AddEmployeeScreen';
import DepartmentScreen from '../screens/admin/DepartmentScreen';
import CustomDrawer from '../components/CustomDrawer';
import { COLORS } from '../constants/colors';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Each drawer section needs its own stack so sub-screens
// (like AddEmployee) can be pushed on top without losing the drawer
function EmployeesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="EmployeeList"
        component={EmployeeListScreen}
        initialParams={{ role: 'admin' }}
      />
      <Stack.Screen name="AddEmployee" component={AddEmployeeScreen} />
    </Stack.Navigator>
  );
}

function DepartmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DepartmentList" component={DepartmentScreen} />
    </Stack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: COLORS.roleAdmin,
        drawerInactiveTintColor: COLORS.textSecondary,
        drawerStyle: {
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '600',
        },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={AdminDashboard}
        options={{ drawerLabel: '🏠  Dashboard' }}
      />
      <Drawer.Screen
        name="Employees"
        component={EmployeesStack}
        options={{ drawerLabel: '👥  Employees' }}
      />
      <Drawer.Screen
        name="Departments"
        component={DepartmentsStack}
        options={{ drawerLabel: '🏢  Departments' }}
      />
    </Drawer.Navigator>
  );
}
