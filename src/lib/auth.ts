import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'rentoby_fallback_secret_key_development_only_2026';
export const TOKEN_COOKIE_NAME = 'rentoby_auth_token';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthTokenFromRequest(req?: Request): Promise<string | null> {
  if (req) {
    // Check Authorization header first
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
  }

  // Check HTTP-only cookie via next/headers
  try {
    const cookieStore = cookies();
    const tokenCookie = cookieStore.get(TOKEN_COOKIE_NAME);
    if (tokenCookie) {
      return tokenCookie.value;
    }
  } catch (err) {
    // next/headers might throw outside of request context
  }

  return null;
}

export async function getCurrentUser(req?: Request) {
  const token = await getAuthTokenFromRequest(req);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      city: true,
      localArea: true,
      avatarUrl: true,
      bio: true,
      role: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function requireAuth(req?: Request) {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireAdmin(req?: Request) {
  const user = await requireAuth(req);
  if (user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN_NOT_ADMIN');
  }
  return user;
}
