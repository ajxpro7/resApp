import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import ProdAvatar from './ProdAvatar';

interface Product {
  id: string;
  productName: string;
  file: string;
  price: number;
  isActive: boolean;
  ingredients?: string[];
}

interface ProductCardProps {
  product: Product;
  onPress?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  showAddToCartButton?: boolean;
  pressable?: boolean;
}

const ProductCard = ({
  product,
  onPress,
  onAddToCart,
  showAddToCartButton = false,
  pressable = true,
}: ProductCardProps) => {
  return (
    <TouchableOpacity
      disabled={!pressable}
      onPress={pressable && onPress ? () => onPress(product) : undefined}
      className="bg-white rounded-2xl shadow-sm p-4 mb-4 flex-row"
    >
      {/* Afbeelding */}
      <ProdAvatar uri={product.file} size={80} rounded={12} style={{}} />

      {/* Content */}
      <View className="flex-1 ml-3 justify-between">
        {/* Titel + prijs */}
        <View className="flex-row justify-between items-start">
          <Text className="text-base font-semibold text-gray-900">
            {product.productName}
          </Text>
          <Text className="text-lg font-bold text-blue-400">
            € {product.price.toFixed(2)}
          </Text>
        </View>

        {/* Ingrediënten */}
        {product.ingredients && (
          <Text className="text-sm text-gray-500 mt-1">
            {product.ingredients}
          </Text>
        )}
        {/* Statuslabel */}
        <View style={{ marginTop: 8 }}>
          <Text style={{
            color: product.isActive ? '#22c55e' : '#ef4444',
            fontWeight: 'bold',
            fontSize: 14,
          }}>
            {product.isActive ? 'Actief' : 'Inactief'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
