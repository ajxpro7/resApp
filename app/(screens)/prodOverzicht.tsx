// app/products/index.tsx
import { View, Text, ActivityIndicator, Alert, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/backend/AuthContext';
import ProductCard from '@/components/prodCard';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import Loading from '@/components/Loading';

const ProductOverview = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  const fetchProducts = async () => {
    setLoading(true);
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants') // tabelnaam gecorrigeerd
      .select('id')
      .eq('owner', user.id)
      .single();

    if (restaurantError || !restaurant) {
      Alert.alert('Fout bij ophalen restaurant.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('restaurantId', restaurant.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Fout bij ophalen producten.');
    } else {
      setProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Realtime listener voor product updates
    let channel;
    const subscribeRealtime = async () => {
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner', user.id)
        .single();
      if (restaurantError || !restaurant) return;
      channel = supabase
        .channel('realtime-products-' + restaurant.id)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'products',
          filter: `restaurantId=eq.${restaurant.id}`
        }, (payload) => {
          fetchProducts();
        })
        .subscribe();
    };
    subscribeRealtime();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handlePress = (product) => {
    router.push({
      pathname: '/(screens)/prodEdit',
      params: { productId: product.id }, // ✅ juist: niet genest
    });
    
  };
  
  

  return (
    <SafeAreaView className="flex-1 bg-gray-100 px-6">
        <BackButton/>
      <Text className="text-3xl font-bold text-gray-900 mb-4 mt-16">Mijn Producten</Text>

      {loading ? (
        <Loading/>
      ) : products.length === 0 ? (
        <Text className="text-gray-600 mt-10">Geen producten gevonden.</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={handlePress} variant="beheer"/>
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ProductOverview;
