// components/ProdAvatar.tsx
import { StyleSheet } from 'react-native';
import React from 'react';
import { Image } from 'expo-image';
import { getProductImageSrc } from '@/backend/services/imageService';

const ProdAvatar = ({
  uri,
  size = 80,
  rounded = 12,
  style = {}
}) => {
  return (
    <Image
      source={getProductImageSrc(uri)}
      transition={300}
      style={[
        styles.image,
        { height: size, width: size, borderRadius: rounded },
        style
      ]}
      contentFit="cover"
    />
  );
};

export default ProdAvatar;

const styles = StyleSheet.create({
  image: {
    borderCurve: 'continuous',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    backgroundColor: '#f3f4f6'
  }
});
