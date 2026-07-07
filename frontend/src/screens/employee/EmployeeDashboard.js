import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { attendanceApi } from '../../api/attendanceApi';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/ScreenHeader'

export default function EmployeeDashboard({ navigation }) {
  const { user, logout } = useAuth();
  const [todayStatus, setTodayStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Runs once when this screen first mounts
  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await attendanceApi.getTodayStatus();
      setTodayStatus(response.data);
    } catch (error) {
      console.log('Error fetching today status:', error.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleClockIn = async () => {
    setActionLoading(true);
    try {
      await attendanceApi.clockIn();
      await fetchTodayStatus(); // refresh the status after clocking in
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to clock in',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    try {
      await attendanceApi.clockOut();
      await fetchTodayStatus();
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to clock out',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Dashboard" showBack={false} showDrawerMenu={false} />
      <View style={styles.container}>
        <Text style={styles.heading}>Welcome, {user.name}</Text>
        <Text style={styles.subtext}>{user.role.toUpperCase()}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Attendance</Text>

          {loadingStatus ? (
            <ActivityIndicator
              color={COLORS.primary}
              style={{ marginVertical: 16 }}
            />
          ) : (
            <>
              <Text style={styles.statusText}>
                {todayStatus?.hasClockedIn
                  ? todayStatus?.hasClockedOut
                    ? "You have completed today's attendance"
                    : 'You are clocked in'
                  : 'You have not clocked in yet'}
              </Text>
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => navigation.navigate('ApplyLeave')}
              >
                <Text style={styles.leaveButtonText}>Apply for Leave</Text>
              </TouchableOpacity>
              {!todayStatus?.hasClockedIn && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleClockIn}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.actionButtonText}>Clock In</Text>
                  )}
                </TouchableOpacity>
              )}

              {todayStatus?.hasClockedIn && !todayStatus?.hasClockedOut && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: COLORS.error },
                  ]}
                  onPress={handleClockOut}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.actionButtonText}>Clock Out</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtext: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 4,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  leaveButtonText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
