// imports blijven zoals jij ze hebt
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
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import { SafeAreaView } from "react-native-safe-area-context";
  import { KeyboardAvoidingView } from "react-native";
  import * as ImagePicker from "expo-image-picker";
  import { supabase } from "@/lib/supabase";
  import { createOrUpdateProduct } from "@/backend/services/productService";
  import { useAuth } from "@/backend/AuthContext";
import Loading from "@/components/Loading";
import { useRouter } from "expo-router";
import { hp, wp } from "@/helpers/common";
import  Toast  from "react-native-toast-message";
import BackButton from "@/components/BackButton";
  
  const ProdUpload = () => {
    const { user } = useAuth();
    const router = useRouter();
  
    const [product, setProduct] = useState({
      productName: "",
      ingredients: "",
      allergens: "",
      price: "",
      isAvailable: true,
      categoryId: null,
      image: null,
    });
  
    const [categories, setCategories] = useState([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [restaurantId, setRestaurantId] = useState(null);
  
    useEffect(() => {
      const fetchCategories = async () => {
        const { data, error } = await supabase.from("categories").select("*");
        if (error) {
          console.error("Fout bij ophalen categorieën:", error);
        } else {
          setCategories(data);
        }
      };
  
      fetchCategories();
    }, []);
  
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
        setProduct((prev) => ({ ...prev, image: result.assets[0] }));
      }
    };
  
    const resetForm = () => {
      setProduct({
        productName: "",
        ingredients: "",
        allergens: "",
        price: "",
        isAvailable: true,
        categoryId: null,
        image: null,
      });
    };

    useEffect(() => {
        const fetchRestaurant = async () => {
          if (!user?.id) return;
      
          const { data, error } = await supabase
            .from("restaurants")
            .select("id")
            .eq("owner", user.id)
            .single();
      
          if (error) {
            console.error("Kon restaurant niet ophalen:", error);
          } else {
            setRestaurantId(data.id);
          }
        };
      
        fetchRestaurant();
      }, [user]);
      
  
    const handleSubmit = async () => {
      if (
        !product.productName ||
        !product.price ||
        !product.categoryId ||
        !product.image
      ) {
        Toast.show({
          type: 'error',
          text1: 'Vul alle verplichte velden in.',
          position: 'top',
          visibilityTime: 3000,
        });
        return;
      }
  
      setLoading(true);
  
      const data = {
        file: { uri: product.image.uri, type: "image" },
        productName: product.productName,
        ingredients: product.ingredients,
        allergens: product.allergens,
        price: parseFloat(product.price),
        isActive: product.isAvailable,
        restaurantId: restaurantId,
        categoryId: product.categoryId,
      };
  
      const res = await createOrUpdateProduct(data);
      setLoading(false);
  
      if (res.succes) {
        Toast.show({
          type: 'success',
          text1: "✅ Product toegevoegd!",
          position: 'top',
          visibilityTime: 3000,
        });
        resetForm();
        router.back()
      } else {
        Alert.alert("❌ Mislukt", res.msg || "Probeer opnieuw");
      }
    };
  
    return (
      <SafeAreaView className="flex-1 bg-white">
        <BackButton/>
        {loading && (
                <View className="absolute inset-0 bg-white bg-opacity-70 flex justify-center items-center z-20">
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
              Nieuw product
            </Text>
            <Text className="text-gray-600 mb-8">
              Voeg een product toe aan je restaurant
            </Text>
  
            {/* Afbeelding */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Productfoto *
            </Text>
            <TouchableOpacity
              onPress={pickImage}
              className="bg-gray-100 border border-dashed border-blue-400 rounded-xl items-center justify-center mb-6"
              style={{width: wp(50), height: hp(20)}}
            >
              {product.image ? (
                <Image
                  source={{ uri: product.image.uri }}
                  className="w-full h-full rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-blue-400 font-semibold">
                  Klik om foto te uploaden
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
              placeholderTextColor="#9ca3af"
              value={product.productName}
              onChangeText={(text) => updateField("productName", text)}
            />
  
            {/* Ingrediënten */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Ingrediënten
            </Text>
            <TextInput
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 mb-4"
              placeholder="Bijv. kikkererwten, komkommer, hummus..."
              placeholderTextColor="#9ca3af"
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
              placeholderTextColor="#9ca3af"
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
              placeholder="Bijv. 7.50"
              placeholderTextColor="#9ca3af"
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
                value={product.isAvailable}
                onValueChange={(value) => updateField("isAvailable", value)}
                trackColor={{ false: "#ccc", true: "#60a5fa" }}
                thumbColor={product.isAvailable ? "#2563eb" : "#f4f3f4"}
              />
            </View>
  
            {/* Categorie */}
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Categorie *
            </Text>
            <TouchableOpacity
              className="bg-gray-100 border border-gray-300 rounded-xl px-4 py-3"
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text>
                {product.categoryId
                  ? categories.find((c) => c.id === product.categoryId)?.name
                  : "Selecteer een categorie"}
              </Text>
            </TouchableOpacity>
  
            {showCategoryPicker && (
              <View className="bg-white border border-gray-300 rounded-xl mt-2">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    className="px-4 py-3 border-b border-gray-100"
                    onPress={() => {
                      updateField("categoryId", cat.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text className="text-gray-800">{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
  
          {/* Uploadknop */}
          <View className="absolute bottom-6 left-6 right-6">
            <TouchableOpacity
              className="bg-blue-400 py-4 rounded-2xl items-center"
              onPress={handleSubmit}
            //   disabled={loading}
            >
                 <Text className="text-white text-base font-semibold">Product toevoegen</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  };
  
  export default ProdUpload;
  