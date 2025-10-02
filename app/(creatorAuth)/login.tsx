import React, { useRef, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, Image, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { wp, hp } from '@/helpers/common';
import { useRouter } from 'expo-router';
import Button from '@/components/Button';
import BackButton from '@/components/BackButton';
import { supabase } from '@/lib/supabase';
import Loading from '@/components/Loading';

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const emailRef = useRef('');
  const passwordRef = useRef('');

  const handleLogin = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Fout', 'Vul alle velden in!');
      return;
    }
    
    if (passwordRef.current.length < 8) {
      Alert.alert('Fout', 'Wachtwoord moet minimaal 8 karakters lang zijn');
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false); // Zet loading altijd uit na login-aanroep

    if (error) {
      Alert.alert('Login', error.message);
      return;
    }

    // Haal de user info op uit de users-tabel
    const userId = data?.user?.id;
    if (!userId) {
      setLoading(false);
      Alert.alert('Login', 'Gebruiker niet gevonden.');
      return;
    }

    // Query de users-tabel op id
    const { data: userRows, error: userError } = await supabase
      .from('users')
      .select('isCreator')
      .eq('id', userId)
      .single();

    if (userError) {
      setLoading(false);
      Alert.alert('Login', 'de email of wachtwoord is incorrect');
      // Log direct uit voor de zekerheid
      await supabase.auth.signOut();
      return;
    }

    if (!userRows?.isCreator) {
      setLoading(false);
      Alert.alert('Login', 'Alleen creators kunnen hier inloggen.');
      // Log direct uit
      await supabase.auth.signOut();
      return;
    }

    setLoading(false);
    // Hier kan je eventueel router.push doen naar de juiste pagina
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6">
      {/* Terugknop */}
        <BackButton/>

        {loading && (
          <View style={styles.loadingOverlay}>
            <Loading size={300} />
          </View>
        )}

      <View className="items-center mt-10">
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
        <Text className="text-3xl font-bold text-gray-800 mb-1">Welkom terug!</Text>
        <Text className="text-base text-gray-500">Log in als klant of creator</Text>
      </View>

      <View className="mt-8">
        <TextInput
          placeholder="E-mail"
          placeholderTextColor="#9ca3af"
          onChangeText={(text) => emailRef.current = text}
          className="bg-gray-100 rounded-xl px-4 py-4 text-base mb-4"
        />
        <TextInput
          placeholder="Wachtwoord"
          placeholderTextColor="#9ca3af"
          secureTextEntry
           onChangeText={(text) => passwordRef.current = text}
          className="bg-gray-100 rounded-xl px-4 py-4 text-base mb-4"
          style={{marginBottom: 40}}
        />

        <Button
          title="Log in"
          bgColor="bg-blue-500"
          textColor="text-white"
          onPress={handleLogin}
        />

        <Text className="text-center my-4 text-gray-500">Of log in met</Text>

        <View className="flex-row justify-center space-x-6 mb-6">
          <TouchableOpacity className="bg-white p-4 mr-8 rounded-full shadow">
            <FontAwesome name="facebook" size={24} color="#3b5998" />
          </TouchableOpacity>
          <TouchableOpacity className="bg-white p-4 rounded-full shadow">
            <FontAwesome name="google" size={24} color="#DB4437" />
          </TouchableOpacity>
        </View>

        {/* Geen account? */}
        <View className="flex-row justify-center">
          <Text className="text-gray-500">Heb je nog geen account? </Text>
          <TouchableOpacity onPress={() => router.push('signup')}>
            <Text className="text-blue-500 font-semibold">Registreer</Text>
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

export default Login;
