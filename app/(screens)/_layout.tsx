import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const _Layout = () => {
  return (
    <Stack>
       <Stack.Screen name='prodOverzicht' options={{headerShown: false}}/>
       <Stack.Screen name='prodEdit' options={{headerShown: false, presentation: 'modal'}}/>
       <Stack.Screen name='prodUpload' options={{headerShown: false, presentation: 'modal'}}/>
       <Stack.Screen name='posten' options={{headerShown: false}}/>
       <Stack.Screen name='gemaaktePost' options={{headerShown: false}}/>
    </Stack>
  )
}

export default _Layout