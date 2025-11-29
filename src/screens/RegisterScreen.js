import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { apiClient } from '../api/client';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      // Kirim data lengkap ke Laravel
      await apiClient.post('/register', { 
        name: name,
        email: email,
        phone_number: phoneNumber,
        password: password 
      });
      
      Alert.alert("Sukses", "Akun berhasil dibuat! Silakan Login.");
      navigation.goBack(); 
    } catch (error) {
      // Tampilkan error validasi dari Laravel jika ada
      const message = error.response?.data?.message || "Terjadi kesalahan";
      Alert.alert("Gagal", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Akun Baru</Text>
      <TextInput style={styles.input} placeholder="Nama" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none"/>
      <TextInput style={styles.input} placeholder="Nomer Telpon" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad"/>
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={[styles.btn, {backgroundColor: 'green'}]} onPress={handleRegister}>
        <Text style={styles.btnText}>DAFTAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 12 },
    btn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold' }
});