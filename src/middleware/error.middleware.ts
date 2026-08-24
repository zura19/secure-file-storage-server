import { Request, Response, NextFunction } from "express";
import multer from "multer";

interface ErrorWithStatus extends Error {
  status?: number;
  statusText?: "fail" | "error";
  isOperational?: boolean;
  code?: string;
}

export const globalErrorHandler = (
  err: ErrorWithStatus,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(err.stack);

  if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
    const maxMb = process.env.MAX_FILE_SIZE_MB || "100";
    res.status(400).json({
      status: "fail",
      message: `File size exceeds the allowed limit of ${maxMb}MB.`,
    });
    return;
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: err.statusText || (statusCode >= 500 ? "error" : "fail"),
    message: err.message || "Internal Server Error",
  });
};
