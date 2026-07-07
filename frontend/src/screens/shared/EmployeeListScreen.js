import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { employeeApi } from '../../api/employeeApi';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/ScreenHeader'

const ROLE_COLORS = {
  admin: COLORS.roleAdmin,
  hr: COLORS.roleHR,
  manager: COLORS.roleManager,
  employee: COLORS.roleEmployee,
};

export default function EmployeeListScreen({ navigation, route }) {
  const isAdmin = route.params?.role === 'admin';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const fetchEmployees = async searchText => {
    try {
      const response = await employeeApi.getAllEmployees(searchText);
      setEmployees(response.data.employees);
    } catch (error) {
      console.log('Employee list fetch failed');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEmployees('');
    }, []),
  );

  const handleSearch = text => {
    setSearch(text);
    setSearching(true);
    // Debounce — wait 500ms after user stops typing before firing request
    clearTimeout(global.searchTimeout);
    global.searchTimeout = setTimeout(() => {
      fetchEmployees(text);
    }, 500);
  };

  const handleDeactivate = employee => {
    Alert.alert(
      'Deactivate Employee',
      `Are you sure you want to deactivate ${employee.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            try {
              await employeeApi.deactivateEmployee(employee._id);
              fetchEmployees(search);
            } catch (error) {
              Alert.alert('Error', 'Failed to deactivate employee');
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: ROLE_COLORS[item.role] || COLORS.primary },
          ]}
        >
          <Text style={styles.avatarText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.email}>{item.email}</Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: ROLE_COLORS[item.role] + '20' },
            ]}
          >
            <Text style={[styles.roleText, { color: ROLE_COLORS[item.role] }]}>
              {item.role.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {isAdmin && item.role !== 'admin' && (
        <TouchableOpacity
          style={styles.deactivateBtn}
          onPress={() => handleDeactivate(item)}
        >
          <Text style={styles.deactivateBtnText}>Deactivate</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.roleAdmin} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Employees"
        showDrawerMenu={true}
        showBack={false}
        color={COLORS.roleAdmin}
        rightComponent={
          isAdmin ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddEmployee')}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or email..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={handleSearch}
        />
        {searching && (
          <ActivityIndicator
            size="small"
            color={COLORS.primary}
            style={{ marginLeft: 8 }}
          />
        )}
      </View>

      <FlatList
        data={employees}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No employees found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  addButton: {
    backgroundColor: COLORS.roleAdmin,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 44,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  list: { paddingHorizontal: 24, paddingTop: 4 },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  email: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  roleText: { fontSize: 10, fontWeight: '700' },
  deactivateBtn: {
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deactivateBtnText: { color: COLORS.error, fontSize: 11, fontWeight: '600' },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});
