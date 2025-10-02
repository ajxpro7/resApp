import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter } from 'expo-router';
import 'react-native-reanimated';
import "../global.css";

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/backend/AuthContext';
import { supabase } from '@/lib/supabase';
import Loading from '@/components/Loading';
import { TouchableOpacity, Text, Platform } from 'react-native';
import {getUserData} from "@/backend/services/userService";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { syncUserAddress } from '@/helpers/storage';
import { Colors } from '@/constants/Colors';

// Zorg dat splash niet automatisch verdwijnt
SplashScreen.preventAutoHideAsync();

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Platform specifieke toast hoogte
const getToastMarginTop = () => {
  return Platform.OS === 'ios' ? 20 : 0; // iOS: hoger, Android: lager
};

// Custom toast configuratie
const toastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#4CAF50', 
        backgroundColor: '#E8F5E8',
        marginTop: getToastMarginTop(), // Platform specifiek
        marginHorizontal: 20,
        borderRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#2E7D32'
      }}
      text2Style={{
        fontSize: 14,
        color: '#388E3C'
      }}
    />
  ),
  error: (props) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: '#F44336', 
        backgroundColor: '#FFEBEE',
        marginTop: getToastMarginTop(), // Platform specifiek
        marginHorizontal: 20,
        borderRadius: 8,
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#C62828'
      }}
      text2Style={{
        fontSize: 14,
        color: '#D32F2F'
      }}
    />
  ),
};

// ✅ AppLayout met font loading & splash control
export default function AppLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return <Loading />;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { setAuth, setUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {

    const updateUserData = async (user, email) => {
      let res = await getUserData(user?.id);
      if (res.succes) setUserData({...res.data, email});

      // Adres sync met nieuwe logica
      if (user?.id) {
        await syncUserAddress(user.id);
      }
    };
    
    supabase.auth.onAuthStateChange((_event, session) => {
      // console.log('session: ', session);

      if (session) {
        setAuth(session.user);
        updateUserData(session?.user, session?.user?.email);
        router.replace('(tabs)/home'); // Correcte route als je homepagina in (tabs) staat
      } else {
        setAuth(null);
        router.replace('/(creatorAuth)')
      }
    });
  }, []);

  // Custom dark theme gebaseerd op React Navigation DarkTheme
  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: Colors.darkBg,
      card: Colors.cardBg,
      text: Colors.text,
      border: Colors.border,
      primary: Colors.blue,
      notification: Colors.error,
    },
  };

  return ( 
  <>
    <ThemeProvider value={customDarkTheme}>
      <Stack>
        <Stack.Screen name="(creatorAuth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="editProfile" options={{ headerShown: false }} />
        <Stack.Screen name="(screens)" options={{ headerShown: false }} />
        <Stack.Screen name="menu" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
    <Toast config={toastConfig} />
    </>
  );
}
