import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Post } from '../types/posts'; // The Noun
import { PostRepositorySql } from '../database/PostRepositorySql'; // The Worker

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    // The UI asks the worker for data
    const data = await PostRepositorySql.fetchAll();
    setPosts(data);
    setLoading(false);
  };

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder} />
        <View>
          <Text style={styles.author}>{item.author}</Text>
          <Text style={styles.date}>Just now</Text>
        </View>
      </View>

      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      )}

      <Text style={styles.title}>{item.title}</Text>
    </View>
  );

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: 'white', marginBottom: 10, padding: 15, marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ddd', marginRight: 10 },
  author: { fontWeight: 'bold', fontSize: 16 },
  date: { color: '#888', fontSize: 12 },
  description: { marginBottom: 10, color: '#333', lineHeight: 20 },
  image: { width: '100%', height: 250, borderRadius: 8, marginBottom: 10 },
  title: { fontWeight: 'bold', fontSize: 14, color: '#555', marginTop: 5 },
});