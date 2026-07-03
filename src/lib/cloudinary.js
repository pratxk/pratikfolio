/** Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0). */
import { v2 as cloudinary } from "cloudinary";

export function signUpload(paramsToSign) {
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET,
  );
  return {
    signature,
    timestamp: paramsToSign.timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}
