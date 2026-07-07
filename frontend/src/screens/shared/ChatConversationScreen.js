import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chatApi } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { COLORS } from '../../constants/colors';
import BackButton from '../../components/BackButton'

export default function ChatConversationScreen({ route }) {
  const { userId, userName } = route.params;
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  // Fetch existing message history when screen opens
  useEffect(() => {
    fetchConversation();
  }, []);

  // Listen for incoming real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = data => {
      const incoming = data.message;

      // Only add the message if it belongs to THIS conversation
      // The socket might receive messages from other conversations too
      const isThisConversation =
        incoming.senderId._id === userId ||
        incoming.senderId === userId ||
        incoming.receiverId._id === userId ||
        incoming.receiverId === userId;

      if (isThisConversation) {
        setMessages(prev => [...prev, incoming]);
        scrollToBottom();
      }
    };

    socket.on('chat:message', handleNewMessage);

    return () => {
      socket.off('chat:message', handleNewMessage);
    };
  }, [socket, userId]);

  const fetchConversation = async () => {
  try {
    const response = await chatApi.getConversation(userId)
    setMessages(response.data.messages)
  } catch (error) {
    console.log('Conversation fetch failed')
  } finally {
    setLoading(false)
    scrollToBottom()
  }
}

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!text.trim()) return;

    const messageText = text.trim();
    setText('');

    setSending(true);
    try {
      await chatApi.sendMessage(userId, messageText);
    } catch (error) {
      // Safely extract error message without optional chaining on error object
      let errorMessage = 'Failed to send message';
      if (
        error &&
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Error', errorMessage);
      setText(messageText);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    // Determine if this message was sent by the currently logged in user
    const senderId = item.senderId?._id || item.senderId;
    const isMe = senderId === user.id || senderId === user._id;

    return (
      <View
        style={[
          styles.messageRow,
          isMe ? styles.messageRowMe : styles.messageRowThem,
        ]}
      >
        <View
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}
        >
          <Text
            style={[
              styles.bubbleText,
              isMe ? styles.bubbleTextMe : styles.bubbleTextThem,
            ]}
          >
            {item.content}
          </Text>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

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
      <View style={styles.header}>
        <BackButton color={COLORS.primary} />
        <View style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerName}>{userName}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
            </View>
          }
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textMuted}
            value={text}
            onChangeText={setText}
            multiline
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !text.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.sendText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerAvatarText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  headerName: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  messageList: { padding: 16, paddingBottom: 8 },
  messageRow: { marginBottom: 8 },
  messageRowMe: { alignItems: 'flex-end' },
  messageRowThem: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '75%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 20 },
  bubbleTextMe: { color: COLORS.white },
  bubbleTextThem: { color: COLORS.textPrimary },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    color: 'rgba(255,255,255,0.7)',
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: { backgroundColor: COLORS.textMuted },
  sendText: { color: COLORS.white, fontWeight: '600', fontSize: 14 },
  emptyText: { fontSize: 14, color: COLORS.textMuted },
});
