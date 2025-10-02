import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import DateTimePicker from '@react-native-community/datetimepicker';
import { hp, wp } from '@/helpers/common';
import { getCurrentRestaurantData, createRestaurant } from '@/backend/services/userService';
import * as ImagePicker from 'expo-image-picker';
import { getBannerImageSrc, uploadFile } from '@/backend/services/imageService';
import { useRouter } from 'expo-router';
import Loading from '@/components/Loading';
import Toast from 'react-native-toast-message';

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

const GegevensEditScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [restaurantData, setRestaurantData] = useState({
    name: '',
    street: '',
    city: '',
    streetNr: '',
    zipCode: '',
    phoneNumber: '',
    website: '',
    banner: '',
    description: '',
    openingHours: Object.fromEntries(days.map(day => [day, { ...defaultHours }])),
  });

  const [pickerState, setPickerState] = useState({
    show: false,
    day: '',
    type: '',
  });

  const onPickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Toegang tot media is nodig.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [16, 9],
    });

    if (!result.canceled) {
      setRestaurantData(prev => ({
        ...prev,
        banner: result.assets[0],
      }));
    }
  };

  useEffect(() => {
    const fetchRestaurantData = async () => {
      const result = await getCurrentRestaurantData();
      
      if (result.success && result.data) {
        setRestaurantData(prev => ({
          ...prev,
          ...result.data,
          openingHours: result.data.openingHours || prev.openingHours,
        }));
      }
    };

    fetchRestaurantData();
  }, []);

  const updateField = (field, value) => {
    setRestaurantData(prev => ({ ...prev, [field]: value }));
  };

  const toggleClosed = (day) => {
    setRestaurantData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          closed: !prev.openingHours[day].closed,
        },
      },
    }));
  };

  const openTimePicker = (day, type) => {
    setPickerState({ show: true, day, type });
  };

  const handleTimeChange = (event, selectedDate) => {
    if (!selectedDate) return;
    setPickerState(prev => ({ ...prev, show: false }));

    const hours = selectedDate.getHours().toString().padStart(2, '0');
    const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
    const formatted = `${hours}:${minutes}`;

    setRestaurantData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [pickerState.day]: {
          ...prev.openingHours[pickerState.day],
          [pickerState.type]: formatted,
        },
      },
    }));
  };

  const handleSubmit = async () => {
    if (!restaurantData.name || !restaurantData.street || !restaurantData.phoneNumber) {
      Toast.show({
        type: 'error',
        text1: 'Vul alle verplichte velden in (naam, adres, telefoonnummer).',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Bereid restaurant data voor
      const restaurantDataToSave = {
        name: restaurantData.name,
        street: restaurantData.street,
        streetNr: restaurantData.streetNr,
        zipCode: restaurantData.zipCode,
        city: restaurantData.city,
        website: restaurantData.website,
        phoneNumber: restaurantData.phoneNumber,
        openingHours: restaurantData.openingHours,
        description: restaurantData.description,
      };

      // Bereid banner data voor
      const bannerData = {
        file: restaurantData.banner && typeof restaurantData.banner === 'object' ? restaurantData.banner : null
      };

      const result = await createRestaurant(restaurantDataToSave, bannerData);
      
      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'Restaurant gegevens bijgewerkt!',
          position: 'top',
          visibilityTime: 3000,
        });
        router.back();
      } else {
        Alert.alert('Fout', result.msg || 'Kon gegevens niet opslaan.');
      }
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Fout', 'Er is iets misgegaan bij het opslaan.');
    } finally {
      setLoading(false);
    }
  };

  const imageSource =
  restaurantData.banner && typeof restaurantData.banner === 'object'
    ? { uri: restaurantData.banner.uri }
    :  getBannerImageSrc(restaurantData.banner)

  return (
    <SafeAreaView className="flex-1 bg-white">
      {loading && (
        <View className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-20">
          <Loading />
        </View>
      )}
      
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView className="px-6 pt-4" contentContainerStyle={{ paddingBottom: 100 }}>
          <BackButton />

          <View className="mt-10 mb-4">
            <Text className="text-3xl font-bold text-gray-900 mb-1">Bewerk gegevens</Text>
            <Text className="text-gray-600">Pas je restaurantinformatie en openingstijden aan</Text>
          </View>

            {/* Afbeelding */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Productfoto *
            </Text>
            <TouchableOpacity
              onPress={onPickImage}
              className="bg-gray-100 border border-dashed border-blue-400 rounded-xl items-center justify-center mb-6"
              style={{width: wp(90), height: hp(20)}}
            >
                {restaurantData.banner ? (
                  <Image
                    source={imageSource}
                    className="w-full h-full rounded-xl"
                    resizeMode="cover"
                    transition={300}
                  />
                ) : (
                  <Text className="text-blue-400 font-semibold text-center">
                    Klik om een banner te uploaden
                  </Text>
                )}
            </TouchableOpacity>

          {/* Contactgegevens */}
          <View className="space-y-5 mt-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Restaurantnaam *</Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
              placeholder="Restaurantnaam *"
              placeholderTextColor="#999"
              value={restaurantData.name}
              onChangeText={text => updateField('name', text)}
            />
            <Text className="text-sm font-medium text-gray-700 mb-2">Adres *</Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
              placeholder="Straatnaam"
              placeholderTextColor="#999"
              value={restaurantData.street}
              onChangeText={text => updateField('street', text)}
            />
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
              placeholder="Plaats"
              placeholderTextColor="#999"
              value={restaurantData.city}
              onChangeText={text => updateField('city', text)}
            />

            <View className="flex-row gap-4 mb-4">
              <TextInput
                className="flex-1 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Nr"
                placeholderTextColor="#999"
                value={restaurantData.streetNr}
                onChangeText={text => updateField('streetNr', text)}
              />
              <TextInput
                className="flex-1 bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
                placeholder="Postcode"
                placeholderTextColor="#999"
                value={restaurantData.zipCode}
                onChangeText={text => updateField('zipCode', text)}
              />
            </View>

            <Text className="text-sm font-medium text-gray-700 mb-2">Telefoonnummer *</Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800 mb-4"
              placeholder="Telefoonnummer"
              placeholderTextColor="#999"
              value={restaurantData.phoneNumber}
              keyboardType="phone-pad"
              onChangeText={text => updateField('phoneNumber', text)}
            />
            <Text className="text-sm font-medium text-gray-700 mb-2">Website of Instagram</Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-800"
              placeholder="Website of Instagram"
              placeholderTextColor="#999"
              value={restaurantData.website}
              onChangeText={text => updateField('website', text)}
            />
          </View>

          {/* Openingstijden */}
          <View className="mt-10">
            <Text className="text-xl font-bold text-gray-900 mb-2">Openingstijden</Text>
            <Text className="text-gray-600 mb-4">Geef aan wanneer je open bent</Text>

            {days.map((day) => {
              const info = restaurantData.openingHours[day];
              return (
                <View key={day} className="mb-3 p-4 bg-gray-50 rounded-xl">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-base font-semibold text-gray-800">
                      {dayNames[day]}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleClosed(day)}
                      className={`px-3 py-1 rounded-full ${
                        info.closed ? 'bg-red-100' : 'bg-green-100'
                      }`}
                    >
                      <Text className={`text-sm font-medium ${info.closed ? 'text-red-600' : 'text-green-700'}`}>
                        {info.closed ? 'Gesloten' : 'Open'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {!info.closed && (
                    <View className="flex-row gap-4">
                      <TouchableOpacity
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        onPress={() => openTimePicker(day, 'start')}
                      >
                        <Text className="text-gray-700">Start: {info.start}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                        onPress={() => openTimePicker(day, 'end')}
                      >
                        <Text className="text-gray-700">Eind: {info.end}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Opslaan knop */}
        <View className="absolute bottom-6 left-6 right-6">
          <TouchableOpacity 
            className="bg-blue-500 py-4 rounded-2xl items-center"
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text className="text-white text-base font-semibold">
              {loading ? 'Opslaan...' : 'Opslaan'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Tijdkiezer */}
      {pickerState.show && (
        <View className="absolute bottom-0 left-0 right-0 bg-white z-50">
          <View className="flex-row justify-between px-6 pt-4 pb-2">
            <Pressable onPress={() => setPickerState(prev => ({ ...prev, show: false }))}>
              <Text className="text-blue-500 text-lg">Annuleer</Text>
            </Pressable>
            <Pressable onPress={() => setPickerState(prev => ({ ...prev, show: false }))}>
              <Text className="text-blue-500 text-lg">Klaar</Text>
            </Pressable>
          </View>
          <DateTimePicker
            mode="time"
            value={new Date()}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="dark"
            textColor="black"
            onChange={handleTimeChange}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default GegevensEditScreen;
