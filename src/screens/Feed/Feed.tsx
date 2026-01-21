/**
 * The main landing screen of the application.
 * It displays a paginated list of posts fetched from the local SQLite database,
 * implementing infinite scrolling and auto-refresh on focus to keep data current.
 */

import React, { useState, useCallback, useRef } from 'react'; 
import { ActivityIndicator, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useScrollToTop } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostItem from '../../../components/posts/PostItem';
import { PostRepositorySql } from '../../database/PostRepositorySql';
import { useAuth } from '../../contexts/AuthContext'; 
import { styles } from './FeedStyles'; 

const PAGE_SIZE = 20;

export default function Feed() {
  const { logout } = useAuth();
  
  // State management for the list data and loading indicators
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Pagination cursors and Total Count (for logic boundaries)
  const [dbTotal, setDbTotal] = useState(0);
  const offsetRef = useRef(0);
  const isMounted = useRef(true);

  // Scroll Ref to support the "Tap tab to scroll to top" native behavior
  const flatListRef = useRef(null);
  useScrollToTop(flatListRef);

  // Refreshes data whenever the screen comes into focus.
  // This ensures the feed immediately shows new posts after the user creates one and returns.
  useFocusEffect(
    useCallback(() => {
      isMounted.current = true;
      loadInitialPosts();
      return () => { isMounted.current = false; };
    }, [])
  );

  // Resets the pagination cursor and fetches the first batch of posts (Page 0).
  // Also updates the total count from the DB to know when to stop scrolling.
  async function loadInitialPosts() {
    setIsLoading(true);
    offsetRef.current = 0; 
    
    try {
      const total = await PostRepositorySql.getCount();
      setDbTotal(total);
      
      console.log(`[Feed] Total posts in DB: ${total}`);

      const result = await PostRepositorySql.getAll(PAGE_SIZE, 0);
      if (isMounted.current) {
        setPosts(result);
        offsetRef.current = result.length;
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }

  // Called when the user scrolls near the bottom of the list.
  // Fetches the next batch of data based on the current offset and appends it to the list.
  async function loadMorePosts() {
    if (isFetchingMore) return;
    if (offsetRef.current >= dbTotal) return;

    setIsFetchingMore(true);
    
    console.log(`[Feed] Loading more... Current Offset: ${offsetRef.current}`);

    try {
      const newPosts = await PostRepositorySql.getAll(PAGE_SIZE, offsetRef.current);

      if (newPosts.length > 0 && isMounted.current) {
        setPosts(prev => [...prev, ...newPosts]);
        offsetRef.current += newPosts.length;
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (isMounted.current) setIsFetchingMore(false);
    }
  }

  const handleLogout = async () => {
    await logout();
  };

  const renderFooter = () => {
    if (!isFetchingMore) return <View style={{ height: 50 }} />;
    return <ActivityIndicator size="small" color="#999" style={{ margin: 15 }} />;
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  // Renders the main UI.
  // The FlatList is configured with performance optimizations (windowSize, removeClippedSubviews)
  // to ensure smooth scrolling even with large datasets.
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logoText}>SocialApp</Text>
        
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef} 
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <PostItem post={item} />}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}

        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5} 
        ListFooterComponent={renderFooter}

        initialNumToRender={10} 
        maxToRenderPerBatch={10}
        windowSize={10} 
        removeClippedSubviews={true} 
      />
    </SafeAreaView>
  );
}