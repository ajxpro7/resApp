// // backend/services/userService.ts
import { supabase } from "@/lib/supabase";
import { uploadFile } from "./imageService";

export const getUserData = async (userid) => {
  try{
    const { data, error } = await supabase
    .from('users')
    .select()
    .eq('id', userid)
    .single();

    if(error) {
      return {succes: false, msg: error?.message}
    }
    return {succes: true, data}
  }
  catch(error) {
    console.log('userService got error: ', error);
    return {succes: false, msg: error.message}
  }
}

export const updateUserData = async (userId, data) => {
  try{
    const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)

    if(error) {
      return {succes: false, msg: error?.message}
    }
    return {succes: true, data}
  }
  catch(error) {
    console.log('userService got error: ', error);
    return {succes: false, msg: error.message}
  }
}

export const getCurrentRestaurantData = async () => {
  try {
    // Haal de huidige user op
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, msg: 'Geen gebruiker ingelogd.' };
    }

    // Haal alle restaurant informatie op voor de ingelogde gebruiker
    const { data, error } = await supabase
      .from('restaurants')
      .select(`
        id,
        name,
        street,
        streetNr,
        zipCode,
        city,
        website,
        phoneNumber,
        openingHours,
        description,
        banner,
        owner,
        created_at
      `)
      .eq('owner', user.id)
      .single();

    if (error) {
      console.log('Get Restaurant Data error:', error);
      return { success: false, msg: 'Kon restaurant gegevens niet ophalen.' };
    }

    if (!data) {
      return { success: false, msg: 'Geen restaurant gevonden voor deze gebruiker.' };
    }

    return { success: true, data };
  } catch (error) {
    console.log('Get Restaurant Data exception:', error);
    return { success: false, msg: 'Er is een fout opgetreden bij het ophalen van restaurant gegevens.' };
  }
};

export const createRestaurant = async (restaurantData, banner = null) => {
  try {
    // Haal de huidige user op
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, msg: 'Geen gebruiker ingelogd.' };
    }

    // Upload afbeelding als bestand is meegegeven
    if (banner && banner.file && typeof banner.file === "object") {
      const uploadRes = await uploadFile("restaurantBanner", banner.file.uri, true);
      if (uploadRes.succes) {
        // Voeg de banner URL toe aan de restaurant data
        restaurantData.banner = uploadRes.data;
      } else {
        return { success: false, msg: uploadRes.msg };
      }
    }

    // Update de rij waar owner gelijk is aan user.id
    const { data, error } = await supabase
      .from('restaurants')
      .update(restaurantData)
      .eq('owner', user.id)
      .select()
      .single();

    if (error) {
      console.log('Update Restaurant error:', error);
      return { success: false, msg: 'Kon restaurant niet bijwerken.' };
    }

    return { success: true, data };
  } catch (error) {
    console.log('Update Restaurant exception:', error);
    return { success: false, msg: 'Kon restaurant niet bijwerken.' };
  }
};

export const getUserAddressFromSupabase = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('streetName, houseNumber, zipCode, state, country')
      .eq('id', userId)
      .single();
    if (error) return null;
    if (!data) return null;
    return {
      streetName: data.streetName || '',
      houseNumber: data.houseNumber || '',
      zipCode: data.zipCode || '',
      state: data.state || '',
      country: data.country || '',
    };
  } catch (e) {
    return null;
  }
};

export const setUserAddressInSupabase = async (userId, addressObj) => {
  try {
    const { streetName, houseNumber, zipCode, state, country } = addressObj;
    const { error } = await supabase
      .from('users')
      .update({
        streetName: streetName || '',
        houseNumber: houseNumber || '',
        zipCode: zipCode || '',
        state: state || '',
        country: country || '',
      })
      .eq('id', userId);
    return !error;
  } catch (e) {
    return false;
  }
};
