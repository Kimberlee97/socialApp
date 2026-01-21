/**
 * This screen handles user authentication via PIN or Biometrics.
 * It delegates data validation and database checks to the UserService,
 * focusing solely on user interaction and feedback.
 */

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
import { AuthService } from '../../services/AuthService';
import { UserService } from '../../services/UserService';
import { styles } from './LoginStyles'; 

export default function Login() {
  const router = useRouter();
  const { login } = useAuth(); 

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handles PIN login logic.
  // We pass the raw username to the Auth/User Service, trusting the 
  // Business Logic Layer to handle trimming and validation.
  const handleLogin = async () => {
    if (!username || !pin) {
      return Alert.alert("Missing Info", "Please enter both Username and PIN");
    }

    setIsLoading(true);
    try {
      // Logic Note: UserService.login() will trim the name automatically.
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

  // Handles Biometric (Face ID) login logic.
  // 1. Determines the target user (Input or previous session).
  // 2. Verifies eligibility via UserService (isLocalUser).
  // 3. Authenticates via hardware and performs auto-login.
  const handleBiometricLogin = async () => {
    try {
      let targetUser = username; 
      const savedCreds = await AuthService.getBiometricCredentials();

      if (!targetUser && savedCreds?.username) {
        targetUser = savedCreds.username;
      }

      if (!targetUser) {
        return Alert.alert("Username Required", "Please enter your username first.");
      }

      // Check Local Status: We pass raw input; UserService trims it internally.
      const isLocal = await UserService.isLocalUser(targetUser);
      
      if (!isLocal) {
        return Alert.alert(
          "Not Supported", 
          `Face ID cannot be used for "${targetUser}" because it is not a local account created on this device.`
        );
      }

      // Credential Match: We trim here locally to ensure the UI input ("John ") 
      // matches the saved credential ("John") before authorizing.
      const cleanTarget = targetUser.trim();

      if (!savedCreds || savedCreds.username.toLowerCase() !== cleanTarget.toLowerCase()) {
         return Alert.alert(
            "Setup Required", 
            `Please log in with PIN manually once for "${cleanTarget}" to enable Face ID.`
          );
      }

      // Hardware Authentication Check
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return Alert.alert("Not Available", "Face ID/Touch ID is not set up on this device.");
      }

      // Perform Biometric Scan
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: `Log in as ${cleanTarget}`,
        disableDeviceFallback: false, 
        cancelLabel: 'Cancel',
      });

      // On success, auto-login using the saved credentials
      if (auth.success) {
        setIsLoading(true);
        await login(savedCreds.username, savedCreds.pin); 
        setIsLoading(false);
      }

    } catch (error) {
      console.error("Biometric Error:", error);
      Alert.alert("Error", "An error occurred during biometric login.");
      setIsLoading(false);
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