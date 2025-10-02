// app/(creatorAuth)/step1.tsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import { router } from 'expo-router';
import { useRestaurantForm } from './RestaurantFormContext';
import Toast from 'react-native-toast-message';

const RestaurantFormScreen = () => {
  const { restaurantData, updateField } = useRestaurantForm();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }} className="flex-1 px-6 pt-4">
          <BackButton />

          <View className="mt-16">
            <Text className="text-3xl font-bold text-gray-900 mb-2 mt-4">Restaurantgegevens</Text>
            <Text className="text-gray-600 mb-8">Vertel ons over je restaurant</Text>
          </View>

          <View className="space-y-6 mt-6">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Restaurantnaam *</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Voer je restaurantnaam in"
                value={restaurantData.name}
                onChangeText={(text) => updateField('name', text)}
                placeholderTextColor="#999"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2 mt-4">Adres</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
                placeholder="Straatnaam"
                value={restaurantData.street}
                onChangeText={(text) => updateField('street', text)}
                placeholderTextColor="#999"
              />
              <Text className="text-sm font-medium text-gray-700 mb-2">Plaats</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
                placeholder="plaats"
                value={restaurantData.city}
                onChangeText={(text) => updateField('city', text)}
                placeholderTextColor="#999"
              />
              <View className="flex-row gap-3 mb-4">
                <TextInput
                  className="flex-1 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                  placeholder="Nr"
                  value={restaurantData.streetNr}
                  onChangeText={(text) => updateField('streetNr', text)}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
                <TextInput
                  className="flex-1 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                  placeholder="Postcode"
                  value={restaurantData.zipCode}
                  onChangeText={(text) => updateField('zipCode', text)}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Telefoonnummer</Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
                placeholder="Voer je telefoonnummer in"
                value={restaurantData.phoneNumber}
                onChangeText={(text) => updateField('phoneNumber', text)}
                keyboardType="phone-pad"
                placeholderTextColor="#999"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Website of Instagram (Optioneel)
              </Text>
              <TextInput
                className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="https://... of @instagram"
                value={restaurantData.website}
                onChangeText={(text) => updateField('website', text)}
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </ScrollView>

        <View className="absolute bottom-6 left-6 right-6">
          <TouchableOpacity
            className="bg-blue-400 py-4 rounded-2xl items-center"
            onPress={() => {
              const { name, street, city, streetNr, zipCode, phoneNumber } = restaurantData;
            
              if (!name || !street || !city || !streetNr || !zipCode || !phoneNumber) {
                Toast.show({
                  type: 'error',
                  text1: 'Vul alle verplichte velden in',
                  text2: 'Website/Instagram zijn optioneel.',
                  position: 'top',
                  visibilityTime: 3000,
                });
                return;
              }
            
              router.push('/(creatorAuth)/step2');
            }}
            
          >
            <Text className="text-white text-base font-semibold">Volgende</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RestaurantFormScreen;
