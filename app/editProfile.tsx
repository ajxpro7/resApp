import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Save } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '@/backend/AuthContext';
import { uploadFile, getUserImageSrc } from '@/backend/services/imageService';
import { updateUserData } from '@/backend/services/userService';
import Loading from '@/components/Loading';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '@/components/BackButton';
import Toast from 'react-native-toast-message';

const EditProfile = () => {
  const router = useRouter();
  const { user: currentUser, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    name: '',
    phoneNumber: '',
    image: null,
    email: '',
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || '',
        phoneNumber: currentUser.phoneNumber || '',
        image: currentUser.image || null,
        email: currentUser.email || '',
      });
    }
  }, [currentUser]);

  const onPickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Toegang tot media is nodig.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setUser((prev) => ({
        ...prev,
        image: result.assets[0],
      }));
    }
  };

  const onSubmit = async () => {
    const { name, phoneNumber, bio, image } = user;
  
    if (!name || !phoneNumber) {
      Alert.alert('Bewerk profiel', 'Naam en telefoonnummer zijn verplicht.');
      return;
    }
  
    setLoading(true);
  
    try {
      let userData = { name, phoneNumber, bio, image };
  
      if (typeof image === 'object' && image?.uri) {
        const imageRes = await uploadFile('profiles', image.uri, true);
        if (imageRes.succes) userData.image = imageRes.data;
        else userData.image = null;
      }
  
      const res = await updateUserData(currentUser?.id, userData);
      if (res.succes) {
        setUserData({ ...currentUser, ...userData });
        Toast.show({
          type: 'success',
          text1: 'Profiel bijgewerkt!',
          position: 'top',
          visibilityTime: 3000,
        });
        router.replace('/profiel');
      } else {
        Alert.alert('Fout', res.msg || 'Bijwerken mislukt.');
      }
    } catch (err) {
      console.error('Fout bij updaten:', err);
      Alert.alert('Fout', 'Er is iets misgegaan tijdens het bijwerken.');
    } finally {
      setLoading(false);
    }
  };
  
  const imageSource =
    user.image && typeof user.image === 'object'
      ? { uri: user.image.uri }
      :  getUserImageSrc(user.image)

  return (
    <SafeAreaView  className="flex-1 bg-gray-100 px-6">
      <BackButton/>
      {loading && (
        <View style={styles.loadingOverlay}>
          <Loading />
        </View>
      )}

      {/* Profielfoto */}
      <View style={styles.avatarContainer}>
        <TouchableOpacity onPress={onPickImage}>
          <Image source={imageSource} style={styles.avatar} />
          <View style={styles.cameraIcon}>
            <Camera size={22} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.cameraHint}>Klik op het camera-icoon om je profielfoto te wijzigen</Text>
      </View>

      {/* Formulier */}
      <View style={styles.formBox}>
        <Text style={styles.label}>Naam</Text>
        <TextInput
          style={styles.input}
          value={user.name}
          onChangeText={value => setUser({ ...user, name: value })}
          placeholder="Voer je naam in"
        />

        <Text style={styles.label}>E-mailadres</Text>
        <TextInput
          style={[styles.input, styles.readOnly]}
          value={user.email}
          editable={false}
        />
        <Text style={styles.note}>Je e-mailadres kan niet worden gewijzigd</Text>

        <Text style={styles.label}>Telefoonnummer</Text>
        <TextInput
          style={styles.input}
          value={user.phoneNumber}
          onChangeText={value => setUser({ ...user, phoneNumber: value })}
          placeholder="06 12 34 56 78"
          placeholderTextColor="#9ca3af"
          keyboardType="phone-pad"
        />
      </View>

      {/* Opslaan */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.saveButton} onPress={onSubmit}>
          <Text style={styles.saveButtonText}>Wijzigingen</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>Annuleren</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 156,
    height: 156,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#e5e7eb',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 5,
    right: 15,
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 6,
  },
  cameraHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  formBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  readOnly: {
    backgroundColor: '#F3F4F6',
  },
  note: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  buttonGroup: {
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cancelButton: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
    color: '#1F2937',
  },
});
