import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "./db";
import type { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET || "b-art-secret";

export type AuthUser = Pick<User, "id" | "email" | "username" | "role" | "avatar" | "bio" | "wallet" | "badge" | "phone" | "gender" | "birthDate">;

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function createToken(user: AuthUser) {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

export async function getAuthCookieValue() {
  const cookieStore = await cookies();
  return cookieStore.get("b-art-token")?.value;
}

export async function getCurrentUser() {
  const token = await getAuthCookieValue();
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    return prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        wallet: true,
        badge: true,
        phone: true,
        gender: true,
        birthDate: true,
      },
    });
  } catch {
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "b-art-token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "b-art-token",
    value: "",
    path: "/",
    expires: new Date(0),
    httpOnly: true,
    sameSite: "lax",
    secure: true,
  });
}

