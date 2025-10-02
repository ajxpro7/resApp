import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import { router } from 'expo-router';
import { useRestaurantForm } from './RestaurantFormContext';

const days = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

const dayNames = {
  monday: 'Maandag',
  tuesday: 'Dinsdag',
  wednesday: 'Woensdag',
  thursday: 'Donderdag',
  friday: 'Vrijdag',
  saturday: 'Zaterdag',
  sunday: 'Zondag',
};

const defaultHours = {
  start: '09:00',
  end: '17:00',
  closed: false,
};

export default function OpeningHoursScreen() {
  const { restaurantData, updateField } = useRestaurantForm();

  // Local state mirrors context for easier updates
  const [openingHours, setOpeningHours] = useState(() => {
    // Initialize with context data or default
    return restaurantData.openingHours || Object.fromEntries(days.map(day => [day, { ...defaultHours }]));
  });

  const [pickerState, setPickerState] = useState({
    show: false,
    mode: 'time',
    day: '',
    type: '',
  });

  // Sync local state changes back to context
  useEffect(() => {
    updateField('openingHours', openingHours);
  }, [openingHours]);

  const closePicker = () => {
    setPickerState(prev => ({ ...prev, show: false }));
  };

  const toggleDay = (day) => {
    setOpeningHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed: !prev[day].closed,
      },
    }));
  };

  const openTimePicker = (day, type) => {
    setPickerState({
      show: true,
      mode: 'time',
      day,
      type,
    });
  };

  const onTimeChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setPickerState((prev) => ({ ...prev, show: false }));
    }
    if (!selectedDate) return;

    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const formatted = `${hours}:${minutes}`;

    setOpeningHours((prev) => ({
      ...prev,
      [pickerState.day]: {
        ...prev[pickerState.day],
        [pickerState.type]: formatted,
      },
    }));
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6 pt-4">
        <BackButton />

        <View className="mt-14">
          <Text className="text-3xl font-bold text-gray-900 mb-2">Openingstijden</Text>
          <Text className="text-gray-600 mb-6">Geef aan wanneer je restaurant open is</Text>
        </View>

        {days.map((day) => {
          const dayData = openingHours[day];

          return (
            <View key={day} className="mb-4 p-4 bg-gray-50 rounded-xl">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-base font-semibold text-gray-900">
                  {dayNames[day]}
                </Text>

                <TouchableOpacity
                  onPress={() => toggleDay(day)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    dayData.closed ? 'bg-red-100' : 'bg-green-100'
                  }`}
                >
                  <Text className={dayData.closed ? 'text-red-700' : 'text-green-700'}>
                    {dayData.closed ? 'Gesloten' : 'Open'}
                  </Text>
                </TouchableOpacity>
              </View>

              {!dayData.closed && (
                <View className="flex-row space-x-3">
                  <View className="flex-1">
                    <Text className="text-sm text-gray-600 mb-1">Start</Text>
                    <TouchableOpacity
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      onPress={() => openTimePicker(day, 'start')}
                    >
                      <Text className="text-gray-800">{dayData.start}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text className="pt-8 text-gray-400">-</Text>

                  <View className="flex-1">
                    <Text className="text-sm text-gray-600 mb-1">Eind</Text>
                    <TouchableOpacity
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      onPress={() => openTimePicker(day, 'end')}
                    >
                      <Text className="text-gray-800">{dayData.end}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Volgende knop */}
        <View className="mb-12">
          <TouchableOpacity
            className="bg-blue-400 py-4 rounded-2xl items-center"
            onPress={() => router.push('/(creatorAuth)/step3')}
          >
            <Text className="text-white text-base font-semibold">Volgende</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {pickerState.show && (
        <View>
          <View className="flex-row justify-between absolute top-2 left-2 right-2 z-10 px-4 pt-2">
            <Pressable onPress={closePicker}>
              <Text className="text-blue-500 text-lg">Annuleren</Text>
            </Pressable>
            <Pressable onPress={closePicker}>
              <Text className="text-blue-500 text-lg">Klaar</Text>
            </Pressable>
          </View>

          <View className="mt-12">
            <DateTimePicker
              value={new Date()}
              mode="time"
              themeVariant="dark"
              textColor="black"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
