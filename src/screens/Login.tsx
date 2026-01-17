import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
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

  return (
    <KeyboardAvoidingView 
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled" 
      >
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
            <Text style={styles.btnText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/signup')} style={styles.linkBtn}>
            <Text style={styles.linkText}>New here? Create Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    padding: 30, 
    backgroundColor: '#fff' 
  },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 5, color: '#333' },
  subtitle: { fontSize: 16, color: '#666' },
  label: { fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 12, marginBottom: 20, fontSize: 16, backgroundColor: '#f9f9f9' },
  mainBtn: { backgroundColor: '#333', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  linkBtn: { marginTop: 20 },
  linkText: { color: '#007AFF', fontWeight: 'bold' }
});