import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../api/client'; // Pakai client yang sudah disetup

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Ambil data user dari Storage / Server
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Coba ambil data user terbaru dari server
        const res = await apiClient.get('/user');
        setUser(res.data);
        // Update penyimpanan lokal
        await AsyncStorage.setItem('userData', JSON.stringify(res.data));
      } catch (error) {
        // Jika gagal (offline), ambil dari storage lokal
        const storedUser = await AsyncStorage.getItem('userData');
        if (storedUser) setUser(JSON.parse(storedUser));
      }
    };
    loadUser();
  }, []);

  // Fungsi Buka Galeri
  const pickImage = async () => {
    // Minta izin akses galeri
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Kotak
      quality: 0.5,   // Kompres dikit biar ringan
    });

    if (!result.canceled) {
      handleUpload(result.assets[0]);
    }
  };

  // Fungsi Upload ke Laravel
  const handleUpload = async (imageAsset) => {
    setUploading(true);
    
    // Siapkan Form Data (Seperti <form> HTML)
    const formData = new FormData();
    formData.append('photo', {
      uri: imageAsset.uri,
      name: 'profile.jpg',       // Nama file dummy
      type: 'image/jpeg',        // Tipe file
    });

    try {
      // Kirim POST ke route yang baru kita buat
      const response = await apiClient.post('/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Wajib untuk upload file
        },
      });

      Alert.alert("Sukses", "Foto profil berhasil diganti!");
      
      // Update tampilan user dengan foto baru (tanpa reload)
      // Asumsi Laravel mengirim balik URL foto lengkap atau path
      // Jika 'profile_photo_url' di JSON response adalah URL lengkap:
      setUser({ ...user, profile_photo_path: null, avatar_url_temp: response.data.profile_photo_url });

    } catch (error) {
      console.log(error.response?.data);
      Alert.alert("Gagal", "Gagal mengupload gambar.");
    } finally {
      setUploading(false);
    }
  };

  if (!user) return <View style={styles.center}><ActivityIndicator/></View>;

  // Logika Gambar: Prioritas Foto Baru Upload -> Foto Lama -> Inisial Nama
  const avatarSource = user.avatar_url_temp 
    ? { uri: user.avatar_url_temp }
    : user.profile_photo_path 
      ? { uri: `http://10.167.90.4:8000/storage/${user.profile_photo_path}` } // GANTI IP SESUAI CONFIG KAMU
      : { uri: `https://ui-avatars.com/api/?name=${user.name}&background=random` };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profil Saya</Text>
      </View>

      <View style={styles.content}>
        {/* Foto Profil */}
        <View style={styles.avatarContainer}>
          <Image source={avatarSource} style={styles.avatar} />
          <TouchableOpacity style={styles.cameraBtn} onPress={pickImage} disabled={uploading}>
             {uploading ? <ActivityIndicator color="#fff"/> : <Text style={styles.cameraIcon}>📷</Text>}
          </TouchableOpacity>
        </View>

        {/* Info User */}
        <View style={styles.infoContainer}>
            <Text style={styles.label}>Nama</Text>
            <Text style={styles.value}>{user.name}</Text>
            
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user.email}</Text>

            <Text style={styles.label}>Nomor HP</Text>
            <Text style={styles.value}>{user.phone_number || '-'}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => navigation.goBack()}>
            <Text style={{color:'white', fontWeight:'bold'}}>KEMBALI</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent:'center', alignItems:'center'},
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 20, backgroundColor: '#075E54', alignItems: 'center', paddingTop: 50 },
  title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20, alignItems: 'center' },
  avatarContainer: { marginTop: -50, marginBottom: 20 }, // Supaya avatar numpuk header dikit
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff' },
  cameraBtn: { 
    position: 'absolute', bottom: 0, right: 0, backgroundColor: '#25D366', 
    width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' 
  },
  cameraIcon: { fontSize: 20 },
  infoContainer: { width: '100%', marginTop: 20 },
  label: { color: 'gray', fontSize: 12, marginTop: 10 },
  value: { fontSize: 18, borderBottomWidth: 1, borderBottomColor: '#ddd', paddingBottom: 5 },
  logoutBtn: { marginTop: 40, backgroundColor: '#555', padding: 10, borderRadius: 5, width: '100%', alignItems: 'center'}
});