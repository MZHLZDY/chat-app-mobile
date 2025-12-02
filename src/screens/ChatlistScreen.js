import React, { useEffect, useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar, 
  ActivityIndicator, Alert, Modal, TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { AuthContext } from '../context/AuthContext';
import { apiClient } from '../api/client'; // Import client axios kita

export default function ChatListScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const { logout } = useContext(AuthContext);

  // Fungsi ambil data dari Laravel
  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.log(error);
      Alert.alert("Gagal", "Tidak bisa mengambil kontak.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setMenuVisible(false); // Tutup menu dulu
    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin logout?",
      [
        { text: "Batal", style: "cancel" },
        { text: "Ya, Keluar", onPress: logout, style: 'destructive' } // Panggil fungsi logout
      ]
    );
  };

  // Jalankan saat halaman dibuka
  useEffect(() => {
    fetchUsers();
  }, []);

  // Tampilan per Kontak
  const renderItem = ({ item }) => {
    // Trik Avatar: Buat gambar dari Inisial Nama (Misal "Budi Santoso" jadi "BS")
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff`;

    return (
      <TouchableOpacity style={styles.chatItem} 
      activeOpacity={0.7}
      onPress={() => navigation.navigate('ChatRoom', { contact: item })}>
        {/* Avatar dari UI Avatars */}
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />

        <View style={styles.contentContainer}>
          <View style={styles.rowTop}>
            <Text style={styles.name}>{item.name}</Text>
            {/* Tampilkan No HP atau Email di pojok kanan */}
            <Text style={styles.time}>
                {item.phone_number ? 'Mobile' : 'Email'}
            </Text>
          </View>
          
          <View style={styles.rowBottom}>
            {/* Karena belum ada tabel chat, kita pakai placeholder */}
            <Text style={styles.message} numberOfLines={1}>
              {item.phone_number ? item.phone_number : item.email}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <ActivityIndicator size="large" color="#075E54"/>
            <Text>Memuat Kontak...</Text>
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kontak ({users.length})</Text>
        <View style={styles.headerIcons}>
           <Ionicons name="search-outline" size={24} color="white" style={styles.icon} />
           <TouchableOpacity onPress={() => setMenuVisible(true)}>
             <Ionicons name="ellipsis-vertical" size={24} color="white" style={styles.icon} />
           </TouchableOpacity>
        </View>
      </View>

      <Modal
        transparent={true}
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.menuContainer}>
              {/* Menu 1: Tambah Kontak */}
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                  setMenuVisible(false);
                  Alert.alert("Fitur", "Nanti di sini masuk ke halaman cari teman/add contact");
              }}>
                <Text style={styles.menuText}>Tambah Kontak</Text>
              </TouchableOpacity>

              {/* Menu 2: Profil */}
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Profile'); // Pindah ke layar profil
              }}>
                <Text style={styles.menuText}>Profil Saya</Text>
              </TouchableOpacity>
              
              {/* Menu 3: Logout (Opsional) */}
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={[styles.menuText, {color: 'red'}]}>Keluar (Logout)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()} // ID dari database Laravel
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 80 }}
        // Fitur tarik ke bawah untuk refresh
        onRefresh={fetchUsers}
        refreshing={loading}
        ListEmptyComponent={
            <View style={{alignItems:'center', marginTop: 50}}>
                <Text style={{color:'gray'}}>Belum ada user lain yang mendaftar.</Text>
            </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#075E54', 
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40, 
  },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row' },
  icon: { marginLeft: 15 },
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15, backgroundColor:'#ddd' },
  contentContainer: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  time: { fontSize: 12, color: '#0F9D58' },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  message: { fontSize: 14, color: 'gray', flex: 1, marginRight: 10 },
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    width: 200,
    marginTop: 50,
    marginRight: 10,
    borderRadius: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingVertical: 5,
  },
  menuItem: {
    padding: 15,
  },
  menuText: {
    fontSize: 16,
    color: 'black',
  },
});
