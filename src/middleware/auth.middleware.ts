import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { getUserById } from "../utils/user/index.js";
import { AUTH_COOKIE_NAME } from "../utils/cookie.js";
import AppError from "../utils/AppError.js";

export async function protect(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
      token = req.cookies[AUTH_COOKIE_NAME];
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new AppError(
          "You are not logged in. Please log in to get access.",
          401,
        ),
      );
    }
    const payload = verifyToken(token);
    const user = await getUserById(payload.userId);
    if (!user) {
      return next(
        new AppError("User belonging to this token no longer exists.", 401),
      );
    }

    req.user = user;
    next();
  } catch (error) {
    return next(
      new AppError("Invalid or expired session. Please log in again.", 401),
    );
  }
}
