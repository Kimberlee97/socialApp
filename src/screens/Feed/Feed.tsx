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
import { ActivityIndicator, FlatList, StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import PostItem from '../../../components/posts/PostItem';
import { PostRepositorySql } from '../../database/PostRepositorySql';
import { useAuth } from '../../contexts/AuthContext'; 

export default function Feed() {
  const router = useRouter();
  
  // ✅ Get the logout function from Context
  const { logout } = useAuth();

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

  // ✅ UPDATED LOGOUT FUNCTION
  const handleLogout = async () => {
    // 1. Tell the Brain to clear the user
    await logout();
    // 2. The Context will AUTOMATICALLY redirect you to /login
    // You don't need router.replace() here anymore!
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logoText}>SocialApp</Text>

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
  container: { flex: 1, backgroundColor: '#fff' }, 
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#dbdbdb', 
    marginTop: Platform.OS === 'android' ? 30 : 0, 
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold', 
    color: '#000',
  },
  logoutText: {
    fontSize: 15,
    color: '#0095F6', 
    fontWeight: '600',
  },
});