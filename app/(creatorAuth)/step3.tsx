import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import { useRouter } from 'expo-router';
import { useRestaurantForm } from './RestaurantFormContext';

const restaurantTypes = [
  'Japans',
  'Fast Food',
  'Italiaans',
  'Mexicaans',
  'Thais',
  'Vegan',
  'Grill',
  'Indiaas',
  'Veganistisch',
  'Vegatarisch',
  'Amerikaans',
  'Frans',
  'Mediterraans',
];

export default function RestaurantTypeSelect() {
  const { restaurantData, updateField } = useRestaurantForm();
  const router = useRouter();

  // Init selected values or empty array
  const selectedValues = restaurantData.types || [];

  const toggleOption = (option) => {
    const newTypes = selectedValues.includes(option)
      ? selectedValues.filter((item) => item !== option)
      : [...selectedValues, option];

    updateField('types', newTypes);
  };

  const handleNext = () => {
    router.push('/(creatorAuth)/step4');
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <BackButton />
      <ScrollView contentContainerStyle={{ padding: 16 }} className="flex-1">
        <View className="mb-6 mt-14">
          <Text className="text-xl font-medium text-gray-700 mb-3">Selecteer restauranttype</Text>

          <View className="flex-row flex-wrap gap-2">
            {restaurantTypes.map((option) => {
              const isSelected = selectedValues.includes(option);

              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => toggleOption(option)}
                  className={`px-5 py-3 rounded-full border text-sm font-medium ${
                    isSelected
                      ? 'bg-blue-400 border-blue-400'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <Text className={isSelected ? 'text-white' : 'text-gray-700'}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedValues.length > 0 && (
            <Text className="text-gray-600 text-sm mt-2">
              Geselecteerd: {selectedValues.join(', ')}
            </Text>
          )}
        </View>
      </ScrollView>

      <View className="px-6 pb-6">
        <TouchableOpacity
          onPress={handleNext}
          className="bg-blue-400 py-4 rounded-xl"
        >
          <Text className="text-white text-center font-semibold text-base">Volgende</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
