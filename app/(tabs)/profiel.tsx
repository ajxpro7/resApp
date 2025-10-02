import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useAuth } from '@/backend/AuthContext';
import Avatar from '@/components/Avatar';
import { getUserAddressFromSupabase } from '@/backend/services/userService';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { Colors } from '@/constants/Colors';
import { hp } from '@/helpers/common';


export default function ProfileScreen() {
  const { user } = useAuth();
  const [address, setAddress] = useState(null);
  const [session, setSession] = useState(null);
  const router = useRouter();

  const isCreator = session?.user?.user_metadata?.isCreator === true;

  useFocusEffect(
    useCallback(() => {
      const getAddressFromSupabase = async () => {
        if (!user?.id) return setAddress(null);
        try {
          const data = await getUserAddressFromSupabase(user.id);
          if (data?.streetName || data?.houseNumber) {
            const parts = [data.streetName, data.houseNumber].filter(Boolean);
            setAddress(parts.join(' ').trim());
          } else {
            setAddress(null);
          }
        } catch (error) {
          console.error('Error getting address:', error);
          setAddress(null);
        }
      };
      getAddressFromSupabase();
    }, [user?.id])
  );

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
  
    fetchSession();
  
    // Realtime update bij login/logout
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  
  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Er is een probleem bij het uitloggen');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Confirm', 'Ben je zeker dat je wilt uitloggen?', [
      {
        text: 'Cancel',
        onPress: () => console.log('modal closed'),
        style: 'cancel'
      },
      {
        text: 'Uitloggen',
        onPress: () => onLogout(),
        style: 'destructive'
      }
    ]);
  };

  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkRestaurantVerification = async () => {
      // Haal huidige gebruiker op
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      // Als gebruiker niet bestaat of fout
      if (userError || !user) {
        setIsVerified(false);
        return;
      }
  
      // Haal restaurantgegevens op
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('name, street, streetNr, zipCode, website, phoneNumber, openingHours, description')
        .eq('owner', user.id)
        .single();
  
      // Als er geen restaurant is of fout bij ophalen
      if (restaurantError || !restaurant) {
        setIsVerified(false);
        return;
      }
  
      // Vereiste velden die ingevuld moeten zijn
      const requiredFields = [
        'name',
        'street',
        'streetNr',
        'zipCode',
        'phoneNumber',
        'openingHours',
        'description',
      ];
  
      // Controleer of alle velden bestaan en NIET leeg zijn
      const isComplete = requiredFields.every((field) => {
        const value = restaurant[field];
        return value !== null && value !== undefined && String(value).trim() !== '';
      });
  
      setIsVerified(isComplete);
    };
  
    checkRestaurantVerification();
  }, []);


const test = () => {
  console.log('Toast test wordt uitgevoerd...');
  
  // Test verschillende toast types
  Toast.show({
    type: 'success',
    text1: 'Je post is succesvol geplaatst!',
    position: 'top',
    visibilityTime: 3000,
  });
};


  const menuItems = [
    { label: 'Bewerk Profiel', icon: 'edit', onPress: () => router.push('editProfile'),  requiresAuth: true },
    { label: 'Bedrijfs Gegevens', icon: 'eye', creatorOnly: true,
       onPress: () => router.push('/(creatorAuth)/gegevensEdit'),
       requireVerification: true,
       },
    { label: 'Notificatie', icon: 'bell',  onPress: test },
    {
      label: isVerified ? 'Gecontroleerd' : 'Verifieren',
      icon: isVerified ? 'check-circle' : 'info',
      onPress: isVerified ? undefined : () => router.push('/(creatorAuth)/step0'),
      creatorOnly: true,
      disabled: isVerified
    },    
    { label: 'Feedback', icon: 'info'},
    { label: 'Links', icon: 'link' },
    { label: 'Uitloggen', icon: 'power', onPress: handleLogout, requiresAuth: true },
    { label: 'Account Verwijderen', icon: 'trash', requiresAuth: true }
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg, margin: 15 }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={{ flex: 1 }} contentContainerStyle={{ backgroundColor: Colors.darkBg, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}>
        {/* Profiel Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Ionicons name="person-outline" size={24} color={Colors.text} style={{ marginLeft: 12 }} />
          <Text style={{ color: Colors.text, fontSize: 20, fontWeight: 'bold' }}>Profiel</Text>
          <Avatar uri={user?.image} size={40} rounded={999} />
        </View>
        {/* Login prompt als niet ingelogd */}
        {!user?.id ? (
          <View style={{ flex: 1, alignItems: 'center', paddingVertical: hp(25) }}>
            <Text style={{ fontSize: 48, marginBottom: 16, color: Colors.text }}>🔒</Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text, marginBottom: 8 }}>Log in om je profiel te bekijken</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={{ backgroundColor: Colors.blue, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}>
              <Text style={{ color: Colors.text, fontWeight: 'bold' }}>Inloggen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Adres */}
            {!isCreator && (
              <TouchableOpacity onPress={() => router.push('/getAddres')} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBg, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Colors.border }}>
                  <Icon name="map-pin" size={18} color={Colors.textSecondary} />
                  <Text style={{ marginLeft: 8, color: Colors.textSecondary }}>{address || 'Locatie niet beschikbaar'}</Text>
                  <Icon name="chevron-down" size={18} color={Colors.textSecondary} style={{ marginLeft: 4 }} />
                </View>
              </TouchableOpacity>
            )}

            { isCreator && !isVerified && (
              <View className="bg-red-100 rounded-xl p-4 border border-gray-200 mb-4">
                <Text className="text-gray-700">Verifieer je account om berichten te plaatsen en bestellingen te ontvangen</Text>
              </View>
            )}

            { !isCreator && (
            <TouchableOpacity
              onPress={() => router.push('/(creatorAuth)/welkomCreator')}
              className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-6 mb-4"
            >
              <View className="flex-row items-center">
                <Text className="text-3xl mr-4">👨‍🍳</Text>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-orange-700 mb-1">Word Creator</Text>
                  <Text className="text-sm text-orange-600">
                    Ben je een restaurant? Maak een creator account aan om je gerechten te delen
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
)}

            {/* Upgrade Box als gebruiker niet ingelogd is */}
            {!session && (
              <TouchableOpacity
                onPress={() => router.push('/(auth)/welkom')}
                className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-6 mb-4"
              >
                <View className="flex-row items-center">
                  <Text className="text-3xl mr-4">🎉</Text>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-blue-800 mb-1">Maak een Account Aan</Text>
                    <Text className="text-sm text-blue-700">
                      Krijg toegang tot meer voordelen door een account aan te maken
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}

            {/* Menu Buttons als klikbare boxen */}
            <View className="flex-row flex-wrap justify-between gap-4 mb-20">
              {menuItems
                .filter(item => {
                  if (item.requiresAuth && !session) return false;
                  if (item.creatorOnly && !isCreator) return false;
                  if (item.requireVerification && !isVerified) return false;
                  return true;
                })
                .map((item, idx) => (
                  <TouchableOpacity
                  style={{backgroundColor: "#1E1E1E" }}
                  key={idx}
                  onPress={item.disabled ? () => {} : item.onPress}
                  activeOpacity={item.disabled ? 1 : 0.7}
                  className={`w-[48%] rounded-2xl px-4 py-6 flex-row items-center ${
                    item.disabled ? 'bg-green-100 border border-green-300' : ' border border-gray-200'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    size={20}
                    color={item.disabled ? 'green' : 'white'}
                  />
                  <Text
                    className={`ml-3 text-base font-medium ${
                      item.disabled ? 'text-green-700' : 'text-white'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
                
                
                ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
