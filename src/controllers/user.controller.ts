import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError.js";
import { getUserFileStats } from "../utils/user/index.js";

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

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  } catch (error) {
    return next(error);
  }
}
