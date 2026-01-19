import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PostRepositorySql } from '../database/PostRepositorySql';
import { ImageService } from '../services/ImageService';

export default function CreatePostScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleCreate = async () => {
    if (!title.trim() || !author.trim()) return Alert.alert("Required", "Please add a title and author.");

    setIsSubmitting(true);
    try {
      const finalUri = imageUri ? await ImageService.saveImage(imageUri) : null;
      
      await PostRepositorySql.create({
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        image: finalUri 
      });

      // Reset & Navigate
      setTitle(''); setAuthor(''); setDescription(''); setImageUri(null);
      router.push('/(tabs)'); 
    } catch (e) {
      Alert.alert("Error", "Could not share post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity onPress={handleCreate} disabled={isSubmitting}>
            <Text style={[styles.postButtonText, isSubmitting && styles.disabledText]}>
              Share
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. Image Picker (The "+" Box) */}
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.plusIcon}>+</Text>
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formContainer}>
          {/* 2. Title */}
          <Text style={styles.label}>Title</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Write a caption title..." 
            placeholderTextColor="#999"
            value={title} 
            onChangeText={setTitle} 
            maxLength={25}
          />

          {/* 3. Author */}
          <Text style={styles.label}>Author</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Your Name" 
            placeholderTextColor="#999"
            value={author} 
            onChangeText={setAuthor} 
          />

          {/* 4. Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="What's on your mind?" 
            placeholderTextColor="#999"
            value={description} 
            onChangeText={setDescription} 
            multiline 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
    marginTop: 10
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  postButtonText: { fontSize: 16, fontWeight: '600', color: '#0095F6' }, 
  disabledText: { color: '#b3dffc' },

  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderContainer: { alignItems: 'center' },
  plusIcon: { fontSize: 50, color: '#ccc', fontWeight: '300' },
  addPhotoText: { color: '#999', fontSize: 14, marginTop: 5 },

  formContainer: { padding: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#262626', marginTop: 15, marginBottom: 8 },
  input: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb',
    paddingVertical: 8,
    color: '#000',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top', 
  },
});