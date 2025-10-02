import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { View } from './Themed';
import Loading from './Loading';

const Button = ({ 
  title,
   bgColor = 'bg-white',
    textColor = 'text-blue-500',
     onPress,
     loading = false,
     }) => {
  // const [loading, isLoading] = useState(true);

  if (loading) {
    return (
      <View className="w-full max-w-[280px] mb-6 items-center justify-center py-4 px-6 rounded-full shadow-md">
        <Loading />
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`w-full max-w-[280px] mb-6 items-center justify-center py-4 px-6 rounded-full shadow-md ${bgColor}`}
    >
      <Text className={`text-lg font-semibold ${textColor}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
