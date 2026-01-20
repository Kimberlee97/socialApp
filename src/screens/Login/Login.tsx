import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView, Platform, ScrollView,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../services/UserService';
import { styles } from './LoginStyles'; 

export default function Login() {
  const router = useRouter();
  const { login, setUser } = useAuth(); 

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. PIN Login Handler
  const handleLogin = async () => {
    if (!username || !pin) {
      return Alert.alert("Missing Info", "Please enter both Username and PIN");
    }

    setIsLoading(true);
    try {
      const success = await login(username, pin);
      
      if (!success) {
        Alert.alert("Login Failed", "Incorrect Username or PIN");
        setPin(''); 
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Biometric Login Handler
  const handleBiometricLogin = async () => {
    if (!username) {
      return Alert.alert("Username Required", "Please enter your username first so we know who to look for.");
    }

    const localExists = await UserService.isLocalUser(username);
    
    if (!localExists) {
      return Alert.alert(
        "Account Not Found", 
        "This username has not been created on this device yet."
      );
    }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return Alert.alert("Not Available", "Face ID/Touch ID is not set up on this device.");
      }

      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: `Log in as ${username}`,
        disableDeviceFallback: false, 
        cancelLabel: 'Cancel',
      });

      if (auth.success) {
        setUser({ username, pin: 'BIO_VERIFIED' }); 
      }
    } catch (error) {
      console.error("Biometric Error:", error);
      Alert.alert("Error", "An error occurred during biometric login.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <Text style={styles.title}>SocialApp</Text>
          <Text></Text>
          <Text style={styles.subtitle}>Log in</Text>
        </View>

        <Text style={styles.label}>Username</Text>
        <TextInput 
          placeholder="e.g. John Doe" 
          value={username} 
          onChangeText={setUsername} 
          autoCapitalize="none"
          style={styles.input} 
        />

        <Text style={styles.label}>PIN</Text>
        <TextInput 
          placeholder="e.g. 1234" 
          value={pin} 
          onChangeText={setPin} 
          keyboardType="numeric" 
          maxLength={4} 
          secureTextEntry 
          style={styles.input} 
        />

        <TouchableOpacity onPress={handleLogin} style={styles.mainBtn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Log In with PIN</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleBiometricLogin} style={styles.bioBtn}>
          <Ionicons name="scan-outline" size={24} color="#007AFF" />
          <Text style={styles.bioText}>Login with Face ID</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBtn}>
          <Text style={styles.linkText}>New here? Create Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}