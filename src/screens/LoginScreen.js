import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { apiClient } from '../api/client';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if(!identifier || !password) {
        Alert.alert("Error", "Mohon isi data login");
        return;
    }

    setLoading(true);
    try {
      const payload = {
        login: identifier, 
        password: password
      };

      // Jika controller Laravel Anda tetap meminta key 'email', ganti payload di atas jadi:
      // const payload = { email: identifier, password: password };

      const response = await apiClient.post('/login', payload);
      
      login(response.data.token, response.data.user);
      
    } catch (error) {
      console.log(error.response);
      Alert.alert("Login Gagal", error.response?.data?.message || "Cek email/no.hp dan password Anda");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat App Login</Text>
      
      {/* Input ini sekarang menerima teks bebas (Email / Username / No HP) */}
      <TextInput 
        style={styles.input} 
        placeholder="Email, Username, atau No. HP" 
        value={identifier} 
        onChangeText={setIdentifier} 
        autoCapitalize="none" 
      />
      
      <TextInput 
        style={styles.input} 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>MASUK</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{marginTop: 20}}>
        <Text style={{color: 'blue'}}>Belum punya akun? Daftar</Text>
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