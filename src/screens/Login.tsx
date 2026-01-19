/*
import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication'; 
import { Ionicons } from '@expo/vector-icons'; 
import { UserService } from '../services/UserService';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');

  const handleLogin = async () => {
    if (!username || !pin) {
      return Alert.alert("Missing Info", "Please enter both Username and PIN");
    }

    const isValid = await UserService.login(username, pin);
    if (isValid) {
      router.replace('/(tabs)');
    } else {
      Alert.alert("Login Failed", "Incorrect Username or PIN");
      setPin(''); 
    }
  };

  const handleBiometricLogin = async () => {
    if (!username) {
    return Alert.alert("Username Required", "Please enter your username first.");
  }

  const localExists = await UserService.isLocalUser(username);
  
  if (!localExists) {
    return Alert.alert(
      "Biometrics Disabled", 
      "Face ID is only available for accounts created on this device. Please use your PIN for this account."
    );
  }

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      console.log("--- Biometric Debug ---");
      console.log("Hardware Supported:", hasHardware);
      console.log("User Enrolled:", isEnrolled);

      if (!hasHardware) {
        return Alert.alert("Not Supported", "This device does not support biometrics.");
      }
      if (!isEnrolled) {
        return Alert.alert("Not Enrolled", "Please set up Face ID/Touch ID in your phone settings.");
      }

      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: `Log in as ${username}`,
        disableDeviceFallback: false, 
        cancelLabel: 'Cancel',
      });

      if (auth.success) {
        router.replace('/(tabs)');
      } else {
        console.log("Authentication result:", auth);
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
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Log in to access your diary</Text>
        </View>

        <Text style={styles.label}>Username</Text>
        <TextInput 
          placeholder="e.g. Kimberlee" 
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

        <TouchableOpacity onPress={handleLogin} style={styles.mainBtn}>
          <Text style={styles.btnText}>Log In with PIN</Text>
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

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  subtitle: { fontSize: 16, color: '#666' },
  label: { fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#f9f9f9' },
  mainBtn: { backgroundColor: '#333', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  bioBtn: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#007AFF', 
    borderRadius: 12, 
    backgroundColor: '#f0f9ff' 
  },
  bioText: { color: '#007AFF', marginLeft: 10, fontWeight: '600', fontSize: 16 },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#007AFF', fontWeight: 'bold' }
});
*/

import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator 
} from 'react-native';
import { useRouter } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication'; 
import { Ionicons } from '@expo/vector-icons'; 
import { UserService } from '../services/UserService';
import { useAuth } from '../contexts/AuthContext'; 

export default function Login() {
  const router = useRouter();
  
  // ✅ Use the Context Hook
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
      // 🚀 Call the Context. It returns true/false.
      // If true, the Context's useEffect will automatically redirect to (tabs).
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

    // A. Verify user exists locally (Business Layer Check)
    const localExists = await UserService.isLocalUser(username);
    
    if (!localExists) {
      return Alert.alert(
        "Account Not Found", 
        "This username has not been created on this device yet."
      );
    }

    try {
      // B. Check Hardware
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return Alert.alert("Not Available", "Face ID/Touch ID is not set up on this device.");
      }

      // C. Prompt the User
      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: `Log in as ${username}`,
        disableDeviceFallback: false, 
        cancelLabel: 'Cancel',
      });

      if (auth.success) {
        // ✅ SECURITY: Biometrics passed, so we trust this is the user.
        // We manually update the global state to let them in.
        setUser({ username, pin: 'BIO_VERIFIED' }); 
        
        // Context will see "user" is set and redirect automatically.
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
          <Text style={styles.title}>Welcome</Text>
          <Text style={styles.subtitle}>Log in to access your diary</Text>
        </View>

        {/* Username Input */}
        <Text style={styles.label}>Username</Text>
        <TextInput 
          placeholder="e.g. Kimberlee" 
          value={username} 
          onChangeText={setUsername} 
          autoCapitalize="none"
          style={styles.input} 
        />

        {/* PIN Input */}
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

        {/* Login Button */}
        <TouchableOpacity onPress={handleLogin} style={styles.mainBtn} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Log In with PIN</Text>
          )}
        </TouchableOpacity>

        {/* Biometric Button */}
        <TouchableOpacity onPress={handleBiometricLogin} style={styles.bioBtn}>
          <Ionicons name="scan-outline" size={24} color="#007AFF" />
          <Text style={styles.bioText}>Login with Face ID</Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBtn}>
          <Text style={styles.linkText}>New here? Create Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 30, backgroundColor: '#fff' },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  subtitle: { fontSize: 16, color: '#666' },
  label: { fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#f9f9f9' },
  mainBtn: { backgroundColor: '#333', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15, height: 50, justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  bioBtn: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 15, 
    borderWidth: 1, 
    borderColor: '#007AFF', 
    borderRadius: 12, 
    backgroundColor: '#f0f9ff' 
  },
  bioText: { color: '#007AFF', marginLeft: 10, fontWeight: '600', fontSize: 16 },
  linkBtn: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#007AFF', fontWeight: 'bold' }
});