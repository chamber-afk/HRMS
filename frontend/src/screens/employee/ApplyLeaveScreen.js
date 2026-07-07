import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { leaveApi } from '../../api/leaveApi';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/ScreenHeader'

const LEAVE_TYPES = ['sick', 'casual', 'paid', 'unpaid'];

export default function ApplyLeaveScreen({ navigation }) {
  const [type, setType] = useState('sick');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Formats a Date object into "2026-06-20" — what the backend expects
  const formatDate = date => date.toISOString().split('T')[0];

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for your leave');
      return;
    }
    const todayDateOnly = new Date();
    todayDateOnly.setHours(0, 0, 0, 0);

    const startDateOnly = new Date(startDate);
    startDateOnly.setHours(0, 0, 0, 0);

    if (startDateOnly < todayDateOnly) {
      Alert.alert('Error', 'Start date cannot be in the past');
      return;
    }

    if (endDate < startDate) {
      Alert.alert('Error', 'End date cannot be before start date');
      return;
    }

    setLoading(true);
    try {
      await leaveApi.applyLeave(
        type,
        formatDate(startDate),
        formatDate(endDate),
        reason.trim(),
      );

      Alert.alert('Success', 'Leave application submitted', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to apply for leave',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Apply for Leave" showBack={true} />
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.label}>LEAVE TYPE</Text>
        <View style={styles.typeRow}>
          {LEAVE_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.typeChip, type === t && styles.typeChipActive]}
              onPress={() => setType(t)}
            >
              <Text
                style={[
                  styles.typeChipText,
                  type === t && styles.typeChipTextActive,
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>START DATE</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(startDate)}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) setStartDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>END DATE</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.dateText}>{formatDate(endDate)}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            minimumDate={startDate}
            onChange={(event, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) setEndDate(selectedDate);
            }}
          />
        )}

        <Text style={styles.label}>REASON</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Briefly describe the reason for leave"
          placeholderTextColor={COLORS.textMuted}
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitText}>Submit Application</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: 24 },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  typeChipTextActive: { color: COLORS.white },
  dateInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 52,
    justifyContent: 'center',
  },
  dateText: { fontSize: 15, color: COLORS.textPrimary },
  textArea: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
});
