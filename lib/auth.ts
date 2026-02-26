// lib/auth.ts
import jwt, { JwtPayload } from "jsonwebtoken";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  throw new Error("Missing ADMIN_SECRET");
}

// ✅ Force TS to know it's a string (after the runtime check above)
const SECRET: string = ADMIN_SECRET;

export interface AuthTokenPayload {
  sub: string; // user/admin _id
  email: string;
  role: "admin" | "user";
}

export const TOKEN_NAME = "vals_token";
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 15; // 15 days (seconds)

export function signAuthToken(payload: AuthTokenPayload): string {
  // ✅ Types are now satisfied
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_MAX_AGE });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET);

    // decoded can be string | JwtPayload
    if (typeof decoded === "string") return null;

    // ✅ Cast after we ensure it's an object
    const p = decoded as JwtPayload;

    // Optional: minimal shape validation
    if (
      typeof p.sub !== "string" ||
      typeof p.email !== "string" ||
      (p.role !== "admin" && p.role !== "user")
    ) {
      return null;
    }

    return {
      sub: p.sub,
      email: p.email,
      role: p.role,
    };
  } catch {
    return null;
  }
}
