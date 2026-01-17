import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, 
  KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { UserService } from '../services/UserService';

export default function SignUp() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');

  const handleSignUp = async () => {

    if (!username || pin.length !== 4) {
      return Alert.alert("Error", "Enter a username and a 4-digit PIN.");
    }


    const exists = await UserService.usernameExists(username);
    if (exists) {
      return Alert.alert("Taken", "That username is already used. Try another.");
    }

    try {
      await UserService.createUser(username, pin);
      router.replace('/(tabs)');
      
    } catch (error) {
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
          placeholder="NewUser123" 
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