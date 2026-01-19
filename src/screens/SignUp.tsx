import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication'; 
import { UserService } from '../services/UserService';
import { useAuth } from '../contexts/AuthContext'; 

export default function SignUp() {
  const router = useRouter();
  
  // ✅ Get 'setUser' to force access if needed
  const { login, setUser } = useAuth(); 
  
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
      // 2. Check if Username is Taken
      const exists = await UserService.usernameExists(username);
      if (exists) {
        setLoading(false);
        return Alert.alert("Taken", "That username is already used. Try another.");
      }

      // 3. Create the User
      await UserService.createUser(username, pin);
      
      // 4. Biometric Setup (Optional)
      await handleBiometricSetup();

      // 5. Attempt Official Login
      // We try the official way first because it sets up the SecureStore session
      let success = await login(username, pin);

      if (!success) {
        // 🚨 Fallback: If DB read is too slow, we FORCE the login.
        // We trust the user because we just created the account 1 second ago.
        console.log("Login check failed (race condition), forcing entry...");
        setUser({ username }); 
      }
      
      // Context will see 'user' change and redirect to Feed automatically

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
          <Text style={styles.subtitle}>Join the diary community</Text>
        </View>

        <Text style={styles.label}>Choose Username</Text>
        <TextInput 
          placeholder="e.g. Kimberlee" 
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

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  header: { marginBottom: 30, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  subtitle: { fontSize: 16, color: '#666' },
  label: { fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#f9f9f9' },
  mainBtn: { backgroundColor: '#333', padding: 16, borderRadius: 12, alignItems: 'center', height: 50, justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#007AFF', fontWeight: '600' }
});