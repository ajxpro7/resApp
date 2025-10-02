import { View, FlatList, TouchableOpacity, Text, StyleSheet, Image, Share, Alert } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Video } from 'expo-av';
import { downloadFile, getSupabaseFileUrl, getUserImageSrc } from '@/backend/services/imageService';
import { hp, wp } from '@/helpers/common';
import StoryIndicator from '@/components/StoryIndicator';
import Avatar from './Avatar';
import { Ionicons } from '@expo/vector-icons';
import Loading from './Loading';
import { Platform } from 'react-native';
import { createPostLike, removePostLike } from '@/backend/services/postService';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import { addToCart } from '@/backend/services/cartService';

const PostCard = ({ item, currentUser, router }) => {
  const mediaItems = item?.postItems || [];
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState([])
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    fetchSession();
  }, []);

  if (!item || !item.postItems || !Array.isArray(item.postItems)) {
    return null; // of een fallback component zoals <Loading />
  }

  useEffect(() => {
    setLikes(item?.postFavorieten || []);
  }, []);
  

  const onScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / wp(100));
    setActiveIndex(newIndex);
  };

  
  const onShare = async () => {
    let content = {message: item.title}
    if(mediaItems) {
      //download the file and share local uri
      setLoading(true);
      let url = await downloadFile(getSupabaseFileUrl(mediaItems[0].file)?.uri);
      setLoading(false);
      content.url = url;
    }
    Share.share(content)
  }

  const handleMenuPress = () => {
    if (item.restaurants?.id) {
      router.push({ pathname: '/menu', params: { restaurantId: item.restaurants.id } });
    } else {
      router.push('/menu');
    }
  }


  return (
    <View className='bg-black' style={{height: hp(100)}}>
      {mediaItems.length > 1 && (
        <>
        <View style={{position: 'absolute', top: Platform.OS === 'android' ? hp(0) : hp(3), left: wp(1), right: wp(1), zIndex: 1000}}>
        <StoryIndicator total={mediaItems.length} activeIndex={activeIndex} />
      </View>

          <FlatList
            ref={flatListRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            snapToInterval={wp(100)}
            decelerationRate="fast"
            snapToAlignment="start"
            data={mediaItems}
            renderItem={({ item }) => (
              <Video
                source={getSupabaseFileUrl(item.file)}
                style={{ width: wp(100), height: hp(100) }}
                resizeMode={'contain'}
                shouldPlay={true}
                isMuted={true}
                isLooping={true}
                useNativeControls={false}
              />
            )}
            keyExtractor={(item, index) => index.toString()}
          />
        </>
      )}

      {mediaItems.length === 1 && (
        <Video
          source={getSupabaseFileUrl(mediaItems[0].file)}
          style={{ width: wp(100), height: hp(100) }}
          resizeMode={'contain'}
          shouldPlay={true}
          isMuted={true}
          isLooping={true}
          useNativeControls={false}
        />
      )}


<>
  {/* Linksboven: PFP + Naam + Locatie */}
  <View style={styles.profileContainer}>
    <Avatar uri={item.restaurants?.owner?.image} size={50} rounded={300}/>
    <View style={{ marginLeft: 10 }}>
      <Text style={styles.profileName}>{item.postItems[activeIndex]?.products?.productName}</Text>
      <Text style={styles.profileLocation}>{item.title}</Text>
    </View>
  </View>

  {/* Onder profiel: Menu + Bestel knoppen */}
  <View style={styles.buttonsContainer}>
  {/* Menu knop */}
  <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
    <Ionicons name="restaurant-outline" size={20} color="white" style={{ marginRight: 6 }} />
    <Text style={styles.menuButtonText}>Menu</Text>
  </TouchableOpacity>

</View>


  {/* Rechterkant: Like + Share */}
  <View style={styles.rightButtonsContainer}>
    {
      loading ? (
        <View style={{ transform: [{ scale: 0.5 }], margin: -130 }}>
        <Loading size="small" />
      </View>
      ) : ( 
      <TouchableOpacity style={styles.iconButton} onPress={onShare}>
        <Ionicons name="send-outline" size={24} color="white" />
      </TouchableOpacity>)
    }

  </View>
</>



    </View>
  );
};

const styles = StyleSheet.create({
  profileContainer: {
    position: 'absolute',
    bottom: hp(19),
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
  },
  profileName: {
    color: 'white',
    fontWeight: '700',
    fontSize: 20,
  },
  profileLocation: {
    color: 'white',
    fontSize: 14,
    opacity: 0.8,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: hp(11),
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
  },
  
  menuButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.34)',
    paddingVertical: 16,
    paddingHorizontal: wp(38),
    borderRadius: 14,
    alignItems: 'center',
  },
  
  menuButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  
  cartButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#2563EB', // jouw kleur
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    justifyContent: 'center',
  },
  
  cartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  cartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  cartText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  
  cartPrice: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },  
  rightButtonsContainer: {
    position: 'absolute',
    right: 20,
    bottom: hp(16),
    alignItems: 'center',
    zIndex: 1000,
  },
  iconButton: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 30,
    padding: 12,
    marginBottom: 30,
  },
  iconText: {
    color: 'white',
    fontSize: 24,
  },
});


export default PostCard;
