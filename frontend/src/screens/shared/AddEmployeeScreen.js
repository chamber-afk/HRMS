import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authApi } from '../../api/authApi';
import { departmentApi } from '../../api/departmentApi';
import { employeeApi } from '../../api/employeeApi';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/ScreenHeader';

const ROLES = ['employee', 'manager', 'hr'];

export default function AddEmployeeScreen({ navigation, route }) {
  const editEmployee = route.params?.employee || null;
  const isEditing = !!editEmployee;

  const [name, setName] = useState(editEmployee?.name || '');
  const [email, setEmail] = useState(editEmployee?.email || '');
  const [role, setRole] = useState(editEmployee?.role || 'employee');
  const [salary, setSalary] = useState(editEmployee?.salary?.toString() || '');
  const [departmentId, setDepartmentId] = useState(
    editEmployee?.department?._id || '',
  );
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await departmentApi.getAllDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.log('Failed to load departments');
    } finally {
      setLoadingDepts(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Name and email are required');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await employeeApi.updateEmployee(editEmployee._id, {
          name: name.trim(),
          role,
          salary: Number(salary),
          department: departmentId || null,
        });
        Alert.alert('Success', 'Employee updated', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await authApi.createEmployee({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role,
          salary: Number(salary),
          department: departmentId || null,
        });
        Alert.alert('Success', 'Employee created. Credentials sent to email.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={isEditing ? 'Edit Employee' : 'Add Employee'}
        showBack={true}
        color={COLORS.roleAdmin}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>NAME</Text>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
        />

        {!isEditing && (
          <>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="name@company.com"
              placeholderTextColor={COLORS.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </>
        )}

        <Text style={styles.label}>ROLE</Text>
        <View style={styles.chipRow}>
          {ROLES.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, role === r && styles.chipActive]}
              onPress={() => setRole(r)}
            >
              <Text
                style={[styles.chipText, role === r && styles.chipTextActive]}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>SALARY</Text>
        <TextInput
          style={styles.input}
          placeholder="Monthly salary"
          placeholderTextColor={COLORS.textMuted}
          value={salary}
          onChangeText={setSalary}
          keyboardType="numeric"
        />

        <Text style={styles.label}>DEPARTMENT</Text>
        {loadingDepts ? (
          <ActivityIndicator color={COLORS.roleAdmin} />
        ) : (
          <View style={styles.chipRow}>
            <TouchableOpacity
              style={[styles.chip, !departmentId && styles.chipActive]}
              onPress={() => setDepartmentId('')}
            >
              <Text
                style={[
                  styles.chipText,
                  !departmentId && styles.chipTextActive,
                ]}
              >
                None
              </Text>
            </TouchableOpacity>
            {departments.map(d => (
              <TouchableOpacity
                key={d._id}
                style={[
                  styles.chip,
                  departmentId === d._id && styles.chipActive,
                ]}
                onPress={() => setDepartmentId(d._id)}
              >
                <Text
                  style={[
                    styles.chipText,
                    departmentId === d._id && styles.chipTextActive,
                  ]}
                >
                  {d.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitText}>
              {isEditing ? 'Update Employee' : 'Create Employee'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
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
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  chipActive: {
    backgroundColor: COLORS.roleAdmin,
    borderColor: COLORS.roleAdmin,
  },
  chipText: { fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  chipTextActive: { color: COLORS.white },
  submitButton: {
    backgroundColor: COLORS.roleAdmin,
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  submitText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  cancelButton: { alignItems: 'center', marginTop: 16, marginBottom: 8 },
  cancelText: { color: COLORS.textSecondary, fontSize: 14 },
});
