import * as FileSystem from 'expo-file-system';
import { supabase } from "@/lib/supabase";
import { supabaseUrl } from "@/constants/supabaseUrl"
import { decode } from "base64-arraybuffer";

export const getUserImageSrc = imagePath => {
    if(imagePath) {
        return getSupabaseFileUrl(imagePath);
    } else {
        return require("../../assets/images/basicPFP.jpeg");
    }
}

export const getProductImageSrc = imagePath => {
    if(imagePath) {
        return getSupabaseFileUrl(imagePath);
    } else {
        return require("../../assets/images/basicPFP.jpeg");
    }
}

export const getBannerImageSrc = imagePath => {
    if(imagePath) {
        return getSupabaseFileUrl(imagePath);
    } else {
        return require("../../assets/images/logo1.png");
    }
}

export const getSupabaseFileUrl = filePath => {
    if(filePath) {
        return {uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`}
    }
    return null;
}

export const downloadFile = async (url) => {
    try{
        const {uri} = await FileSystem.downloadAsync(url, getLocalFilePath(url))
        return uri;
    }
    catch(error) {
        return null;
    }
}

export const getLocalFilePath = filePath => {
    let fileName = filePath.split('/').pop();
    return `${FileSystem.documentDirectory}${fileName}`;  
}

export const uploadFile = async (folderName, fileUri, isImage = true) => {
    try{
        let fileName = getFilePath(folderName, isImage);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64
        });

        let imageData = decode(fileBase64); //array buffer
        let { data, error } = await supabase
        .storage
        .from('uploads')
        .upload(fileName, imageData, {
            cacheControl: '3600',
            upsert: false,
            contentType: isImage ? 'image/*' : 'videos/*'
        });

        if(error) {
            console.log('file upload error: ', error);
        return {succes: false, msg: 'er is een fout bij uploaden van het bestand'};
        }
        
        console.log('data: ', data);
        return {succes: true, data: data.path}

    } catch(error) {
        console.log('file upload error: ', error);
        return {succes: false, msg: 'er is een fout bij uploaden van het bestand'};
    }
}

export const getFilePath = (folderName, isImage) => {
    return `${folderName}/${new Date().getTime()}.${isImage ? 'png' : 'mp4'}`;
  }  
