import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './client'; 

window.Pusher = Pusher;
// GANTI DENGAN KREDENSIAL KAMU
const PUSHER_KEY = '4986d410b1cf124ac0c8'; 
const PUSHER_CLUSTER = 'ap1'; 

export const createEcho = async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        
        if (!token) console.warn("Peringatan: Token Echo kosong!");

        const echo = new Echo({
            broadcaster: 'pusher',
            key: PUSHER_KEY,
            cluster: PUSHER_CLUSTER,
            client: Pusher,
            encrypted: true,
            
            authEndpoint: `${API_BASE_URL}/api/broadcasting/auth`, 
            
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            },
        });

        return echo;

    } catch (error) {
        console.error("Gagal membuat instance Echo:", error);
        throw error;
    }
};