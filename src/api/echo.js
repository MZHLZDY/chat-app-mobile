import Echo from 'laravel-echo';
import PusherBundle from 'pusher-js/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './client';

const PusherClient = PusherBundle.default || PusherBundle;

window.Pusher = PusherClient;

// Konfigurasi Kredensial
const PUSHER_KEY = '4986d410b1cf124ac0c8'; 
const PUSHER_CLUSTER = 'ap1'; 

export const createEcho = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');

        if (!token) console.warn("⚠️ [Echo] Token Auth kosong!");

        // Buat Instance Echo
        const echo = new Echo({
            broadcaster: 'pusher',
            key: PUSHER_KEY,
            cluster: PUSHER_CLUSTER,
            
            
            encrypted: true,
            forceTLS: true,
            
            // Endpoint Auth
            authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`, 
            
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
            
            disableStats: true, 
        });

        echo.connector.pusher.connection.bind('state_change', (states) => {
            console.log(`📡 Pusher: ${states.current}`);
        });

        echo.connector.pusher.connection.bind('connected', () => {
            console.log("✅ Pusher TERHUBUNG!");
        });

        echo.connector.pusher.connection.bind('error', (err) => {
            console.error("❌ Pusher ERROR:", err);
        });

        return echo;

    } catch (error) {
        console.error("🔥 Gagal init Echo:", error);
        throw error; 
    }
};