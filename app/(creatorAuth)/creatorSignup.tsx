import React, { useRef, useState, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, View, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { wp, hp } from '@/helpers/common';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import BackButton from '@/components/BackButton';
import { supabase } from '@/lib/supabase';
import Loading from '@/components/Loading';

import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

import { androidClientId, webClientId, iosClientId } from '@/constants/supabaseUrl';

WebBrowser.maybeCompleteAuthSession();

// const redirectUri = 'https://auth.expo.io/@siep7/resApp';
const redirectUri = AuthSession.makeRedirectUri({
  useProxy: true,
  native: 'resapp://redirect', // voor future use (standalone apps)
});
// console.log('Redirect URI (fixed):', redirectUri);


const Signup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const nameRef = useRef('');
  const emailRef = useRef('');
  const passwordRef = useRef('');

  // Google auth
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId,
    iosClientId: iosClientId,
    androidClientId: androidClientId,
    redirectUri,
  });

  useEffect(() => {
    const signInWithGoogle = async () => {
      if (response?.type === 'success') {

        if (response?.type === 'success') {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
          });
        
          if (error) {
            Alert.alert('Google Login', error.message);
          } else {
            router.replace('/(tabs)/profiel');
          }
        }        
      }
    };

    signInWithGoogle();
  }, [response]);

  const handleSignup = async () => {
    if (!nameRef.current || !emailRef.current || !passwordRef.current) {
      Alert.alert('Fout', 'Vul alle velden in!');
      return;
    }

    if (passwordRef.current.length < 8) {
      Alert.alert('Fout', 'Wachtwoord moet minimaal 8 karakters lang zijn');
      return;
    }

    const name = nameRef.current.trim();
    const email = emailRef.current.trim();
    const password = passwordRef.current.trim();

    setLoading(true);

    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          email,
          isCreator: true
        },
      },
    });

    setLoading(false);

    if (error) {
      Alert.alert('Sign up', error.message);
    } else {
      router.replace('/(creatorAuth)/step1')
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      <BackButton />

      {loading && (
        <View style={styles.loadingOverlay}>
          <Loading />
        </View>
      )}

      <View className="items-center mt-16">
        <Image
          source={require('@/assets/images/welkom.jpeg')}
          style={{
            width: wp(40),
            height: wp(40),
            borderRadius: wp(20),
            marginBottom: hp(2),
          }}
          resizeMode="cover"
        />
        <Text className="text-3xl font-bold text-gray-800 mb-2">Maak een account aan</Text>
      </View>

      <View className="mt-6">
        <TextInput
          placeholder="Eigenaar Naam"
          placeholderTextColor="#9ca3af"
          onChangeText={(text) => (nameRef.current = text)}
          className="bg-gray-100 rounded-xl px-4 py-4 text-base mb-4"
        />
        <TextInput
          placeholder="E-mail"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          onChangeText={(text) => (emailRef.current = text)}
          className="bg-gray-100 rounded-xl px-4 py-4 text-base mb-4"
        />
        <TextInput
          placeholder="Wachtwoord"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          onChangeText={(text) => (passwordRef.current = text)}
          className="bg-gray-100 rounded-xl px-4 py-4 text-base mb-4"
          style={{marginBottom: 40}}
        />

        <Button
          title="Sign Up"
          bgColor="bg-blue-500"
          textColor="text-white"
          onPress={handleSignup}
        />

        <Text className="text-center my-4 text-gray-500">Of meld je aan met</Text>

        <View className="flex-row justify-center space-x-6 mb-6">
          <TouchableOpacity
            className="bg-white p-4 rounded-full shadow"
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <FontAwesome name="google" size={24} color="#DB4437" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center">
          <Text className="text-gray-500">Heb je al een account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text className="text-blue-500 font-semibold">Log in</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});

export default Signup;
