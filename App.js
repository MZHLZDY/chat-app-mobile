import React, { useState, useEffect, useMemo } from 'react';
import { View, ActivityIndicator, Text, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens yang sudah dibuat
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
// Auth Context untuk state global
import { AuthContext } from './src/context/AuthContext';

// --- Placeholder Halaman Home (Nanti kita ganti jadi ChatList) ---
function HomeScreen({ navigation }) {
    const { logout } = React.useContext(AuthContext);
    return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
            <Text>Selamat Datang di Chat App!</Text>
            <Button title="Logout" onPress={logout} />
        </View>
    );
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi-fungsi Auth Global
  const authContext = useMemo(() => ({
    login: async (token, userData) => {
      // Simpan token di memori HP
      await AsyncStorage.setItem('userToken', token); 
      // Simpan user data (opsional)
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUserToken(token);
    },
    logout: async () => {
      await AsyncStorage.removeItem('userToken');
      setUserToken(null);
    },
  }), []);

  // Cek Login saat aplikasi dibuka
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setUserToken(token);
        }
      } catch (e) {
        console.log("Gagal load token");
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  if (isLoading) {
    return <View style={{flex:1, justifyContent:'center'}}><ActivityIndicator size="large"/></View>;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {userToken == null ? (
            // === STACK BELUM LOGIN ===
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            // === STACK SUDAH LOGIN ===
            <Stack.Screen name="Home" component={HomeScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}