import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, 
  ImageBackground, Image, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { apiClient } from '../api/client';
import { createEcho } from '../api/echo';

export default function ChatRoomScreen({ route, navigation }) {
  const { contact } = route.params; 

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [myId, setMyId] = useState(null);
  const flatListRef = useRef();

  // 1. Ambil ID & Pesan Lama
  useEffect(() => {
    const initData = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) setMyId(JSON.parse(userData).id);

      try {
        const res = await apiClient.get(`/messages/${contact.id}`);
        setMessages(res.data);
      } catch (error) {
        console.log("Gagal ambil pesan:", error);
      }
    };
    initData();
  }, []);

  // 2. Setup Realtime
  useEffect(() => {
    let echoInstance;
    let channelName;

    const setupRealtime = async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      const currentUserId = user.id;

      try {
        echoInstance = await createEcho();

        // Logic Channel
        const ids = [currentUserId, contact.id].sort((a, b) => a - b);
        channelName = `chat.${ids[0]}.${ids[1]}`;
        console.log("Listening to channel:", channelName);

        echoInstance.join(channelName)
          .here((users) => {
              console.log("User online:", users);
          })
          .listen('.MessageSent', (e) => { 
            console.log("EVENT MASUK:", e);
            const incomingMessage = e.message; 

            if (incomingMessage.sender_id === currentUserId) {
                return; 
            }

            setMessages((prev) => {
                const exists = prev.find(m => m.id === incomingMessage.id);
                if (exists) return prev;
                
                return [...prev, incomingMessage];
            });
            
            setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        })
          .error((err) => {
              console.log("Echo Error:", err);
          });
      } catch (err) {
        console.log("Gagal connect Echo:", err);
      }
    };

    setupRealtime();

    return () => {
      if (echoInstance) {
        if (channelName) {
            echoInstance.leave(channelName);
        }
        echoInstance.disconnect();
        console.log("Echo disconnected");
      }
    };
  }, [contact.id]);
  
  // Fungsi Kirim Pesan
  const handleSend = async () => {
    if (text.trim() === '') return;

    const tempId = 'temp-' + Math.random().toString();
    
    const tempMsg = {
      id: tempId, 
      message: text,
      sender_id: myId,
      receiver_id: contact.id,
      created_at: new Date().toISOString(),
      is_pending: true,
    };

    setMessages(prev => [...prev, tempMsg]);
    setText('');
    
    try {
      const response = await apiClient.post('/messages', {
        receiver_id: contact.id,
        message: tempMsg.message
      });
      
      setMessages(prev => prev.map(msg => {
          if (msg.id === tempId) {
              return response.data;
          }
          return msg;
      }));

    } catch (error) {
      console.log("Gagal kirim:", error);
    }
  };

  const renderItem = ({ item }) => {
    const isMe = item.sender_id === myId;
    const messageContent = item.message || item.text || "";
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
        <Text style={styles.msgText}>{messageContent}</Text>
        <Text style={styles.timeText}>
          {item.created_at ? new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
        </Text>
      </View>
    );
  };

  return (
    <ImageBackground 
      source={{uri: 'https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d2ea11e.jpg'}} 
      style={{flex: 1}}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
           <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image 
           source={{uri: `https://ui-avatars.com/api/?name=${contact.name}`}} 
           style={styles.avatar} 
        />
        <Text style={styles.headerName}>{contact.name}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{padding: 10}}
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.input} 
            value={text} 
            onChangeText={setText} 
            placeholder="Ketik pesan..." 
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingTop: 40, backgroundColor: '#075E54' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 10 },
  headerName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  bubble: { padding: 10, borderRadius: 10, marginBottom: 5, maxWidth: '80%' },
  bubbleRight: { alignSelf: 'flex-end', backgroundColor: '#E2FFC7' },
  bubbleLeft: { alignSelf: 'flex-start', backgroundColor: 'white' },
  msgText: { fontSize: 16 },
  timeText: { fontSize: 10, alignSelf: 'flex-end', color: 'gray' },
  inputContainer: { flexDirection: 'row', padding: 10, alignItems: 'center' },
  input: { flex: 1, backgroundColor: 'white', borderRadius: 20, padding: 10, marginRight: 10 },
  sendBtn: { backgroundColor: '#075E54', padding: 10, borderRadius: 25 }
});