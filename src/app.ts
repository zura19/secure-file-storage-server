import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import fileRoutes from "./routes/file.routes.js";
import folderRoutes from "./routes/folder.routes.js";
import userRoutes from "./routes/user.routes.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import AppError from "./utils/AppError.js";

const app: Application = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/folders", folderRoutes);
app.use("/api/user", userRoutes);
app.use("/api/users", userRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Welcome to Secure File Storage Service API",
  });
});

app.all("*", (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;
