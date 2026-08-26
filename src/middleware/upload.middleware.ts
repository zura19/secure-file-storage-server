import multer, { StorageEngine } from "multer";
import { Request, Response, NextFunction } from "express";
import {
  uploadStreamToCloudinary,
  CloudinaryUploadResult,
} from "../config/cloudinary.js";
import AppError from "../utils/AppError.js";

import { getUserTotalFileSize } from "../utils/user/index.js";

export interface CloudinaryFile extends Express.Multer.File {
  cloudinary?: CloudinaryUploadResult;
}

const MAX_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "100", 10);
export const MAX_FILE_SIZE = MAX_SIZE_MB * 1024 * 1024;

export const MAX_USER_STORAGE_GB = parseFloat(
  process.env.MAX_USER_STORAGE_GB || "1",
);
export const MAX_USER_STORAGE_BYTES =
  MAX_USER_STORAGE_GB * 1024 * 1024 * 1024; // 1GB in bytes (1,073,741,824 bytes)

const BLOCKED_MIME_TYPES = new Set([
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-sh",
  "application/x-bat",
  "application/x-executable",
]);

export const checkFileSizeHeader = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const contentLength = req.headers["content-length"];
  if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
    const maxMb = process.env.MAX_FILE_SIZE_MB || "100";
    return next(
      new AppError(`File size exceeds the allowed limit of ${maxMb}MB.`, 400),
    );
  }
  next();
};

export const checkUserStorageQuota = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    const currentTotalSize = await getUserTotalFileSize(userId);
    const contentLength = req.headers["content-length"]
      ? parseInt(req.headers["content-length"], 10)
      : 0;

    if (currentTotalSize + contentLength > MAX_USER_STORAGE_BYTES) {
      return next(
        new AppError(
          `Storage limit of ${MAX_USER_STORAGE_GB}GB exceeded. Please delete existing files to free up space.`,
          400,
        ),
      );
    }

    next();
  } catch (error) {
    return next(error);
  }
};

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (BLOCKED_MIME_TYPES.has(file.mimetype.toLowerCase())) {
    return cb(
      new AppError(
        `File type '${file.mimetype}' is not permitted for security reasons.`,
        400,
      ),
    );
  }
  cb(null, true);
};

class CloudinaryStreamingStorage implements StorageEngine {
  _handleFile(
    _req: Request,
    file: Express.Multer.File,
    cb: (error?: unknown, info?: Partial<CloudinaryFile>) => void,
  ): void {
    uploadStreamToCloudinary(file.stream, {
      filename: file.originalname,
    })
      .then((result) => {
        cb(null, {
          cloudinary: result,
          size: result.bytes,
          path: result.secure_url,
          filename: result.public_id,
        });
      })
      .catch((error) => {
        cb(error);
      });
  }

  _removeFile(
    _req: Request,
    _file: Express.Multer.File,
    cb: (error: Error | null) => void,
  ): void {
    cb(null);
  }
}

export const cloudinaryStreamingStorage = new CloudinaryStreamingStorage();

export const uploadFiles = multer({
  storage: cloudinaryStreamingStorage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 10,
  },
  fileFilter,
}).any();

export const uploadSingleFile = uploadFiles;
