import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedToken extends JwtPayload {
  id: string;
  username: string;
  role: string;
}

export function getAuthenticatedUser(
  token: string | undefined | null
): AuthenticatedToken | null {
  try {
    if (!JWT_SECRET || !token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === "string" ||
      typeof decoded.id !== "string" ||
      typeof decoded.username !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return null;
    }

    return decoded as AuthenticatedToken;
  } catch {
    return null;
  }
}

export function getUserRole(
  token: string | undefined | null
): string | null {
  return getAuthenticatedUser(token)?.role ?? null;
}

export function isAdmin(
  token: string | undefined | null
): boolean {
  return getUserRole(token)?.trim().toLowerCase() === "admin";
}