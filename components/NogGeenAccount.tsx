import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { hp, wp } from '@/helpers/common';

const NogGeenAccount = () => {
  const handleSignup = () => alert('Account aanmaken');
  const handleLogin = () => alert('Inloggen');

  return (
    <View className="bg-white flex-1 items-center justify-center px-6 mb-4">
      <View className="bg-gray-100 w-full rounded-2xl px-5 py-6 shadow-md"
      style={{width: wp(89), height: hp(30)}} 
      >
        {/* Header */}
        <View className="flex-row justify-between items-start">
          <View className="flex-1 pr-4">
            <Text className="text-xl font-bold text-gray-900 mb-2 mt-6">
              Meld je aan voor meer voordelen
            </Text>
            <View className="space-y-1">
              <Text className="text-gray-700 text-sm">• Ontvang kortingen & beloningen</Text>
              <Text className="text-gray-700 text-sm">• Sneller bestellen met opgeslagen info</Text>
              <Text className="text-gray-700 text-sm">• Bestellingen volgen & opnieuw bestellen</Text>
            </View>
          </View>

          {/* <Ionicons name="lock-open-outline" size={40} color="#f97316" /> */}
        </View>

        {/* Buttons */}
        <View className="mt-6 space-y-3">
          <TouchableOpacity
            onPress={handleSignup}
            className="bg-black py-3 rounded-full mb-2"
          >
            <Text className="text-white text-center font-semibold text-base">
              Account aanmaken
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            className="py-3 rounded-full"
            style={{backgroundColor: '#AEB6BF'}}
          >
            <Text className="text-white text-center font-semibold text-base">
              Inloggen
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default NogGeenAccount;
