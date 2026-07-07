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
import { leaveApi } from '../../api/leaveApi';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/colors';

export default function HRDashboard({ navigation }) {
  const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [employeesRes, leavesRes] = await Promise.all([
        employeeApi.getAllEmployees(),
        leaveApi.getAllLeaves('pending'),
      ]);
      setStats({
        totalEmployees: employeesRes.data.count,
        pendingLeaves: leavesRes.data.count,
      });
    } catch (error) {
      console.log('HR dashboard stats fetch failed');
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
          <ActivityIndicator size="large" color={COLORS.roleHR} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="HR Panel"
        showDrawerMenu={true}
        color={COLORS.roleHR}
      />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>HR Overview</Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderTopColor: COLORS.roleHR }]}>
            <Text style={styles.statNumber}>{stats.totalEmployees}</Text>
            <Text style={styles.statLabel}>Employees</Text>
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
          <Text style={[styles.actionArrow, { color: COLORS.roleHR }]}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('LeaveRequests')}
        >
          <Text style={styles.actionText}>Review Leave Requests</Text>
          <Text style={[styles.actionArrow, { color: COLORS.roleHR }]}>→</Text>
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
  actionArrow: { fontSize: 18 },
});
