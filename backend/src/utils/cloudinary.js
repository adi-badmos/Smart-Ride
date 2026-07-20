import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { env } from '../config/env.js';

// Placeholder credentials until real ones are provided — the SDK
// initializes fine either way; an actual upload call fails with a clear
// Cloudinary auth error until CLOUDINARY_* env vars are real.
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || 'placeholder_cloud_name',
  api_key: env.CLOUDINARY_API_KEY || 'placeholder_api_key',
  api_secret: env.CLOUDINARY_API_SECRET || 'placeholder_api_secret',
});

export const uploadBuffer = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: 'auto' }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

export const deleteFile = (publicId) => cloudinary.uploader.destroy(publicId);