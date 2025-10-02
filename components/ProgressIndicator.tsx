// ProgressIndicator.tsx
import { hp, wp } from '@/helpers/common';
import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <SafeAreaView>
    <View className="bg-white p-4 shadow-md rounded-lg">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-800 font-semibold mb-4">
          Stap {currentStep} van {totalSteps}
        </Text>
        <Text className="text-gray-600 mt-4">{progressPercentage.toFixed(0)}% </Text>
      </View>

      {/* Progress Bar */}
      <View
        className="bg-gray-200 rounded-full overflow-hidden"
        style={{ width: wp(82), height: hp(1.2) }}
      >
        <View
          style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: '#3B82F6',
          }}
        />
      </View>
    </View>
    </SafeAreaView>
  );
}
