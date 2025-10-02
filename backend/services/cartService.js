import { supabase } from "@/lib/supabase";

export const addToCart = async (productId, userId, restaurantId) => {
  try {
    const { data: existingItem, error: fetchError } = await supabase
      .from('winkelwagen')
      .select('*')
      .eq('productId', productId)
      .eq('userId', userId)
      .eq('restaurantId', restaurantId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.log('Fout bij controleren winkelwagen:', fetchError);
      return { success: false, msg: 'Kon winkelwagen niet controleren.' };
    }

    let newQuantity = 1;
    if (existingItem) {
      newQuantity = existingItem.quantity + 1;
    }

    const { data, error } = await supabase
      .from('winkelwagen')
      .upsert({
        productId,
        userId,
        restaurantId,
        quantity: newQuantity,
      }, { onConflict: ['productId', 'userId', 'restaurantId'] })
      .select()
      .single();

    if (error) {
      console.log('Fout bij upsert winkelwagen:', error);
      return { success: false, msg: 'Kan product niet toevoegen aan winkelwagen' };
    }

    return { success: true, data };
  } catch (error) {
    console.log('Add to cart error:', error);
    return { success: false, msg: 'Kan product niet toevoegen aan winkelwagen' };
  }
};

export const getCart = async (userId) => {
  const { data, error } = await supabase
    .from('winkelwagen')
    .select(`
      *,
      producten:productId (
        id,
        productName,
        price,
        file,
        ingredients,
        isActive
      )
    `)
    .eq('userId', userId);

  if (error) {
    console.error('Fout bij ophalen winkelwagen:', error);
    return { data: null, error };
  }

  return { data, error: null };
};

export const deleteCartItem = async (productId, userId, restaurantId) => {
  try {
    const { error } = await supabase
      .from('winkelwagen')
      .delete()
      .eq('productId', productId)
      .eq('userId', userId)
      .eq('restaurantId', restaurantId);

    if (error) {
      console.error('Fout bij verwijderen uit winkelwagen:', error);
      return { success: false, msg: 'Kan product niet verwijderen uit winkelwagen' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete cart item error:', error);
    return { success: false, msg: 'Kan product niet verwijderen uit winkelwagen' };
  }
};

export const updateQuantity = async (productId, userId, restaurantId, newQuantity) => {
  try {
    const { error } = await supabase
      .from('winkelwagen')
      .update({ quantity: newQuantity })
      .eq('productId', productId)
      .eq('userId', userId)
      .eq('restaurantId', restaurantId);

    if (error) {
      console.error('Fout bij bijwerken aantal in winkelwagen:', error);
      return { success: false, msg: 'Kan aantal niet bijwerken' };
    }

    return { success: true };
  } catch (error) {
    console.error('Update quantity error:', error);
    return { success: false, msg: 'Kan aantal niet bijwerken' };
  }
};

export const clearCart = async (userId, restaurantIds = null) => {
  let query = supabase.from('winkelwagen').delete().eq('userId', userId);
  if (restaurantIds && Array.isArray(restaurantIds) && restaurantIds.length > 0) {
    query = query.in('restaurantId', restaurantIds);
  }
  const { error } = await query;
  return !error;
};
