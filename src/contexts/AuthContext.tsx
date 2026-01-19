import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { AuthService } from '../services/AuthService';
import { initDB } from '../database/init';

type AuthContextType = {
  user: any;
  isLoading: boolean;
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: any) => void; 
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

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

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';

    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

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