// PostCreatePage.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { Video } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { Upload, Link, Trash } from "lucide-react-native";
import { useToast } from "react-native-toast-notifications";
import { useLocalSearchParams, useRouter } from "expo-router";
import { hp, wp } from "@/helpers/common";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/backend/AuthContext";
import { createPostWithVideos } from "@/backend/services/postService";
import Loading from "@/components/Loading";
import  Toast  from "react-native-toast-message";

interface VideoFile {
  id: string;
  uri: string;
  name: string;
  size: number;
  linkedProductId?: string;     // voor database
  linkedProductName?: string;   // voor UI
}

export default function PostCreatePage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [selectedVideos, setSelectedVideos] = useState<VideoFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [restaurantId, setRestaurantId] = useState(null);
  const [products, setProducts] = useState<{ id: string; productName: string }[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const toast = useToast();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { productId, videoId, productName } = params;

  useEffect(() => {
    const fetchProducts = async () => {
      const { data: restaurant, error: restaurantError } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner", user.id)
        .single();

      if (restaurantError || !restaurant) {
        Alert.alert("Fout bij ophalen restaurant.");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("id, productName")
        .eq("restaurantId", restaurant.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fout bij ophalen producten:", error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (videoId && productId) {
      setSelectedVideos((prev) =>
        prev.map((vid) =>
          vid.id === videoId ? { ...vid, linkedProduct: productName || productId } : vid
        )
      );
      router.replace("/(screens)/posten");
    }
  }, [videoId, productId]);

  useEffect(() => {
    const fetchRestaurantId = async () => {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner", user.id)
        .single();

      if (error || !data) {
        console.error("Fout bij ophalen restaurantId:", error);
        return;
      }

      setRestaurantId(data.id);
    };

    fetchRestaurantId();
  }, [user]);

  const handleVideoSelect = async () => {
    if (selectedVideos.length >= 5) {
      toast.show("Je mag maximaal 5 video's selecteren.", { type: "warning" });
      return;
    }

    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      toast.show("Toegang tot galerij is vereist.", { type: "danger" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsMultipleSelection: true,
      selectionLimit: 5,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const video = result.assets[0];
      const newVid: VideoFile = {
        id: Math.random().toString(36).substr(2, 9),
        uri: video.uri,
        name: video.fileName || "Video",
        size: video.fileSize || 0,
      };
      setSelectedVideos((prev) => (prev.length < 5 ? [...prev, newVid] : prev));
    }
  };

  const handleVideoDelete = (id: string) => {
    setSelectedVideos((prev) => prev.filter((v) => v.id !== id));
  };

  const handleLinkProduct = (videoId: string) => {
    setActiveVideoId(videoId === activeVideoId ? null : videoId);
  };

  const handleProductSelect = (productId: string, productName: string) => {
    setSelectedVideos((prev) =>
      prev.map((vid) =>
        vid.id === activeVideoId
          ? { ...vid, linkedProductId: productId, linkedProductName: productName }
          : vid
      )      
    );
    setActiveVideoId(null);
  };

  const handleSubmit = async () => {
    console.log('button geklikt');

    if(!title) {
      Toast.show({
        type: 'error',
        text1: 'Voeg een titel toe aan je post.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }

    if (selectedVideos.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Selecteer minimaal één video.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    

    for (const vid of selectedVideos) {
      if (!vid.linkedProductId) {
        Alert.alert(`Video "${vid.name}" heeft geen gekoppeld product.`);
        return;
      }
    }
    
    setLoading(true);

    const videosForUpload = selectedVideos.map((vid) => ({
      uri: vid.uri,
      linkedProduct: vid.linkedProductId!
    }));

    const result = await createPostWithVideos(title, restaurantId, videosForUpload);
    console.log('video post result: ', result);

    setLoading(false);

    if (result.success) {
      Toast.show({
        type: 'success',
        text1: `Post "${title}" succesvol opgeslagen!`,
        position: 'top',
        visibilityTime: 3000,
      });
      setTitle("");
      setSelectedVideos([]);
      router.replace("/(tabs)/home");
    } else {
      // toast.show(result.message || "Fout bij opslaan post.", { type: "danger" });
      Alert.alert('Er is iets mis gegaan: ', result.message)
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">

      {loading && (
        <View style={styles.loadingOverlay}>
          <Loading />
        </View>
      )}

      <View className="flex-row justify-between items-center px-5 py-4 mb-5">
        <TouchableOpacity
          className="bg-gray-200 rounded-lg w-28 h-12 justify-center items-center"
          onPress={() => router.back()}
        >
          <Text>Annuleren</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-blue-500 rounded-lg w-28 h-12 justify-center items-center"
          onPress={handleSubmit}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView className="mx-auto" style={{ width: wp(90) }}>
        <View className="bg-white rounded-lg shadow p-6 mb-6">
          <Text className="text-xl font-semibold mb-4">Post Details</Text>

          <View className="mb-6">
            <Text className="mb-2 font-medium">Titel *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Voer de titel van je post in..."
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded px-3 py-2"
            />
          </View>

          <View className="mb-6 border-2 border-dashed border-gray-300 rounded-lg p-6 items-center">
            <TouchableOpacity onPress={handleVideoSelect} className="items-center">
              <Upload color="#9CA3AF" size={48} />
              <Text className="text-lg font-medium text-gray-900 mt-4 mb-2">
                Video's uploaden (max. 5)
              </Text>
            </TouchableOpacity>
          </View>

          {selectedVideos.length > 0 && (
            <FlatList
              data={selectedVideos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View className="mb-6 bg-white rounded-lg shadow-sm p-4">
                  <Video
                    source={{ uri: item.uri }}
                    style={{ width: "100%", height: 200, borderRadius: 8 }}
                    useNativeControls
                    resizeMode="contain"
                    isLooping
                  />
                  <View className="flex-row justify-between items-center mt-2 mb-4">
                    <Text className="text-sm font-medium flex-1" numberOfLines={1}>
                      {item.name}
                    </Text>
                    <TouchableOpacity onPress={() => handleVideoDelete(item.id)}>
                      <Trash color="#EF4444" size={20} />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-xs text-gray-500">
                      {(item.size / (1024 * 1024)).toFixed(1)} MB
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleLinkProduct(item.id)}
                      className="flex-row items-center border border-gray-300 rounded px-2 py-3"
                    >
                      <Link color="#6B7280" size={12} />
                      <Text className="ml-1 text-xs text-gray-700 font-medium">
                        {item.linkedProductName ? `📦 ${item.linkedProductName}` : "Koppel Product"}
                      </Text>

                    </TouchableOpacity>
                  </View>

                  {activeVideoId === item.id && (
                    <View className="mt-4 border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                      {products.map((prod) => (
                        <TouchableOpacity
                          key={prod.id}
                          className="px-4 py-3 border-b border-gray-200"
                          onPress={() => handleProductSelect(prod.id, prod.productName)}
                        >
                          <Text className="text-gray-800">{prod.productName}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
});