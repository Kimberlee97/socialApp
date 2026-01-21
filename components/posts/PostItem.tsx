/**
 * This component renders a single post card within the Feed list.
 * It is optimized for performance using React.memo to prevent unnecessary 
 * re-renders as the user scrolls through large lists of data.
 */

import React, { memo } from 'react'; 
import { View, Text } from 'react-native'; 
import { Image } from 'expo-image';
import { Post } from '../../src/types/posts'; 
import { styles } from './PostItemStyles';

interface PostItemProps {
  post: Post;
}

// Renders the visual layout for a post, including the author header, 
// title, optional description, and media content.
function PostItem({ post }: PostItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.author}>{post.author}</Text>
        </View>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      
      {/* Conditional Rendering: Only render text nodes if content exists 
          to reduce layout calculations and keep the UI clean. */}
      {post.description ? (
        <Text style={styles.description}>{post.description}</Text>
      ) : null}
      
      {/* Optimized Image: Uses 'expo-image' instead of React Native's default Image.
          This handles memory caching and transitions automatically for smoother scrolling. */}
      {post.image ? (
        <Image
          source={post.image} 
          style={styles.image}
          contentFit="cover" 
          transition={200}  
          cachePolicy="memory-disk" 
        /> 
      ) : null}
    </View>
  );
}

export default memo(PostItem);

