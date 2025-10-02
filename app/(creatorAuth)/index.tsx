import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Button from '@/components/Button';
import { useRouter } from 'expo-router';
import ScreenWrappper from '@/components/ScreenWrapper'
import { theme } from '@/constants/theme';
import BackButton from '@/components/BackButton';
import { SafeAreaView } from 'react-native-safe-area-context';

const Welkom = () => {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-blue-400 px-6"> 
      <View className="flex-1 items-center justify-center px-6">
        
        <View className="w-full aspect-square max-w-[320px] mb-10">
          <Image
            source={require('@/assets/images/welkom.jpeg')}
            className="w-full h-full rounded-3xl shadow-lg"
            resizeMode="cover"
          />
        </View>

        <Text className="text-white text-3xl font-bold mb-16 text-center">
          Welkom bij Scroll & Bite voor Creators!
        </Text>

        <Button
          title="Beginnen"
          bgColor="bg-white"
          textColor="text-blue-500"
          onPress={() => router.push('/(creatorAuth)/creatorSignup')}
        />

      </View>
    </SafeAreaView>
  );
};

export default Welkom;
