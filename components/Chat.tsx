'use client';

import { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Clipboard,
  Alert,
  useColorScheme,
} from 'react-native';
import { getMotivation } from '../utils/api';

// Aktifkan LayoutAnimation untuk Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

export default function Chat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList<Message>>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: Date.now().toString() + '_user',
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    LayoutAnimation.easeInEaseOut();
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiReply = await getMotivation(userMessage.text, [
        ...messages,
        userMessage,
      ]);
      const aiMessage: Message = {
        id: Date.now().toString() + '_ai',
        text: aiReply,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      LayoutAnimation.easeInEaseOut();
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error fetching motivation:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        text: 'Maaf, terjadi kesalahan saat mengambil motivasi.',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      LayoutAnimation.easeInEaseOut();
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Disalin!', 'Pesan telah disalin ke clipboard.');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity
      onLongPress={() => copyToClipboard(item.text)}
      style={[
        styles.messageContainer,
        item.sender === 'user'
          ? styles.userMessageContainer
          : styles.aiMessageContainer,
      ]}
      activeOpacity={0.7}
    >
      {item.sender === 'ai' && <Text style={styles.avatar}>🧠</Text>}
      <View
        style={[
          styles.messageBubble,
          item.sender === 'user' ? styles.userBubble : styles.aiBubble,
          isDarkMode
            ? item.sender === 'user'
              ? styles.userBubbleDark
              : styles.aiBubbleDark
            : {},
        ]}
      >
        <Text style={item.sender === 'user' ? styles.userText : styles.aiText}>
          {item.text}
        </Text>
        <Text
          style={[styles.timestamp, isDarkMode ? styles.timestampDark : {}]}
        >
          {item.timestamp}
        </Text>
      </View>
      {item.sender === 'user' && <Text style={styles.avatar}>👤</Text>}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.chatContainer, isDarkMode ? styles.chatContainerDark : {}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {messages.length === 0 && (
        <View style={styles.placeholderContainer}>
          <Text
            style={[
              styles.placeholder,
              isDarkMode ? styles.placeholderDark : {},
            ]}
          >
            Mulai ngobrol dengan AI motivator kamu ✨
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
      />

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="small"
            color={isDarkMode ? '#fff' : '#0000ff'}
          />
          <Text
            style={[
              styles.loadingText,
              isDarkMode ? styles.loadingTextDark : {},
            ]}
          >
            AI sedang berpikir...
          </Text>
        </View>
      )}

      <View
        style={[
          styles.inputContainer,
          isDarkMode ? styles.inputContainerDark : {},
        ]}
      >
        <TextInput
          style={[styles.input, isDarkMode ? styles.inputDark : {}]}
          placeholder="Ceritakan perasaanmu..."
          placeholderTextColor={isDarkMode ? '#bbb' : '#999'}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton,
            isLoading ? styles.sendButtonDisabled : {},
          ]}
          disabled={isLoading}
        >
          <Text style={styles.sendButtonText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  chatContainerDark: {
    backgroundColor: '#222',
  },
  messagesList: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  avatar: {
    fontSize: 24,
    marginHorizontal: 5,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    maxWidth: '80%',
    flexDirection: 'column',
  },
  userBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 2,
  },
  aiBubble: {
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 2,
  },
  userBubbleDark: {
    backgroundColor: '#4CAF50',
  },
  aiBubbleDark: {
    backgroundColor: '#555',
  },
  userText: {
    color: '#000',
  },
  aiText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  timestampDark: {
    color: '#bbb',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f0f4f8',
  },
  inputContainerDark: {
    borderTopColor: '#333',
    backgroundColor: '#222',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 40,
    color: '#000',
  },
  inputDark: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: '#555',
  },
  loadingTextDark: {
    color: '#ccc',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholder: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
  },
  placeholderDark: {
    color: '#aaa',
  },
});
