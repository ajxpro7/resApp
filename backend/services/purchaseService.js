import { supabase } from '@/lib/supabase';

export const createPurchase = async ({
  userId, paymentMethod, deliveryNotes, totalPrice, products,
  streetName, houseNumber, city, state, zipCode, country
}) => {
  // products: [{ productId, restaurantId, price, quantity }]
  try {
    // 1. Voeg purchase toe
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchase')
      .insert({
        userId,
        paymentMethod,
        deliveryNotes: deliveryNotes,
        totalPrice,
        status: 1, // bijv. 1 = 'nieuw', pas aan naar jouw status logica
        streetName: streetName || '',
        houseNumber: houseNumber || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        country: country || ''
      })
      .select()
      .single();
    if (purchaseError) {
      return { success: false, msg: 'Fout bij aanmaken bestelling', error: purchaseError };
    }
    // 2. Voeg purchaseLines toe
    const lines = products.map(p => ({
      purchaseId: purchase.id,
      productId: p.productId,
      restaurantId: p.restaurantId,
      price: p.price,
      quantity: p.quantity
    }));
    const { error: lineError } = await supabase
      .from('purchaseLine')
      .insert(lines);
    if (lineError) {
      return { success: false, msg: 'Fout bij aanmaken bestelregels', error: lineError };
    }
    return { success: true, purchaseId: purchase.id };
  } catch (e) {
    return { success: false, msg: 'Onbekende fout', error: e };
  }
};
