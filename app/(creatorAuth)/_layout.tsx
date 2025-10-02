// app/(creatorAuth)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { RestaurantFormProvider } from './RestaurantFormContext'; // 👈 pas het pad aan indien nodig

export default function AuthLayout() {
  return (
    <RestaurantFormProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#f9fafb" }, // bg-gray-50
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="creatorSignup" options={{headerShown: false}} />
        <Stack.Screen name="step0" options={{headerShown: false}} />
        <Stack.Screen name="step1" options={{headerShown: false}} />
        <Stack.Screen name="step2" options={{headerShown: false}} />
        <Stack.Screen name="step3" options={{headerShown: false}} />
        <Stack.Screen name="step4" options={{headerShown: false}} />
        <Stack.Screen name="RestaurantFormContext" options={{headerShown: false}} />
        <Stack.Screen name="gegevensEdit" options={{headerShown: false}} />
      </Stack>
    </RestaurantFormProvider>
  );
}
