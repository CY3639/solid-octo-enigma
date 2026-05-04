import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  login: async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    // store the token securely
    await SecureStore.setItemAsync('jwt', data.token);
    return data;
  },

  register: async (username, password, isPharmacist = false) => {
    const { data } = await api.post('/auth/register', { username, password, isPharmacist });
    return data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('jwt');
  },

  getToken: async () => {
    return await SecureStore.getItemAsync('jwt');
  },

  // decode the JWT payload to get user info (role, username, etc...) without a network call.
  // JWTs are base64 encoded, not encrypted.

  decodeToken: (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch {
      return null;
    }
  },
};