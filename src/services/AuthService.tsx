/**
 * This service manages the "Session" state of the application.
 * It uses the device's SecureStore (Encrypted Storage) to persist login data,
 * allowing users to stay logged in between app restarts and enabling 
 * Face ID to retrieve credentials securely.
 */

import * as SecureStore from 'expo-secure-store';
import { UserService } from './UserService'; 

const SESSION_KEY = 'user_session';
const BIOMETRIC_KEY = 'biometric_credentials'; 

export const AuthService = {
  
  // Authenticates the user via the UserService.
  // If successful, it performs two critical storage operations:
  // 1. Saves the session (so the user stays logged in next time they open the app).
  // 2. Updates the Biometric Credentials (so Face ID has the latest PIN to use).
  async login(username: string, pin: string) {
    const user = await UserService.login(username, pin);
    if (user) {
      await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));

      await SecureStore.setItemAsync(BIOMETRIC_KEY, JSON.stringify({ username, pin }));
      
      return user;
    }
    return null;
  },

  // Retrieves the active user session from SecureStore on app startup.
  // This allows the app to skip the Login screen if the user never logged out.
  async getSession() {
    try {
      const jsonValue = await SecureStore.getItemAsync(SESSION_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.error("Secure Store Error", e);
      return null;
    }
  },

  // Clears the active session key, effectively logging the user out.
  // Note: We do NOT clear the BIOMETRIC_KEY here, so the user can still 
  // use Face ID to log back in quickly next time.
  async logout() {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  },

  // Retrieves the encrypted credentials needed for Face ID login.
  // This is called by Login.tsx only AFTER a successful biometric scan.
  async getBiometricCredentials() {
    const jsonValue = await SecureStore.getItemAsync(BIOMETRIC_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  }
};