import axios from 'axios';

export const API_BASE_URL = 'http://10.167.90.4:8000'; 

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});