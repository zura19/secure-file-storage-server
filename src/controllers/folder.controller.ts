import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";
import {
  createFolderRecord,
  getFolderById,
  getUserFolders,
  updateFolderName as updateFolderNameInDb,
  getFolderWithFilesForDeletion,
  deleteFolderRecord,
  validateCreateFolderInput,
  validateUpdateFolderNameInput,
} from "../utils/folder/index.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

export async function createFolder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    const { name } = validateCreateFolderInput(req.body);

    const folder = await createFolderRecord({
      ownerId: userId,
      name,
    });

    res.status(201).json({
      status: "success",
      message: "Folder created successfully.",
      data: {
        folder,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getMyFolders(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    const folders = await getUserFolders(userId);

    res.status(200).json({
      status: "success",
      results: folders.length,
      data: {
        folders,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getFolder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return next(new AppError("Folder ID is required.", 400));
    }

    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    const folder = await getFolderById(id as string, userId);

    if (!folder) {
      return next(new AppError("Folder not found or access denied.", 404));
    }

    res.status(200).json({
      status: "success",
      data: {
        folder,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateFolderName(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return next(new AppError("Folder ID is required.", 400));
    }

    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    const { name } = validateUpdateFolderNameInput(req.body);

    const updatedFolder = await updateFolderNameInDb(
      id as string,
      userId,
      name,
    );

    if (!updatedFolder) {
      return next(new AppError("Folder not found or access denied.", 404));
    }

    res.status(200).json({
      status: "success",
      message: "Folder name updated successfully.",
      data: {
        folder: updatedFolder,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteFolder(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id) {
      return next(new AppError("Folder ID is required.", 400));
    }

    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    const folder = await getFolderWithFilesForDeletion(id as string, userId);

    if (!folder) {
      return next(new AppError("Folder not found or access denied.", 404));
    }

    // Delete all files in the folder from Cloudinary
    if (folder.files && folder.files.length > 0) {
      await Promise.allSettled(
        folder.files.map((file) =>
          deleteFromCloudinary(file.cloudinaryId, file.mimeType).catch(
            (cloudinaryError) => {
              console.error(
                `Cloudinary deletion error for ${file.cloudinaryId}:`,
                cloudinaryError,
              );
            },
          ),
        ),
      );
    }

    await deleteFolderRecord(id as string, userId);

    res.status(200).json({
      status: "success",
      message: "Folder and all its files deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
}

