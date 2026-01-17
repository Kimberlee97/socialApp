import React from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { styles } from './PostItemStyle'; 
import { Post } from '../../src/types/posts'; 

export default function PostItem({ post }: { post: Post }) {
  const formattedDate = new Date(post.created_at).toLocaleDateString();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.author}>{post.author}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {post.image ? (
        <Image
          style={styles.image}
          source={{ uri: post.image }}
          contentFit="cover"
          transition={500}
          cachePolicy="memory-disk"
        />
      ) : null}

      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        {post.description ? (
          <Text style={styles.description}>{post.description}</Text>
        ) : null}
      </View>
    </View>
  );
}
