import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BackButton = ({color, rounded}) => {

    const router = useRouter()

  return (
    <View>
      <TouchableOpacity style={{borderRadius: rounded}} onPress={() => router.back()} className="absolute top-4 left-2 z-10">
        <Ionicons name="arrow-back" size={30} color={color} />
      </TouchableOpacity>
    </View>
  )
}

export default BackButton