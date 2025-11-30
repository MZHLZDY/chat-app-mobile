import React, { useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- IMPORT LAYAR ---
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ChatListScreen from './src/screens/ChatlistScreen';
import ProfileScreen from './src/screens/ProfileScreen';
// --- IMPORT CONTEXT & API CLIENT ---
import { AuthContext } from './src/context/AuthContext';
import { apiClient } from './src/api/client'; // <--- KITA PAKAI INI SUPAYA KONEK DENGAN CHAT LIST

const Stack = createNativeStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. SETUP AUTH CONTEXT ---
  const authContext = useMemo(() => ({
    login: async (token, userData) => {
      try {
        // Simpan token ke HP
        await AsyncStorage.setItem('userToken', token);
        if (userData) {
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
        }
        
        // SUNTIKKAN TOKEN KE AXIOS (PENTING!)
        // Supaya semua request di halaman lain otomatis pakai token ini
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUserToken(token);
      } catch (e) {
        console.log("Gagal simpan login:", e);
      }
    },
    logout: async () => {
      try {
        await apiClient.post('/logout'); 
      } catch (e) {
        console.log("Server logout error (mungkin offline), tapi lanjut hapus lokal.");
      }

      // 2. Hapus data di HP (Wajib)
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        
        // Hapus header token dari axios
        delete apiClient.defaults.headers.common['Authorization'];
        
        // Update state supaya layar berganti ke Login
        setUserToken(null);
      } catch (e) {
        console.log("Gagal hapus storage:", e);
      }
    },
  }), []);

  // --- 2. CEK LOGIN SAAT APLIKASI DIBUKA ---
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Ambil token dari penyimpanan
        const token = await AsyncStorage.getItem('userToken');

        if (token) {
          // Validasi sederhana: Jika token ada, kita anggap login dulu
          // (Nanti bisa ditambah request ke /user untuk validasi ke server)
          
          // SUNTIKKAN TOKEN LAGI
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          setUserToken(token);
        }
      } catch (e) {
        console.log("Gagal memuat token:", e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  if (isLoading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" color="#075E54"/>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <StatusBar backgroundColor="#075E54" barStyle="light-content" />
        <Stack.Navigator>
          {userToken == null ? (
            // === JIKA BELUM LOGIN ===
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
          <> 
            {/* Halaman Home */}
            <Stack.Screen name="Home" component={ChatListScreen} options={{ headerShown: false }} />
            
            {/* Halaman Profile Baru */}
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}