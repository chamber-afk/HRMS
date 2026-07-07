import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { leaveApi } from '../../api/leaveApi';
import { useSocket } from '../../context/SocketContext';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/ScreenHeader'

const STATUS_COLORS = {
  pending: COLORS.warning,
  approved: COLORS.success,
  rejected: COLORS.error,
};

export default function MyLeaveScreen() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { socket } = useSocket();

  const fetchLeaves = async () => {
    try {
      const response = await leaveApi.getMyLeaves();
      setLeaves(response.data.leaves);
    } catch (error) {
      console.log('Error fetching leaves:', error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleLeaveDecision = data => {
      Alert.alert('Leave Update', data.message);
      fetchLeaves();
    };

    socket.on('leave:decision', handleLeaveDecision);

    return () => {
      socket.off('leave:decision', handleLeaveDecision);
    };
  }, [socket]);

  useFocusEffect(
    useCallback(() => {
      fetchLeaves();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLeaves();
  };

  const renderLeaveCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.leaveType}>
          {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Leave
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: STATUS_COLORS[item.status] },
          ]}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <Text style={styles.dateRange}>
        {item.startDate.split('T')[0]} → {item.endDate.split('T')[0]}
      </Text>
      <Text style={styles.daysText}>{item.totalDays} day(s)</Text>
      <Text style={styles.reason}>{item.reason}</Text>

      {item.reviewNote ? (
        <Text style={styles.reviewNote}>Note: {item.reviewNote}</Text>
      ) : null}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="My Leave History" showBack={false} showDrawerMenu={false} />

      <FlatList
        data={leaves}
        keyExtractor={item => item._id}
        renderItem={renderLeaveCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No leave applications yet</Text>
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
  listContent: { padding: 24, paddingTop: 8 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  leaveType: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  dateRange: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 4 },
  daysText: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  reason: { fontSize: 14, color: COLORS.textPrimary },
  reviewNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});
