import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { employeeApi } from '../../api/employeeApi';
import { departmentApi } from '../../api/departmentApi';
import { leaveApi } from '../../api/leaveApi';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/ScreenHeader'

export default function AdminDashboard({ navigation }) {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);
  //const navigation = useNavigation();

  const fetchStats = async () => {
    try {
      // Fire all three requests at once instead of one after another
      // Promise.all waits for all of them, but they run in parallel —
      // faster than awaiting each one sequentially
      const [employeesRes, departmentsRes, leavesRes] = await Promise.all([
        employeeApi.getAllEmployees(),
        departmentApi.getAllDepartments(),
        leaveApi.getAllLeaves('pending'),
      ]);

      setStats({
        totalEmployees: employeesRes.data.count,
        totalDepartments: departmentsRes.data.count,
        pendingLeaves: leavesRes.data.count,
      });
    } catch (error) {
      console.log('Dashboard stats fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, []),
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
        title="Admin Panel"
        showDrawerMenu={true}
        showBack={false}
        color={COLORS.roleAdmin}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Admin Overview</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: COLORS.roleAdmin }]}>
            <Text style={styles.statNumber}>{stats.totalEmployees}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: COLORS.info }]}>
            <Text style={styles.statNumber}>{stats.totalDepartments}</Text>
            <Text style={styles.statLabel}>Departments</Text>
          </View>
          <View style={[styles.statCard, { borderTopColor: COLORS.warning }]}>
            <Text style={styles.statNumber}>{stats.pendingLeaves}</Text>
            <Text style={styles.statLabel}>Pending Leaves</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Employees')}
        >
          <Text style={styles.actionText}>Manage Employees</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Departments')}
        >
          <Text style={styles.actionText}>Manage Departments</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 24 },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 3,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 10,
  },
  actionText: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  actionArrow: { fontSize: 18, color: COLORS.roleAdmin },
});
