import {
    View,
    Text,
    SafeAreaView,
    Image,
    ScrollView,
    FlatList,
    Alert,
    ActivityIndicator,
  } from 'react-native';
  import React, { useEffect, useState } from 'react';
  import { useRouter, useLocalSearchParams } from 'expo-router';
  import { Ionicons } from '@expo/vector-icons';
  import { useAuth } from '@/backend/AuthContext';
  import { supabase } from '@/lib/supabase';
  import ProductCard from '@/components/prodCard';
import { hp, wp } from '@/helpers/common';
import { getSupabaseFileUrl } from '@/backend/services/imageService';
import { addToCart } from '@/backend/services/cartService';
import Toast from 'react-native-toast-message';
import BackButton from '@/components/BackButton';
  
  const Menu = () => {
    const { user } = useAuth();
    const router = useRouter();
    const { restaurantId } = useLocalSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState(null);
  
    const fetchProducts = async () => {
      setLoading(true);
      let restaurantData = null;
      if (restaurantId) {
        // Haal restaurant op via id uit params
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('id', restaurantId)
          .single();
        if (error || !data) {
          Alert.alert('Fout bij ophalen restaurant.');
          setLoading(false);
          return;
        }
        restaurantData = data;
      } else {
        // Fallback: eigen restaurant
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .eq('owner', user.id)
          .single();
        if (error || !data) {
          Alert.alert('Fout bij ophalen restaurant.');
          setLoading(false);
          return;
        }
        restaurantData = data;
      }
      setRestaurant(restaurantData);
  
      // Haal producten op voor dit restaurant
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('restaurantId', restaurantData.id)
        .eq('isActive', true)
        .order('created_at', { ascending: false });
      if (productsError) {
        Alert.alert('Fout bij ophalen producten.');
      } else {
        setProducts(productsData);
      }
      setLoading(false);
    };
  
    useEffect(() => {
      fetchProducts();
    }, [restaurantId]);

    const handleAddToCart = async (product) => {
      // Probeer restaurantId te halen uit product, params of restaurant state
      const restId = product.restaurantId || restaurantId || (restaurant && restaurant.id);
      // console.log('result', restId, product.id, user.id)
      if (!restId) {
        Toast.show({
          type: 'error',
          text1: 'Kan restaurant niet bepalen voor dit product!'
        });
        return;
      }
      const res = await addToCart(product.id, user.id, restId);
      if (res.success) {
        console.log('res', res)
        Toast.show({
          type: 'success',
          text1: 'Product toegevoegd aan winkelwagen',
        });
      }
    };
  
    return (
      <SafeAreaView className='flex-1 bg-white' edges={['bottom', 'left', 'right']}>

        <Image
          source={
            restaurant?.banner
              ? { uri: getSupabaseFileUrl(restaurant.banner).uri }
              : require('@/assets/images/logo1.png')
          }
          style={{
            width: wp(100),
            height: hp(30),
          }}
          resizeMode="cover"
        />

        {/* Overlay voor tekst */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: wp(100),
            height: hp(30),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.25)', // optionele donkere overlay
          }}
        >
          <Text
            style={{
              color: '#fff',
              fontSize: 40,
              fontWeight: 'bold',
              textAlign: 'center',
              textShadowColor: 'rgba(0,0,0,0.6)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 4,
            }}
          >
            {restaurant?.name}
          </Text>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
          <Ionicons name="location-outline" size={20} color="white" className='mt-1' />
          <Text
            style={{
              color: '#fff',
              fontSize: 16,
              textAlign: 'center',
              marginTop: 4,
              fontWeight: 'bold',
              textShadowColor: 'rgba(0,0,0,0.6)',
              textShadowOffset: { width: 1, height: 1 },
              textShadowRadius: 4,
            }}
          >
            {restaurant?.city}
          </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1" 
          edges={['bottom', 'left', 'right']}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
  
          {/* Menu Section */}
          <View className="bg-gray-50 px-5">
            <Text className="text-2xl font-bold text-black mb-4 mt-6">Menu</Text>
  
            {loading ? (
              <ActivityIndicator size="large" color="#EF4444" />
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ProductCard product={item} 
                variant="menu" 
                showAddToCartButton={true}
                 onAddToCart={handleAddToCart}
                  pressable={false} />}

                scrollEnabled={false}
                contentContainerStyle={{ gap: 2 }}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
  
  export default Menu;
  