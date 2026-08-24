import AppError from "../AppError.js";

export interface RegisterInput {
  email: string;
  password: string;
  username?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegister(body: unknown): RegisterInput {
  if (!body || typeof body !== "object") {
    throw new AppError("Request body is missing or invalid.", 400);
  }

  const { email, password, username } = body as Record<string, unknown>;

  if (!email || typeof email !== "string" || !email.trim()) {
    throw new AppError("Email is required.", 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw new AppError("Please provide a valid email address.", 400);
  }

  if (!password || typeof password !== "string") {
    throw new AppError("Password is required.", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters long.", 400);
  }

  let sanitizedUsername: string | null = null;

  if (username === null || username === undefined) {
    throw new AppError("Username is required.", 400);
  }

  if (typeof username !== "string" || !username.trim()) {
    throw new AppError("Username must be a valid non-empty string.", 400);
  }

  sanitizedUsername = username.trim();

  return {
    email: normalizedEmail,
    password,
    username: sanitizedUsername,
  };
}

export function validateLogin(body: unknown): LoginInput {
  if (!body || typeof body !== "object") {
    throw new AppError("Request body is missing or invalid.", 400);
  }

  const { email, password } = body as Record<string, unknown>;

  if (!email || typeof email !== "string" || !email.trim()) {
    throw new AppError("Email is required.", 400);
  }

  if (!password || typeof password !== "string") {
    throw new AppError("Password is required.", 400);
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
}
