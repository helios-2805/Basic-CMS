import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";


cloudinary.config(
  { 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  } 
);

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null;
    // uploading the file in cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    });
    // file has been successfully uploaded into cloudinary
    console.log("File is uploaded to Cloudinary!", response.url);
    fs.unlinkSync(localFilePath)
    return response;

  } catch (error) {
    fs.unlinkSync(localFilePath); // removes the locally saved temp file as there occurred an error while uploading to cloudinary
    return null;
  }
}

export { uploadOnCloudinary }