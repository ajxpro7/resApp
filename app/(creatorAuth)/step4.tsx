// // app/(creatorAuth)/overview.tsx
// import React, { useState } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRestaurantForm } from './RestaurantFormContext';
// import { supabase } from '@/lib/supabase';
// import { router } from 'expo-router';
// import BackButton from '@/components/BackButton';
// import { createRestaurant } from '@/backend/services/userService';
// import Loading from '@/components/Loading';

// const dayLabels = {
//   monday: 'Maandag',
//   tuesday: 'Dinsdag',
//   wednesday: 'Woensdag',
//   thursday: 'Donderdag',
//   friday: 'Vrijdag',
//   saturday: 'Zaterdag',
//   sunday: 'Zondag',
// };

// export default function RestaurantOverviewScreen() {
//   const { restaurantData } = useRestaurantForm();
//   const [loading, setLoading] = useState(false);

//   const {
//     name,
//     street,
//     streetNr,
//     zipCode,
//     city,
//     phoneNumber,
//     website,
//     types,
//     openingHours,
//   } = restaurantData;


//   const handleSubmit = async () => {
//     setLoading(true);
  
//     const mappedRestaurant = {
//         name: restaurantData.name,
//         street: restaurantData.street,
//         streetNr: restaurantData.streetNr,
//         zipCode: restaurantData.zipCode,
//         website: restaurantData.website,
//         phoneNumber: restaurantData.phoneNumber,
//         description: restaurantData.types?.join(', '), // string maken
//         openingHours: restaurantData.openingHours,     // als json
//       };
      
  
//     const res = await createRestaurant(mappedRestaurant);
//     setLoading(false);
  
//     if (!res.success) {
//       Alert.alert('Fout', res.msg);
//       return;
//     }
  
//     router.replace('/(tabs)/home');
//     console.log('Restaurant opgeslagen:', res.data);
//   };
  

//   return (
//     <SafeAreaView className="flex-1 bg-white px-6">

// {loading && (
//         <View style={styles.loadingOverlay}>
//           <Loading />
//         </View>
//       )}

//       <ScrollView>
//         <BackButton />
//         <Text className="text-2xl font-bold mt-16 mb-4">Overzicht van je gegevens</Text>

//         <View className="mb-6">
//           <Text className="text-lg font-semibold mb-2">Algemene Informatie</Text>
//           <Text>Naam: {name}</Text>
//           <Text>Adres: {street} {streetNr}, {zipCode} {city}</Text>
//           <Text>Telefoon: {phoneNumber}</Text>
//           <Text>Website: {website}</Text>
//           <Text>Type(s): {types.join(', ')}</Text>
//         </View>

//         <View>
//           <Text className="text-lg font-semibold mb-2">Openingstijden</Text>
//           {Object.entries(openingHours).map(([day, times]) => (
//             <Text key={day}>
//               {dayLabels[day]}: {times.closed ? 'Gesloten' : `${times.start} - ${times.end}`}
//             </Text>
//           ))}
//         </View>

//         <TouchableOpacity
//           className="mt-10 bg-blue-400 py-4 rounded-xl"
//           onPress={handleSubmit}
//         >
//           <Text className="text-white text-center font-semibold text-base">Bevestigen & Opslaan</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//     loadingOverlay: {
//       ...StyleSheet.absoluteFillObject,
//       backgroundColor: 'rgba(255, 255, 255, 0.7)',
//       justifyContent: 'center',
//       alignItems: 'center',
//       zIndex: 20,
//     },
//   });


import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRestaurantForm } from './RestaurantFormContext';
import { createRestaurant } from '@/backend/services/userService';
import { router } from 'expo-router';
import BackButton from '@/components/BackButton';
import Loading from '@/components/Loading';
import Toast from 'react-native-toast-message';

const dayLabels = {
  monday: 'Maandag',
  tuesday: 'Dinsdag',
  wednesday: 'Woensdag',
  thursday: 'Donderdag',
  friday: 'Vrijdag',
  saturday: 'Zaterdag',
  sunday: 'Zondag',
};

export default function RestaurantOverviewScreen() {
  const { restaurantData } = useRestaurantForm();
  const [loading, setLoading] = useState(false);

  const {
    name,
    street,
    streetNr,
    zipCode,
    city,
    phoneNumber,
    website,
    types,
    openingHours,
  } = restaurantData;

  const handleSubmit = async () => {
    setLoading(true);

    const mappedRestaurant = {
      name: restaurantData.name,
      street: restaurantData.street,
      streetNr: restaurantData.streetNr,
      zipCode: restaurantData.zipCode,
      city: restaurantData.city,
      website: restaurantData.website,
      phoneNumber: restaurantData.phoneNumber,
      description: restaurantData.types?.join(', '),
      openingHours: restaurantData.openingHours,
    };

    const res = await createRestaurant(mappedRestaurant);
    setLoading(false);

    if (!res.success) {
      Alert.alert('Fout', res.msg);
      return;
    }

    Toast.show({
      type: 'success',
      text1: 'App verificatie voltooid!',
      position: 'top',
      visibilityTime: 3000,
    });
    
    // Ga terug naar onboarding flow in plaats van direct naar home
    router.replace('/(creatorAuth)/step0');
    console.log('App verificatie voltooid:', res.data);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading && (
        <View className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-20">
          <Loading />
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>
        <BackButton />

        <Text className="text-2xl font-bold text-gray-900 mt-16 mb-6">
          Overzicht van je gegevens
        </Text>

        <View className="mb-7 bg-gray-50 rounded-lg p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Algemene Informatie
          </Text>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Naam</Text>
            <Text className="text-gray-900 font-medium">{name}</Text>
          </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Adres</Text>
            <Text className="text-gray-900 font-medium">{`${street} ${streetNr}, ${zipCode} ${city}`}</Text>
          </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Telefoon</Text>
            <Text className="text-gray-900 font-medium">{phoneNumber}</Text>
          </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Website</Text>
            <Text className="text-gray-900 font-medium">{website}</Text>
          </View>
          <View className="flex-row justify-between py-1">
            <Text className="text-gray-600">Type(s)</Text>
            <Text className="text-gray-900 font-medium">{types.join(', ')}</Text>
          </View>
        </View>

        <View className="mb-7 bg-gray-50 rounded-lg p-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">
            Openingstijden
          </Text>
          {Object.entries(openingHours).map(([day, times]) => (
            <View key={day} className="flex-row justify-between py-1">
              <Text className="text-gray-600">{dayLabels[day]}</Text>
              <Text className="text-gray-900 font-medium">
                {times.closed ? 'Gesloten' : `${times.start} - ${times.end}`}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          className="mt-10 bg-blue-500 py-4 rounded-xl"
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold text-base">
            Bevestigen & Opslaan
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});