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

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router'; 
import PostItem from '../../../components/posts/PostItem';
import { getDB } from '../../database/connection';

export default function Feed() {
  const router = useRouter(); 
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

  const handleLogout = () => {
    console.log("Logout button pressed.");
    router.replace('/login'); 
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Feed</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostItem post={item} />}
        
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60, 
    paddingBottom: 10,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ff4d4d', 
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});