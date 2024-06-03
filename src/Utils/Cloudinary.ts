import {v2 as cloudinary} from 'cloudinary';
import fs from 'node:fs';
import ApiError from './ApiError.js';

cloudinary.config(
    {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,

    }
);

//firstly we will upload the image temperorily to server and then to cloudinary 
const uploadToCloudinary = async ( filePath : string, typeOFUpload : "image"|"video"|"raw" ) : Promise<string|null> => {
    if(!filePath) {
        return null;
    }
    try {
     const response = await cloudinary.uploader.upload(
        filePath,
        {
          resource_type : typeOFUpload,
          folder : `vibe/${typeOFUpload}`, 
          use_filename : true,
          unique_filename : true, 
          overwrite : false,//will delete and add a new one
          auto_tagging : 0.6,
        }
     )

     //file uploaded to cloudinary 
     //delete from server 
      fs.unlinkSync(filePath);
       
      return response.secure_url;
    }
    catch (error : any & Error ) {
        console.log("Error in uploading to cloudinary :: ", error);
        throw new ApiError( `Error in uploading to cloudinary ::${error.message} `, 421, error);
    }
    return null;
}

export default uploadToCloudinary;