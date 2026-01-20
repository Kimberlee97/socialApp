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

  const handleSignUp = async () => {
    // 1. Validation
    if (!username || pin.length !== 4) {
      return Alert.alert("Missing Info", "Please enter a username and a 4-digit PIN.");
    }

    setLoading(true);

    try {
      // 2. Check if Username is Taken (Read)
      const exists = await UserService.usernameExists(username);
      if (exists) {
        setLoading(false);
        return Alert.alert("Taken", "That username is already used. Try another.");
      }

      // 3. Create the User (Write)
      await UserService.createUser(username, pin);
      
      // 4. Biometric Setup (Optional)
      await handleBiometricSetup();

      // 5. DIRECT LOGIN (Optimized)
      console.log("User created, logging in directly...");
      setUser({ username }); 
      
    } catch (error) {
      console.error("Signup Error:", error);
      setLoading(false);
      Alert.alert("Error", "Could not create account. Please try again.");
    }
  };

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