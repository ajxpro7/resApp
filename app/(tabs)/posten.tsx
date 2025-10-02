import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import { Video, UploadCloud, Pencil, Menu, Shield } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAuth } from '@/backend/AuthContext';
import { supabase } from '@/lib/supabase';
import { getCurrentRestaurantData } from '@/backend/services/userService';

const UploadOverzicht = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check verificatie status
  useEffect(() => {
    const checkVerification = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Haal restaurant gegevens op
        const restRes = await getCurrentRestaurantData();
        if (!restRes.success || !restRes.data) {
          setIsVerified(false);
          setLoading(false);
          return;
        }

        const restaurant = restRes.data;
        
        // Check of alle verplichte velden zijn ingevuld (behalve website)
        const requiredFields = [
          restaurant.name,
          restaurant.street,
          restaurant.streetNr,
          restaurant.zipCode,
          restaurant.city,
          restaurant.phoneNumber,
          restaurant.openingHours,
          restaurant.description
        ];

        const allFieldsFilled = requiredFields.every(field => 
          field && field.toString().trim() !== ''
        );

        setIsVerified(allFieldsFilled);
      } catch (error) {
        console.error('Error checking verification:', error);
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
  }, [user?.id]);

  const options = [
    {
      label: 'Video Posten',
      icon: <Video color={Colors.text} size={22} />,
      route: '/(screens)/posten',
    },
    {
      label: 'Gemaakte posts',
      icon: <Menu color={Colors.text} size={22} />,
      route: '/(screens)/gemaaktePost',
    },
    {
      label: 'Product Uploaden',
      icon: <UploadCloud color={Colors.text} size={22} />,
      route: '/(screens)/prodUpload',
    },
    {
      label: 'Product Wijzigen',
      icon: <Pencil color={Colors.text} size={22} />,
      route: '/(screens)/prodOverzicht',
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.text, fontSize: 16 }}>Laden...</Text>
      </SafeAreaView>
    );
  }

  if (!isVerified) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg, paddingHorizontal: 24 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles.verificationCard}>
            <Shield color={Colors.blue} size={48} />
            <Text style={styles.verificationTitle}>Verificatie Vereist</Text>
            <Text style={styles.verificationText}>
              Je moet eerst je restaurant gegevens volledig invullen voordat je posts kunt maken.
            </Text>
            <TouchableOpacity
              style={styles.verificationButton}
              onPress={() => router.push('/(creatorAuth)/step0')}
            >
              <Text style={styles.verificationButtonText}>Verifiëren</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.darkBg, paddingHorizontal: 24 }}>
      <View style={{ marginTop: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors.text, marginBottom: 8 }}>Upload Overzicht</Text>
        <Text style={{ fontSize: 16, color: Colors.textSecondary }}>
          Upload eerst het product dat je wilt gebruiken voordat je een post maakt.
        </Text>
      </View>

      <View style={{ marginTop: 32 }}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => router.push(option.route)}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>{option.icon}</View>
            <Text style={styles.cardText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'white',
  },
  iconCircle: {
    backgroundColor: Colors.blue,
    borderRadius: 999,
    padding: 10,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  verificationCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.blue,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  verificationTitle: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  verificationText: {
    color: Colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  verificationButton: {
    backgroundColor: Colors.blue,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  verificationButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadOverzicht;
