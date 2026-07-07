import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { chatApi } from '../../api/chatApi';
import { COLORS } from '../../constants/colors';
import ScreenHeader from '../../components/ScreenHeader'

export default function ChatInboxScreen({ navigation }) {
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInbox = async () => {
    try {
      const response = await chatApi.getInbox();
      console.log('INBOX RESPONSE:', JSON.stringify(response.data))
      setInbox(response.data.inbox);
    } catch (error) {
      console.log('Inbox error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Refresh every time this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchInbox();
    }, []),
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() =>
        navigation.navigate('ChatConversation', {
          // Pass the other user's details to the conversation screen
          userId: item.user._id,
          userName: item.user.name,
        })
      }
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.user.name.charAt(0).toUpperCase()}
        </Text>
      </View>

      <View style={styles.rowContent}>
        <View style={styles.rowHeader}>
          <Text style={styles.name}>{item.user.name}</Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage.content}
        </Text>
      </View>
    </TouchableOpacity>
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
      <ScreenHeader title="Messages" showBack={false} showDrawerMenu={false} />
      <FlatList
        data={inbox}
        keyExtractor={item => item.user._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No conversations yet</Text>
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
  list: { paddingHorizontal: 24, paddingTop: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
  rowContent: { flex: 1 },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  lastMessage: { fontSize: 13, color: COLORS.textSecondary, marginTop: 3 },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  unreadText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});
