import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from "cloudinary";
import { Readable } from "stream";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  bytes: number;
  format?: string;
  resource_type?: string;
}

export function uploadStreamToCloudinary(
  fileStream: Readable,
  options: {
    folder?: string;
    filename?: string;
    onProgress?: (bytes: number) => void;
  } = {},
): Promise<CloudinaryUploadResult> {
  const folder =
    options.folder ||
    process.env.CLOUDINARY_UPLOAD_FOLDER ||
    "secure_file_storage";

  return new Promise((resolve, reject) => {
    let uploadedBytes = 0;

    const uploadStream = cloudinary.uploader.upload_chunked_stream(
      {
        resource_type: "auto",
        folder,
        chunk_size: 6000000,
        use_filename: true,
        unique_filename: true,
      },
      (error?: UploadApiErrorResponse, result?: UploadApiResponse) => {
        if (error || !result) {
          return reject(
            error || new Error("Cloudinary upload failed with empty result."),
          );
        }

        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          bytes: result.bytes,
          format: result.format,
          resource_type: result.resource_type,
        });
      },
    );

    if (options.onProgress) {
      fileStream.on("data", (chunk: Buffer | string) => {
        uploadedBytes += Buffer.byteLength(chunk);
        options.onProgress?.(uploadedBytes);
      });
    }

    fileStream.on("error", (streamError: Error | unknown) => {
      reject(streamError);
    });

    fileStream.pipe(uploadStream);
  });
}

export async function deleteFromCloudinary(
  publicId: string,
  mimeType?: string,
) {
  let resourceType: "image" | "video" | "raw" = "raw";
  if (mimeType?.startsWith("image/")) resourceType = "image";
  if (mimeType?.startsWith("video/") || mimeType?.startsWith("audio/")) resourceType = "video";

  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
}

export default cloudinary;
