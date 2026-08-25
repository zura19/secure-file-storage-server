import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import AppError from "../utils/AppError.js";
import { CloudinaryFile } from "../middleware/upload.middleware.js";
import {
  createFileRecord,
  getFileById,
  getUserFiles,
  deleteFileRecord,
  updateFileVisibility,
  getFileByShareToken,
  validateGetMyFilesQuery,
} from "../utils/file/index.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";
import { Visibility } from "@prisma/client";

export async function uploadFile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file as CloudinaryFile | undefined;

    if (!file || !file.cloudinary) {
      return next(new AppError("Please provide a valid file to upload.", 400));
    }

    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    const { visibility } = req.body;
    const isPublic = visibility === "PUBLIC";

    const shareToken = isPublic ? crypto.randomBytes(16).toString("hex") : null;

    const fileRecord = await createFileRecord({
      ownerId: userId,
      originalName: file.originalname,
      cloudinaryId: file.cloudinary.public_id,
      url: file.cloudinary.secure_url,
      mimeType: file.mimetype,
      size: file.cloudinary.bytes,
      visibility: isPublic ? Visibility.PUBLIC : Visibility.PRIVATE,
      shareToken,
    });

    res.status(201).json({
      status: "success",
      message: "File uploaded successfully.",
      data: {
        file: fileRecord,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMyFiles(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }
    const filters = validateGetMyFilesQuery(req.query);

    const files = await getUserFiles(userId, filters);

    res.status(200).json({
      status: "success",
      results: files.length,
      data: {
        files,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return next(new AppError("File ID is required.", 400));
    }

    const file = await getFileById(id as string);

    if (!file) {
      return next(new AppError("File not found.", 404));
    }

    if (file.ownerId !== userId && file.visibility !== Visibility.PUBLIC) {
      return next(
        new AppError("You do not have permission to view this file.", 403),
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        file,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateVisibility(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { visibility } = req.body;

    if (!id) {
      return next(new AppError("File ID is required.", 400));
    }

    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    if (visibility !== "PUBLIC" && visibility !== "PRIVATE") {
      return next(
        new AppError("Visibility must be either 'PUBLIC' or 'PRIVATE'.", 400),
      );
    }

    const targetVisibility =
      visibility === "PUBLIC" ? Visibility.PUBLIC : Visibility.PRIVATE;

    let shareToken: string | null = null;
    if (targetVisibility === Visibility.PUBLIC) {
      const existing = await getFileById(id as string);
      shareToken =
        existing?.shareToken || crypto.randomBytes(16).toString("hex");
    }

    const updatedFile = await updateFileVisibility(
      id as string,
      userId,
      targetVisibility,
      shareToken,
    );

    if (!updatedFile) {
      return next(new AppError("File not found or access denied.", 404));
    }

    res.status(200).json({
      status: "success",
      message: `File visibility updated to ${visibility}.`,
      data: {
        file: updatedFile,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getSharedFile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { shareToken } = req.params;

    if (!shareToken) {
      return next(new AppError("Share token is required.", 400));
    }

    const file = await getFileByShareToken(shareToken as string);

    if (!file || file.visibility !== Visibility.PUBLIC) {
      return next(
        new AppError(
          "This shared file link is invalid, expired, or has been made private.",
          404,
        ),
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        file: {
          id: file.id,
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
          url: file.url,
          createdAt: file.createdAt,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteFile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return next(new AppError("File ID is required.", 400));
    }

    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    const file = await getFileById(id as string);

    if (!file || file.ownerId !== userId) {
      return next(new AppError("File not found or access denied.", 404));
    }

    try {
      const cloudinaryRes = await deleteFromCloudinary(
        file.cloudinaryId,
        file.mimeType,
      );
      console.log(
        `Cloudinary deletion for ${file.cloudinaryId}:`,
        cloudinaryRes,
      );
    } catch (cloudinaryError) {
      console.error("Cloudinary deletion error:", cloudinaryError);
    }

    await deleteFileRecord(id as string, userId);

    res.status(200).json({
      status: "success",
      message: "File deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}
