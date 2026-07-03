/**
 * Portfolio Admin CMS — Copyright (C) 2026 Pratik Singh (AGPL-3.0).
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "admin_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET);

export function hashPassword(pw) {
  return bcrypt.hash(pw, 12);
}
export function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}

export function signSession(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token) {
  try {
    return (await jwtVerify(token, secret())).payload;
  } catch {
    return null;
  }
}
