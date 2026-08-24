import jwt, { SignOptions } from "jsonwebtoken";

export interface JwtPayload {
  userId: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "default_jwt_secret_dev_only";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];

export function generateToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
