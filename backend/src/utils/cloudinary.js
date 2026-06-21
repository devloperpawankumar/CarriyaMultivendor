import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary from environment variables
// Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
export function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Initialize on module load if credentials are available
if (process.env.CLOUDINARY_CLOUD_NAME) {
  configureCloudinary();
}

export async function uploadBufferToCloudinary(buffer, folder, filename, resourceType = 'auto') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, public_id: filename, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

// Upload file from file system path
export async function uploadToCloudinary(filePath, folder = 'uploads') {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    // Fallback to local URL if Cloudinary not configured
    return `/uploads/${path.basename(filePath)}`;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto', // auto-detect image or video
    });
    
    // Clean up local file after successful upload
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.warn('Failed to cleanup local file:', filePath, cleanupErr.message);
    }
    
    return result.secure_url;
  } catch (error) {
    // Fallback to local URL if upload fails
    console.warn('Cloudinary upload failed, using local file:', error.message);
    return `/uploads/${path.basename(filePath)}`;
  }
}

export default cloudinary;


