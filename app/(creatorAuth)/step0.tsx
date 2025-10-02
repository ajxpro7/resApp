import React, { useState } from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { supabaseAnonKey, supabaseUrl } from '@/constants/supabaseUrl';
import { loadAsync } from 'expo-font';
import Loading from '@/components/Loading';
import { useAuth } from '@/backend/AuthContext';
import Colors from '@/constants/Colors';

const StripeConnectOnboarding = () => {
  const [loading, setIsLoading] = useState(false);
  const {user} = useAuth();

  // Initialize Supabase client
  const supabase = createClient(
    supabaseUrl, supabaseAnonKey
  );

  const initiateStripeConnectOnboarding = async () => {
    setIsLoading(true);

    try {
      // Invoke the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('stripe-connect-onboarding', {
        body: JSON.stringify({ restaurant_id: user?.id })
      });

      if (error) throw error;

      // Open the Stripe onboarding link
      const result = await WebBrowser.openBrowserAsync(data.url);

      // Handle the result of the browser session
      if (result.type === 'cancel') {
        Alert.alert('Onboarding Cancelled', 'You did not complete the Stripe Connect setup');
      }

    } catch (err) {
      Alert.alert('Error', err.message);
      console.log(err)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className='flex-1 justify-center align-center' style={{backgroundColor: Colors.darkBg}}>
      {loading && (
        <View style={styles.loadingOverlay}>
        <Loading />
      </View>
      )}
      <Button 
        title="Set Up Stripe Connect for Restaurant" 
        onPress={initiateStripeConnectOnboarding}
      />
    </View>
  );
};

export default StripeConnectOnboarding;

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});