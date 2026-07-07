import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { leaveApi } from '../../api/leaveApi';
import ScreenHeader from '../../components/ScreenHeader';
import { COLORS } from '../../constants/colors';

const STATUS_COLORS = {
  pending: COLORS.warning,
  approved: COLORS.success,
  rejected: COLORS.error,
};

export default function LeaveRequestsScreen({ route }) {
  const accentColor = route.params?.color || COLORS.roleHR;

  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [reviewModal, setReviewModal] = useState(null); // holds the leave being reviewed
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLeaves = async status => {
    try {
      const response = await leaveApi.getAllLeaves(
        status === 'all' ? undefined : status,
      );
      setLeaves(response.data.leaves);
    } catch (error) {
      console.log('Leave requests fetch failed');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaves(filter);
    }, [filter]),
  );

  const openReviewModal = (leave, status) => {
    setReviewModal({ leave, status });
    setReviewNote('');
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    setSubmitting(true);
    try {
      await leaveApi.reviewLeave(
        reviewModal.leave._id,
        reviewModal.status,
        reviewNote.trim(),
      );
      setReviewModal(null);
      fetchLeaves(filter);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.employeeName}>
          {item.employeeId?.name || 'Unknown'}
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
      <Text style={styles.leaveType}>
        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} Leave
      </Text>
      <Text style={styles.dateRange}>
        {item.startDate.split('T')[0]} → {item.endDate.split('T')[0]} (
        {item.totalDays} day(s))
      </Text>
      <Text style={styles.reason}>{item.reason}</Text>

      {item.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.success }]}
            onPress={() => openReviewModal(item, 'approved')}
          >
            <Text style={styles.actionBtnText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.error }]}
            onPress={() => openReviewModal(item, 'rejected')}
          >
            <Text style={styles.actionBtnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Leave Requests"
        showBack={true}
        color={accentColor}
      />

      <View style={styles.filterRow}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              filter === f && {
                backgroundColor: accentColor,
                borderColor: accentColor,
              },
            ]}
            onPress={() => {
              setLoading(true);
              setFilter(f);
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && { color: COLORS.white },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No leave requests</Text>
            </View>
          }
        />
      )}

      <Modal
        visible={!!reviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {reviewModal?.status === 'approved' ? 'Approve' : 'Reject'} Leave
            </Text>
            <Text style={styles.label}>NOTE (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Add a note for the employee"
              placeholderTextColor={COLORS.textMuted}
              value={reviewNote}
              onChangeText={setReviewNote}
              multiline
            />
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: accentColor }]}
              onPress={handleReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>Confirm</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setReviewModal(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  list: { paddingHorizontal: 24, paddingBottom: 24 },
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
    marginBottom: 6,
  },
  employeeName: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  leaveType: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateRange: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  reason: { fontSize: 13, color: COLORS.textPrimary, marginBottom: 10 },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionBtnText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    fontSize: 14,
    color: COLORS.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  submitButton: {
    borderRadius: 30,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: { color: COLORS.white, fontSize: 15, fontWeight: '600' },
  cancelButton: { alignItems: 'center', marginTop: 12 },
  cancelText: { color: COLORS.textSecondary, fontSize: 14 },
});
