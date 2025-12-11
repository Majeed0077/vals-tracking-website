// lib/auth.ts
import jwt from "jsonwebtoken";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  throw new Error("Missing ADMIN_SECRET");
}

export interface AuthTokenPayload {
  sub: string;          // user/admin _id
  email: string;
  role: "admin" | "user";
}

const TOKEN_NAME = "vals_token";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

export function signAuthToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: TOKEN_MAX_AGE });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, ADMIN_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export { TOKEN_NAME, TOKEN_MAX_AGE };
