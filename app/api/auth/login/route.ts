import  db from "@/lib/db";
import { createLoginHandler } from "@userin/auth-kit/server";
import { RowDataPacket } from "mysql2";
import jwt from 'jsonwebtoken';

import bcrypt from "bcrypt";


const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key";
export interface TokenPayload {
  id: string;
  username: string;
  role: string;
  lastLogin: string | null;
}
function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30m', // 30分鐘過期，與自動登出時間匹配
  });
}

export interface AccountRow extends RowDataPacket {
  id: string;
  username: string;
  role: string;
  lastLogin: string | null;
}

interface PublicUser {
  id: string;
  username: string;
  role: string;
  lastLogin: string | null;
}

interface AuthenticatedUser extends PublicUser {
  message?: string;
}


export const POST = createLoginHandler<AuthenticatedUser>({
  // 1. Authenticate the user against your database.
  authenticate: async ({ username, password }) => {
    const verifyCredentials = async (username: string, password: string): Promise<AuthenticatedUser | null> => {
        if (!username || !password) {
            return null;
        }
        
        const [rows] = await db.execute<AccountRow[]>(
        `SELECT * FROM account_management WHERE username = ?`,
        [username]
        );

        if (rows.length === 0) {
            return null;
        }

        const user = rows[0];

        const valid = await bcrypt.compare(password, user.password);
        
        if (!valid) {
            return null;
        }

        // Update last login
        await db.query(
        "UPDATE account_management SET lastLogin = NOW() WHERE id = ?",
        [user.id]
        );
        const tUser: AuthenticatedUser = {
            id: user.id,
            username: user.username,
            role: user.role,
            lastLogin: user.lastLogin,
            message: "Login successful",
        };

        return tUser;
    }
    return await verifyCredentials(username, password);
  },

  // 2. Create a session and return its token.
  createSession: async (user) => {
    return await generateToken(user);
  },

  toPublicUser: (user) =>{ return user; },

  // 3. Configure the session cookie.
  cookie: {
    name: "auth_token",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
});