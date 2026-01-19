import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication'; // ✅ Added
import { UserService } from '../services/UserService';

export default function SignUp() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');

  const handleSignUp = async () => {
    // 1. Basic Validation
    if (!username || pin.length !== 4) {
      return Alert.alert("Error", "Enter a username and a 4-digit PIN.");
    }

    // 2. Check if Username exists locally
    const exists = await UserService.usernameExists(username);
    if (exists) {
      return Alert.alert("Taken", "That username is already used. Try another.");
    }

    try {
      // 3. Create User in SQLite
      await UserService.createUser(username, pin);

      // 4. Biometric Setup (Preferred Feature)
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        Alert.alert(
          "Enable Biometrics",
          "Would you like to use Face ID or Fingerprint for faster login next time?",
          [
            { 
              text: "No", 
              onPress: () => router.replace('/(tabs)') 
            },
            { 
              text: "Yes, Enable", 
              onPress: async () => {
                const auth = await LocalAuthentication.authenticateAsync({
                  promptMessage: 'Confirm Biometrics to Enable',
                  fallbackLabel: 'Use PIN',
                });

                if (auth.success) {
                  Alert.alert("Success", "Biometrics enabled for this device!");
                }
                router.replace('/(tabs)');
              }
            }
          ]
        );
      } else {
        // No biometrics available, go straight to feed
        router.replace('/(tabs)');
      }
      
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not create account.");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the diary community</Text>
        </View>

        <Text style={styles.label}>Choose Username</Text>
        <TextInput 
          placeholder="Kimberlee" 
          value={username} 
          onChangeText={setUsername} 
          autoCapitalize="none"
          style={styles.input} 
        />
        
        <Text style={styles.label}>Set 4-Digit PIN</Text>
        <TextInput 
          placeholder="1234" 
          value={pin} 
          onChangeText={setPin} 
          keyboardType="numeric" 
          maxLength={4} 
          secureTextEntry 
          style={styles.input} 
        />

        <TouchableOpacity onPress={handleSignUp} style={styles.mainBtn}>
          <Text style={styles.btnText}>Sign Up & Login</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.linkBtn}>
          <Text style={styles.linkText}>Back to Login</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  subtitle: { fontSize: 16, color: '#666' },
  label: { fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#f9f9f9' },
  mainBtn: { backgroundColor: '#333', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#007AFF', fontWeight: '600' }
});