/**
 * This screen handles the user registration process.
 * It validates input constraints (e.g. 4-digit PIN) and coordinates 
 * with the UserService to create new accounts and setup initial security preferences.
 */

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
import { styles } from './SignUpStyles'; 

export default function SignUp() {
  const router = useRouter();
  const { setUser } = useAuth(); 
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  // Handles the core registration flow:
  // 1. Validates that the username is not empty and PIN is exactly 4 digits.
  // 2. Checks against the database (via Service) to ensure username uniqueness.
  // 3. Creates the user and prompts for optional Biometric setup.
  const handleSignUp = async () => {
    // UI Validation: We check trim() here just to ensure we don't send 
    // a blank "   " string to the backend.
    if (!username.trim() || pin.length !== 4) {
      return Alert.alert("Missing Info", "Please enter a username and a 4-digit PIN.");
    }

    setLoading(true);

    try {
      // Check Uniqueness: The Service layer will handle the precise data comparison.
      const exists = await UserService.usernameExists(username);
      if (exists) {
        setLoading(false);
        return Alert.alert("Taken", "That username is already used. Try another.");
      }

      // Create Account: UserService sanitizes the input before insertion.
      await UserService.createUser(username, pin);
      
      // Optional: Setup Face ID immediately after creation for better UX
      await handleBiometricSetup();

      // Auto-Login: Updates the global session so the user doesn't have to sign in again.
      console.log("User created, logging in directly...");
      setUser({ username: username.trim() }); 
      
    } catch (error) {
      console.error("Signup Error:", error);
      setLoading(false);
      Alert.alert("Error", "Could not create account. Please try again.");
    }
  };

  // Prompts the user to enable biometric login (Face ID / Touch ID).
  // This is a UI-only flow that verifies hardware support before asking permission.
  const handleBiometricSetup = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      return new Promise<void>((resolve) => {
        Alert.alert(
          "Enable Biometrics",
          "Would you like to use Face ID for faster login?",
          [
            { text: "No", style: "cancel", onPress: () => resolve() },
            { 
              text: "Yes, Enable", 
              onPress: async () => {
                await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm to Enable' });
                resolve();
              }
            }
          ]
        );
      });
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
        </View>

        <Text style={styles.label}>Choose Username</Text>
        <TextInput 
          placeholder="e.g. John" 
          value={username} 
          onChangeText={setUsername} 
          autoCapitalize="none"
          style={styles.input} 
        />
        
        <Text style={styles.label}>Set 4-Digit PIN</Text>
        <TextInput 
          placeholder="e.g. 1234" 
          value={pin} 
          onChangeText={setPin} 
          keyboardType="numeric" 
          maxLength={4} 
          secureTextEntry 
          style={styles.input} 
        />

        <TouchableOpacity onPress={handleSignUp} style={styles.mainBtn} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Sign Up & Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}