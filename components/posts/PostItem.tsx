import React from 'react';
import { View, Text, StyleSheet } from 'react-native'; 
import { Image } from 'expo-image';
import { Post } from '../../src/types/posts';
import { styles } from './PostItemStyles'

interface PostItemProps {
  post: Post;
}

export default function PostItem({ post }: PostItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.author}>{post.author}</Text>
        </View>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.description}>{post.description}</Text>
      
      { post.image ? (
      <Image
        source={post.image} 
        style={styles.image}
        contentFit="cover" 
        transition={200}  
        cachePolicy="memory-disk" 
      /> ) : null }

    </View>
  );
}

