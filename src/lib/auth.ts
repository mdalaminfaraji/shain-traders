import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_shahin_traders"
);

export interface SessionPayload {
  userId: string;
  email: string;
  role: "owner" | "manager";
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      role: (payload.role as "owner" | "manager") ?? "manager",
    };
  } catch {
    return null;
  }
}

export async function requireOwner(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  if (session.role !== "owner") throw new Error("Forbidden");
  return session;
}
