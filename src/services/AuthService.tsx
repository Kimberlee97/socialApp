import * as SecureStore from 'expo-secure-store';
import usersData from '../../assets/data/users.json'; 

const SESSION_KEY = 'user_session';

export const AuthService = {
  
  async login(username: string, pin: string) {
    const user = usersData.users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.pin === pin
    );

    if (user) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  async getSession() {
    try {
      const jsonValue = await SecureStore.getItemAsync(SESSION_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("Secure Store Error", e);
      return null;
    }
  },

  async logout() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
};