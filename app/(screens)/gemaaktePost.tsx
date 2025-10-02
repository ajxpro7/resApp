import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Loading from '@/components/Loading';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/helpers/common';
import { useRouter } from 'expo-router';
import { fetchUserPosts } from '@/backend/services/postService';
import PostCard from '@/components/PostCard';
import { useAuth } from '@/backend/AuthContext';
import { supabase } from '@/lib/supabase';
import { fetchPostById } from '@/backend/services/postService';
import { Colors } from '@/constants/Colors';
import BackButton from '@/components/BackButton';
import { getCurrentRestaurantData } from '@/backend/services/userService';

const gemaaktePost = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [post, setPost] = useState([]);
    const {user} = useAuth();
    const [limit, setLimit] = useState(4);
    const [hasmore, setHasmore] = useState(true);
    const [visiblePostId, setVisiblePostId] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
  
    const mergeUniquePosts = (prevPosts, newPosts) => {
      const map = new Map();
      [...prevPosts, ...newPosts].forEach(post => {
        map.set(post.id, post); // overschrijft duplicates
      });
      return Array.from(map.values());
    };
  
    const handlePostEvent = async (payload) => {
      if (payload.eventType === 'INSERT' && payload?.new?.id) {
        const res = await fetchPostById(payload.new.id);
        if (res.success && res.data.length > 0) {
          setPost(prev => mergeUniquePosts([res.data[0]], prev));
        }
      }
    };
    
    useEffect(() => {
      const fetchRestaurant = async () => {
        if (!user?.id) return;
        const restRes = await getCurrentRestaurantData();
        if (restRes.success && restRes.data) {
          setRestaurant(restRes.data);
        }
      };
      fetchRestaurant();
    }, [user?.id]);
  
    useEffect(() => {
      getPost();
    }, [user?.id, restaurant?.id]);

    // Real-time updates voor posts van het eigen restaurant
    useEffect(() => {
      if (!restaurant?.id) return;

      const channelName = 'realtime-user-posts-' + restaurant.id;
      
      // Remove existing channel if it exists
      const existing = supabase.getChannels().find((ch) => ch.topic === `realtime:${channelName}`);
      if (existing) {
        supabase.removeChannel(existing);
      }
      
      // Subscribe to real-time updates voor posts van dit restaurant
      const channel = supabase
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `restaurantId=eq.${restaurant.id}`
        }, handlePostEvent)
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [restaurant?.id]);

    const canFetchMore = useRef(true);
  
    const getPost = async () => {
      if (!hasmore || loading || !user?.id || !restaurant?.id) return;

      setLoading(true);
      
      const offset = post.length;
      const res = await fetchUserPosts(user.id, limit, offset);

      setLoading(false);
      
      if (res.success) {
        const fetched = res.data || [];
        
        if (fetched.length === 0) {
          setHasmore(false);
        } else {
          setPost(prev => mergeUniquePosts(prev, fetched));
          if (fetched.length < limit) {
            setHasmore(false);
          }
        }
      } else {
        setHasmore(false);
      }
    };
  
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg }}  edges={['bottom', 'left', 'right']}>

        {/* Filter & Search buttons */}
        <View
            className="absolute z-20 flex-row gap-3"
            pointerEvents="box-none"
            style={{top: Platform.OS === 'android' ? hp(4) : hp(10), left: wp(5)}}
          >
            <BackButton color={'white'}/>
        </View>
        {/* post */}
        <FlatList
        data={post}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
        <PostCard 
        item={item} 
        currentUser={user} 
        router={router}
        isVisible={visiblePostId === item.id}
        />
        )}
        // pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={hp(100)}
        decelerationRate="fast"
        snapToAlignment="start"
        onViewableItemsChanged={({ viewableItems }) => {
        if (viewableItems.length > 0) {
        setVisiblePostId(viewableItems[0].item.id);
        }
        }}
        viewabilityConfig={{
        itemVisiblePercentThreshold: 50, // Post is zichtbaar als 50% in beeld is
        minimumViewTime: 100, // Minimaal 100ms zichtbaar
        }}
        onEndReached={() => {
        getPost();
        console.log('dit is de einde');
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent= { hasmore ? ( 
          <View style={styles.loadingOverlay}>
        <Loading />
          </View>
        ) : (
        <View style={{marginVertical: 30, alignItems: "center", marginBottom: 80}}>
        <Text style={{ color: Colors.text, fontSize: 20 }}>Er zijn geen posts meer</Text>
        </View> 
        )}
        removeClippedSubviews={false}
        />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(255, 255, 255, 0.7)',
    marginTop: hp(30),
    alignItems: 'center',
    zIndex: 100,
  },
});

export default gemaaktePost