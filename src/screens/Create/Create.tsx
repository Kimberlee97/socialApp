/**
 * This screen provides the form interface for creating new posts.
 * It handles input validation, device image selection (with cropping),
 * and coordinates the saving of both image assets and post metadata to the database.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PostRepositorySql } from '../../database/PostRepositorySql';
import { ImageService } from '../../services/ImageService';
import { styles } from '././CreateStyles'; 

export default function CreatePostScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Launches the device's native image library with editing (cropping) enabled.
  // Updates the state with the temporary URI if an image is selected.
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  // Handles form submission with the following steps:
  // 1. Validates required fields (Title/Author).
  // 2. Moves the temporary image file to permanent storage via ImageService.
  // 3. Inserts the post record into SQLite and navigates back to the Feed.
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

      setTitle(''); setAuthor(''); setDescription(''); setImageUri(null);
      router.push('/(tabs)'); 
    } catch (e) {
      Alert.alert("Error", "Could not share post.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renders the form UI within a safe area to handle device notches.
  // Includes a header with a submission button and a scrollable form for inputs.
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

        <View style={styles.formContainer}>
          {/* 1. Title */}
          <Text style={styles.label}>Title</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Write a caption title..." 
            placeholderTextColor="#999"
            value={title} 
            onChangeText={setTitle} 
            maxLength={25}
          />

          {/* 2. Author */}
          <Text style={styles.label}>Author</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Your Name" 
            placeholderTextColor="#999"
            value={author} 
            onChangeText={setAuthor} 
          />

          {/* 3. Description */}
          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="What's on your mind?" 
            placeholderTextColor="#999"
            value={description} 
            onChangeText={setDescription} 
            multiline 
          />

          {/* 4. Image Picker */}
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

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}