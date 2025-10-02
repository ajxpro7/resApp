import { StyleSheet } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'
import { getUserImageSrc } from '@/backend/services/imageService'

const Avatar = ({
    uri,
    size=20,
    rounded=10,
    style={}
}) => {
  return (
    <Image
    source={getUserImageSrc(uri )}
    transition={300}
    style={[styles.avatar, {height: size, width: size, borderRadius: rounded}, style]}
     />
  )
}

export default Avatar

const styles = StyleSheet.create({
    avatar: {
        borderCurve: 'continuous',
        borderColor: '#E5E7EB',
        borderWidth: 1
    }
})