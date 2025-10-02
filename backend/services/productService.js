import { supabase } from "@/lib/supabase";
import { uploadFile } from "./imageService";

export const createOrUpdateProduct = async (product) => {
  try {
    // Upload afbeelding als bestand is meegegeven
    if (product.file && typeof product.file === "object") {
      const uploadRes = await uploadFile("productImages", product.file.uri, true);
      if (uploadRes.succes) {
        product.file = uploadRes.data; // vervang door pad naar Storage
      } else {
        return { succes: false, msg: uploadRes.msg };
      }
    }

    const payload = {
      productName: product.productName, // let op: camelCase
      file: product.file, // string path
      ingredients: product.ingredients,
      allergens: product.allergens,
      price: product.price,
      isActive: product.isActive,
      restaurantId: product.restaurantId, // FK
      categoryId: product.categoryId,     // FK
      ...(product.id && { id: product.id }),
    };

    console.log("Payload naar Supabase:", payload);

    const { data, error } = await supabase
      .from("products")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.error("Supabase fout:", error);
      return { succes: false, msg: error.message || "Product upload mislukt" };
    }

    return { succes: true, data };
  } catch (err) {
    console.error("Upload error:", err);
    return { succes: false, msg: "Upload mislukt, probeer opnieuw." };
  }
};

export const fetchProducts = async (restaurantId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('restaurantId', restaurantId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.log('Product fetch error:', error);
      return { success: false, msg: 'Kan producten niet ophalen' };
    }

    return { success: true, data };
  } catch (error) {
    console.log('Product fetch error:', error);
    return { success: false, msg: 'Kan producten niet ophalen' };
  }
};