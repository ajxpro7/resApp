import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ProdAvatar from './ProdAvatar';

interface WKProductCartProps {
  item: any;
  onUpdateQuantity: (id: string, newQty: number) => void;
  handleDeleteCartItem: (id: string) => void;
}

const WKProductCart = ({ item, onUpdateQuantity, handleDeleteCartItem }: WKProductCartProps) => {
  const { id, quantity, producten } = item;
  const { productName, price, file, ingredients } = producten || {};

  console.log('result: ', producten)

  return (
    <View className="flex-row items-center bg-white rounded-xl p-4 mb-4 border border-gray-200 space-x-3">
        <ProdAvatar uri={file} className="w-20 h-20 rounded-xl" />
      <View className="flex-1 ml-2">
        <Text className="font-semibold text-gray-900 text-base">
          {productName}
        </Text>
        <Text className="text-sm text-gray-500">{ingredients}</Text>
        <Text className="font-bold text-blue-600 mt-1">€{price.toFixed(2)}</Text>
      </View>
      <View className="flex-row items-center ml-2">
        <TouchableOpacity
          onPress={() => onUpdateQuantity(id, quantity - 1)}
          className="w-7 h-7 rounded-full bg-gray-100 items-center justify-center"
        >
          <Feather name="minus" size={26} />
        </TouchableOpacity>
        <Text className="mx-2 font-semibold text-gray-800 text-lg ml-2">{quantity}</Text>
        <TouchableOpacity
          onPress={() => onUpdateQuantity(id, quantity + 1)}
          className="w-7 h-7 rounded-full bg-blue-500 items-center justify-center ml-2"
        >
          <Feather name="plus" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteCartItem(id)}
          className="ml-3 w-8 h-8 rounded-full bg-red-100 items-center justify-center"
        >
          <Feather name="trash-2" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WKProductCart;
