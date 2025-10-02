import { supabase } from "@/lib/supabase";
import { uploadFile } from "./imageService";

export const createPostWithVideos = async (
    title: string,
    restaurantId: string,
    videos: { uri: string; linkedProduct: string }[]
  ) => {
    try {
      // 1. Maak een nieuwe post aan
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({ title, restaurantId })
        .select()
        .single();
  
      if (postError) {
        console.error("Error creating post:", postError);
        return { success: false, message: "Kon post niet aanmaken." };
      }
  
      // 2. Upload video's en maak postItems aan
      for (const video of videos) {
        // upload video bestand naar storage
        const uploadResult = await uploadFile('postVideos', video.uri, false);
        if (!uploadResult.succes) {
          return { success: false, message: "Kon video niet uploaden." };
        }
  
        // voeg postItem toe met link naar video en productId
        const { error: postItemError } = await supabase
        .from('postItems')
        .insert({
            postId: post.id,
            productId: video.linkedProduct, // ← dit is linkedProductId
            file: uploadResult.data,
          });          
  
        if (postItemError) {
          console.error("Error creating postItem:", postItemError);
          return { success: false, message: "Kon post item niet aanmaken." };
        }
      }
  
      return { success: true, postId: post.id };
    } catch (error) {
      console.error("Unexpected error:", error);
      return { success: false, message: "Er is een fout opgetreden." };
    }
  };


  export const fetchPost = async (limit = 5, offset = 0, restaurantId = null) => {
    try {
      let query = supabase
        .from('posts')
        .select(`
          id,
          title,
          created_at,
          restaurantId,
          restaurants (
            id,
            name,
            street,
            streetNr,
            city,
            owner (
              id,
              name,
              image
            )
          ),
          postItems (
            id,
            file,
            productId,
            created_at,
            products (
              id,
              productName,
              price
            )
          ),  postFavorieten (
          id,
          userId,
          created_at
        )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      // Filter op restaurantId als deze is meegegeven
      if (restaurantId) {
        query = query.eq('restaurantId', restaurantId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Fetch post error:", error);
        return { success: false, message: "Kon posts niet ophalen." };
      }

      return { success: true, data: data || [] };

    } catch (err) {
      console.error("Unexpected fetchPost error:", err);
      return { success: false, message: "Er is een fout opgetreden bij het ophalen van posts." };
    }
  };

  // Nieuwe functie specifiek voor posts van een creator
  export const fetchUserPosts = async (userId, limit = 5, offset = 0) => {
    try {
      // Eerst het restaurant van de gebruiker ophalen
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner', userId)
        .single();

      if (restaurantError || !restaurant) {
        return { success: false, message: "Geen restaurant gevonden voor deze gebruiker." };
      }

      // Dan posts van dat restaurant ophalen
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          created_at,
          restaurantId,
          restaurants (
            id,
            name,
            street,
            streetNr,
            city,
            owner (
              id,
              name,
              image
            )
          ),
          postItems (
            id,
            file,
            productId,
            created_at,
            products (
              id,
              productName,
              price
            )
          ),  postFavorieten (
          id,
          userId,
          created_at
        )
        `)
        .eq('restaurantId', restaurant.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Fetch user posts error:", error);
        return { success: false, message: "Kon posts niet ophalen." };
      }

      return { success: true, data: data || [] };

    } catch (err) {
      console.error("Unexpected fetchUserPosts error:", err);
      return { success: false, message: "Er is een fout opgetreden bij het ophalen van posts." };
    }
  };
  
  export const fetchPostById = async (id) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          created_at,
          restaurantId,
          restaurants (
            id,
            name,
            street,
            streetNr,
            owner (
              id,
              name,
              image
            )
          ),
          postItems (
            id,
            file,
            productId,
            created_at,
            products (
              id,
              productName,
              price
            )
          ),
          postFavorieten (
            id,
            userId,
            created_at
          )
        `)
        .eq('id', id)
        .limit(1); // één post, maar zonder .single()
  
      if (error) {
        console.error("fetchPostById error:", error);
        return { success: false, message: "Kon post niet ophalen." };
      }
  
      return { success: true, data: data || [] };
  
    } catch (err) {
      console.error("Unexpected fetchPostById error:", err);
      return { success: false, message: "Er is een fout opgetreden bij het ophalen van de post." };
    }
  };
  
  export const createPostLike = async (postFavorieten) => {
    try{
        const {data, error} = await supabase
        .from('postFavorieten')
        .insert(postFavorieten)
        .select()
        .single();

        if(error) {
            console.log('Like Post error: ', error);
            return {succes: false, msg: 'could not like  post'}
        }

        return {succes: true, data: data}

    }
    catch(error) {
        console.log('Like Post error: ', error);
        return {succes: false, msg: 'could not like post'}
    }
}

export const removePostLike = async (postId, userId) => {
  try{
      const { error} = await supabase
      .from('postFavorieten')
      .delete()
      .eq('userId', userId)
      .eq('postId', postId)
      
      if(error) {
          console.log('Like Post error: ', error);
          return {succes: false, msg: 'could not remove like  post'}
      }

      return {succes: true}

  } 
  catch(error) {
      console.log('Like Post error: ', error);
      return {succes: false, msg: 'could not remove like post'}
  }
}

export const checkPostLiked = async (postId, userId) => {
  try {
    const { data, error } = await supabase
      .from('postFavorieten')
      .select('*')
      .eq('postId', postId)
      .eq('userId', userId);

    if (error) {
      console.log('Check Like error:', error);
      return { success: false, data: [] };
    }

    return { success: true, data };
  } catch (error) {
    console.log('Check Like error:', error);
    return { success: false, data: [] };
  }
};
