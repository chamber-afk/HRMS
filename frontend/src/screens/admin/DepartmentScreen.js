import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { departmentApi } from '../../api/departmentApi';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/ScreenHeader'

export default function DepartmentScreen() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAllDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.log('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDepartments();
    }, []),
  );

  const handleCreate = async () => {
    if (!newDeptName.trim()) {
      Alert.alert('Error', 'Department name is required');
      return;
    }

    setSaving(true);
    try {
      await departmentApi.createDepartment(
        newDeptName.trim(),
        newDeptDesc.trim(),
      );
      setModalVisible(false);
      setNewDeptName('');
      setNewDeptDesc('');
      fetchDepartments();
    } catch (error) {
      Alert.alert('Error', 'Failed to create department');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.deptName}>{item.name}</Text>
      </View>
      {item.description ? (
        <Text style={styles.deptDesc}>{item.description}</Text>
      ) : null}
      {item.managerId ? (
        <Text style={styles.managerText}>Manager: {item.managerId.name}</Text>
      ) : (
        <Text style={styles.noManager}>No manager assigned</Text>
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
        title="Departments"
        showDrawerMenu={true}
        showBack={false}
        color={COLORS.roleAdmin}
        rightComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        }
      />

      <FlatList
        data={departments}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No departments yet</Text>
          </View>
        }
      />

      {/* Modal for creating a new department */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Department</Text>

            <Text style={styles.label}>NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Engineering"
              placeholderTextColor={COLORS.textMuted}
              value={newDeptName}
              onChangeText={setNewDeptName}
            />

            <Text style={styles.label}>DESCRIPTION (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description"
              placeholderTextColor={COLORS.textMuted}
              value={newDeptDesc}
              onChangeText={setNewDeptDesc}
            />

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreate}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitText}>Create</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
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
  addButton: {
    backgroundColor: COLORS.roleAdmin,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
  list: { paddingHorizontal: 24, paddingTop: 4 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  deptName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  deptDesc: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 6 },
  managerText: { fontSize: 12, color: COLORS.roleAdmin, fontWeight: '500' },
  noManager: { fontSize: 12, color: COLORS.textMuted },
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
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  submitButton: {
    backgroundColor: COLORS.roleAdmin,
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
