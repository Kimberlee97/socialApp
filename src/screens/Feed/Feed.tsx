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