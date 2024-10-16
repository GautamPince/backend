import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

// Configuration
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudnary = async (localFilePath) => {
   try {
      if (!localFilePath) return null
      // upload the file on cloudinary
      const response = await cloudinary.uploader.upload(localFilePath, {
         resource_type: "auto"
      })
      //file has been uploaded successfully
      // console.log("file is uploaded on cloudinary ", response.url);
      // file uploaded successfully then remove the file locally
      fs.unlinkSync(localFilePath)
      return response;

   } catch (error) {
      fs.unlinkSync(localFilePath)//remove the locally saved file as the uploaded operation got failed
      return null;
   }
}


export { uploadOnCloudnary }