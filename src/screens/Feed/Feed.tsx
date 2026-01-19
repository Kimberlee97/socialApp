/*
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import PostItem from '../../../components/posts/PostItem';
import { getDB } from '../../database/connection';

export default function Feed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const db = await getDB();
    const result = await db.getAllAsync('SELECT * FROM posts ORDER BY id DESC');
    setPosts(result);
    setLoading(false);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostItem post={item} />}
        
        // Performance Settings
        initialNumToRender={10}   // Render enough to fill screen immediately
        maxToRenderPerBatch={10}  // Render 10 items per batch while scrolling
        windowSize={5}            // Keep 5 screens of content in memory (prevents blanking)
        removeClippedSubviews={true} // Unmounts off-screen views to save RAM
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
*/


import React, { useState, useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, Text, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import PostItem from '../../../components/posts/PostItem';
import { PostRepositorySql } from '../../database/PostRepositorySql';

export default function Feed() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  async function loadPosts() {
    try {
      const result = await PostRepositorySql.getAll();
      setPosts(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => router.replace('/login');

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      {/* Clean Header */}
      <View style={styles.header}>
        {/* Title (Left) */}
        <Text style={styles.logoText}>SocialApp</Text>

        {/* Logout (Right) */}
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostItem post={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' }, // Pure white background
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Instagram-style Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb', // Subtle gray line
    marginTop: Platform.OS === 'android' ? 30 : 0, // Fix for Android status bar
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold', // Or 'fontFamily' if you import a cursive font
    color: '#000',
  },
  logoutText: {
    fontSize: 15,
    color: '#0095F6', // Instagram Blue for action links
    fontWeight: '600',
  },
});