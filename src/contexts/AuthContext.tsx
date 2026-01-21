/**
 * This file manages the global authentication state for the application.
 * It handles database initialization, session restoration, and acts as a 
 * "Route Guard" to automatically redirect users between Login and the App 
 * based on their authentication status.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { AuthService } from '../services/AuthService';
import { initDB } from '../database/init';

// Define the shape of the Authentication Context
type AuthContextType = {
  user: any;
  isLoading: boolean;
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: any) => void; 
};

// Create the Context with default/empty values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  setUser: () => {},
});

// Main Provider Component to wrap the application
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // App Initialization: Runs once on startup to init DB and restore session
  useEffect(() => {
    const prepareApp = async () => {
      try {
        await Promise.all([
          initDB(),
          AuthService.getSession().then(setUser) 
        ]);
      } catch (e) {
        console.error("Startup failed", e);
      } finally {
        setIsLoading(false);
      }
    };
    prepareApp();
  }, []);

  // Route Protection: Redirects user based on login status
  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  // Public Auth Actions (Login/Logout)
  const login = async (username: string, pin: string) => {
    const userData = await AuthService.login(username, pin);
    if (userData) {
      setUser(userData); 
      return true;
    }
    return false;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  // Render Loading Spinner while initializing
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0095F6" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);