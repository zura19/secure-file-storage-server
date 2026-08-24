import { Request, Response, NextFunction } from "express";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import { setAuthCookie, clearAuthCookie } from "../utils/cookie.js";
import AppError from "../utils/AppError.js";
import { validateRegister, validateLogin } from "../utils/auth/index.js";
import {
  getUserByEmail,
  getUserByUsername,
  createUser,
} from "../utils/user/index.js";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, username } = validateRegister(req.body);

    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return next(new AppError("User with this email already exists.", 409));
    }

    if (username) {
      const existingUserByUsername = await getUserByUsername(username);
      if (existingUserByUsername) {
        return next(new AppError("Username is already taken.", 409));
      }
    }

    const passwordHash = await hashPassword(password);

    const newUser = await createUser({
      email,
      passwordHash,
      username,
    });

    res.status(201).json({
      status: "success",
      message: "User registered successfully.",
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = validateLogin(req.body);

    const user = await getUserByEmail(email);
    if (!user) {
      return next(new AppError("Invalid email or password.", 401));
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, password);
    if (!isPasswordValid) {
      return next(new AppError("Invalid email or password.", 401));
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    setAuthCookie(res, token);

    res.status(200).json({
      status: "success",
      message: "Login successful.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function logout(
  _req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  clearAuthCookie(res);
  res.status(200).json({
    status: "success",
    message: "Logged out successfully.",
  });
}

export async function getMe(
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
}
