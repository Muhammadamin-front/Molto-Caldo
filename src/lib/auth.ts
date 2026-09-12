import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "mc_admin";
const MAX_AGE = 60 * 60 * 8; // 8 soat

export interface AdminSession {
  id: number;
  email: string;
}

/**
 * Sessiya kalitini o'qiydi. Kalit yo'q bo'lsa `null` — hech qanday
 * zaxira ("fallback") kalit ishlatilmaydi, aks holda sessiyani hamma
 * o'zi yasab olishi mumkin bo'lardi.
 */
function secretKey() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) return null;
  return new TextEncoder().encode(value);
}

/** Admin panel ishlashi uchun baza ham, sessiya kaliti ham kerak. */
export function adminReady() {
  return {
    database: Boolean(process.env.DATABASE_URL),
    secret: secretKey() !== null,
  };
}

export async function createSession(admin: AdminSession) {
  const key = secretKey();
  if (!key) throw new Error("AUTH_SECRET is not set");

  const token = await new SignJWT({ email: admin.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(admin.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key);

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: MAX_AGE,
  });
}

export async function getSession(): Promise<AdminSession | null> {
  const key = secretKey();
  if (!key) return null;

  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key);
    const id = Number(payload.sub);
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!Number.isInteger(id) || !email) return null;
    return { id, email };
  } catch {
    // Muddati o'tgan yoki buzilgan token — kirmagan deb hisoblanadi.
    return null;
  }
}

export async function destroySession() {
  const store = await cookies();
  store.delete({ name: COOKIE, path: "/admin" });
}
