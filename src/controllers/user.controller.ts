import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";
import { getUserFileStats } from "../utils/user/index.js";
import { MAX_USER_STORAGE_BYTES } from "../middleware/upload.middleware.js";

export async function getUserStats(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError("User is not authenticated.", 401));
    }

    const stats = await getUserFileStats(userId);

    const maxSizeBytes = MAX_USER_STORAGE_BYTES;
    const remainingSizeBytes = Math.max(
      0,
      maxSizeBytes - stats.totalSizeBytes,
    );
    const usedPercentage = Number(
      ((stats.totalSizeBytes / maxSizeBytes) * 100).toFixed(2),
    );

    res.status(200).json({
      status: "success",
      data: {
        stats: {
          ...stats,
          maxSizeBytes,
          remainingSizeBytes,
          usedPercentage,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}
