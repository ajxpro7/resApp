// app/prodEdit.tsx
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Switch,
    Platform,
    Image,
    Alert,
    ActivityIndicator,
    StyleSheet,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { KeyboardAvoidingView } from "react-native";
  import * as ImagePicker from "expo-image-picker";
  import { useLocalSearchParams, useRouter } from "expo-router";
  import { supabase } from "@/lib/supabase";
  import { useAuth } from "@/backend/AuthContext";
  import { createOrUpdateProduct } from "@/backend/services/productService";
import ProdAvatar from "@/components/ProdAvatar";
import Loading from "@/components/Loading";
import { getProductImageSrc } from "@/backend/services/imageService";
import { hp, wp } from "@/helpers/common";
import  Toast  from "react-native-toast-message";
import BackButton from "@/components/BackButton";
import { Colors } from "react-native/Libraries/NewAppScreen";

  
  const ProductEditPage = () => {
    const { productId } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    console.log('Ontvangen productId:', productId);
  
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categoryName, setCategoryName] = useState("");
  
    useEffect(() => {
      const fetchProduct = async () => {
        if (!productId || !user?.id) return;
  
        const { data, error } = await supabase
          .from("products")
          .select("*, categories(name), restaurants(owner)")
          .eq("id", productId)
          .single();
  
        if (error || !data) {
          console.error("Fout bij ophalen product:", error);
          Alert.alert("Fout", "Kan product niet ophalen.");
          setLoading(false);
          return;
        }
  
        if (data.restaurants?.owner !== user.id) {
          Alert.alert("Toegang geweigerd", "Je kunt dit product niet bewerken.");
          router.replace("/");
          return;
        }
  
        setProduct({
          id: data.id,
          productName: data.productName,
          ingredients: data.ingredients,
          allergens: data.allergens,
          price: data.price.toString(),
          isActive: data.isActive, 
          file: data.file,
          restaurantId: data.restaurantId,
          categoryId: data.categoryId,
        });
  
        setCategoryName(data.categories?.name || "–");
        setLoading(false);
      };
  
      fetchProduct();
    }, [productId, user]);
  
    const updateField = (key, value) => {
      setProduct((prev) => ({ ...prev, [key]: value }));
    };
  
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.7,
          allowsEditing: true,
          aspect: [1, 1],
        });
      
        if (!result.canceled) {
          setProduct((prev) => ({ ...prev, file: result.assets[0] }));
        }
      };
      
  
    const handleSave = async () => {
      if (!product.productName || !product.price) {
        Alert.alert("Vul alle verplichte velden in.");
        return;
      }
  
      setLoading(true);
  
      const res = await createOrUpdateProduct({
        ...product,
        price: parseFloat(product.price),
      });
  
      setLoading(false);
  
      if (res.succes) {
        Toast.show({
          type: 'success',
          text1: "✅ Product bijgewerkt",
          position: 'top',
          visibilityTime: 3000,
        });
        router.back();
      } else {
        Alert.alert("❌ Mislukt", res.msg || "Probeer opnieuw");
      }
    };
  
    if (!productId) {
      return (
        <View className="flex-1 items-center justify-center bg-white px-6">
          <Text className="text-center text-lg text-red-600">
            Geen product geselecteerd om te bewerken.
          </Text>
        </View>
      );
    }
  
    if (loading) {
      return (
        <View className="flex-1 items-center justify-center bg-white">
          <ActivityIndicator size="large" color="#60a5fa" />
          <Text className="mt-4 text-gray-600">Product wordt geladen...</Text>
        </View>
      );
    }

    const imageSource = product.file
    ? typeof product.file === "object"
      ? { uri: product.file.uri }
      : getProductImageSrc(product.file)
    : null;
  
  
    return (
      <SafeAreaView className="flex-1" style={{backgroundColor: Colors.darkBg}}>
        {loading && (
        <View style={styles.loadingOverlay}>
          <Loading />
        </View>
      )}
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 120 }}
            className="flex-1 px-6 pt-4"
          >
            <Text className="text-3xl font-bold text-gray-900 mb-2 mt-16">
              Product bewerken
            </Text>
            <Text className="text-gray-600 mb-8">
              Pas de gegevens van je product aan
            </Text>
  
            {/* Afbeelding */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Productfoto
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              className="bg-gray-100 border border-dashed border-blue-400 rounded-xl items-center justify-center mb-6"
              style={{width: wp(50), height: hp(20)}}
            >
                {product.file ? (
                     <Image
                     source={imageSource}
                     className="w-full h-full rounded-xl"
                     resizeMode="cover" />
                ) : (
                <Text className="text-blue-400 font-semibold">
                    Klik om foto te wijzigen
                </Text>
                )}

            </TouchableOpacity>
  
            {/* Naam */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Productnaam *
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Bijv. Falafel wrap"
              value={product.productName}
              onChangeText={(text) => updateField("productName", text)}
            />
  
            {/* Ingrediënten */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Ingrediënten
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Bijv. hummus, komkommer"
              multiline
              value={product.ingredients}
              onChangeText={(text) => updateField("ingredients", text)}
            />
  
            {/* Allergenen */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Allergieën
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Bijv. gluten, noten"
              multiline
              value={product.allergens}
              onChangeText={(text) => updateField("allergens", text)}
            />
  
            {/* Prijs */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Prijs (€) *
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Bijv. 8.50"
              keyboardType="decimal-pad"
              value={product.price}
              onChangeText={(text) => updateField("price", text)}
            />
  
            {/* Beschikbaarheid */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-sm font-medium text-gray-700">
                Is product beschikbaar?
              </Text>
              <Switch
                value={product.isActive}
                onValueChange={(value) => updateField("isActive", value)} // ✅ gebruik isActive
                trackColor={{ false: "#ccc", true: "#60a5fa" }}
                thumbColor={product.isActive ? "#2563eb" : "#f4f3f4"}
                />

            </View>
  
            {/* Categorie (alleen tonen) */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Categorie (niet wijzigbaar)
            </Text>
            <View className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 mb-6">
              <Text className="text-gray-700">{categoryName}</Text>
            </View>
          </ScrollView>
  
          {/* Opslaan */}
          <View className="absolute bottom-6 left-6 right-6">
            <TouchableOpacity
              className="bg-blue-500 py-4 rounded-2xl items-center"
              onPress={handleSave}
              disabled={saving}
            >
              <Text className="text-white text-base font-semibold">
                {saving ? "Opslaan..." : "Wijzigingen opslaan"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };
  
  export default ProductEditPage;
  
  const styles = StyleSheet.create({
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 20,
    },
  });