import { setCookie, getCookie, readBody, createError } from 'nitro/h3';
import { generateSessionToken, verifySessionToken } from './auth';

// In-memory user store for demo (in production, use database)
// In production: use bcrypt to hash PINs, store in database
const users = new Map<number, { id: number; name: string; age: number; role: 'parent' | 'child'; pin: string }>();

// Initialize demo users (in production, load from database with hashed PINs)
// SECURITY NOTE: In production, PINs should be hashed using bcrypt/argon2 and stored in database
// Never store plain text PINs in production

// For demo purposes, we'll use plain text PINs (in production, use bcrypt)
users.set(1, { id: 1, name: 'Parent', age: 30, role: 'parent', pin: 'parent123' });
users.set(2, { id: 2, name: 'Alex', age: 10, role: 'child', pin: '1234' });
users.set(3, { id: 3, name: 'Emma', age: 8, role: 'child', pin: '5678' });

// Login with PIN verification
export async function onRequestPostLogin(event: { cookie: { 'chore-champ-session-token'?: string } }, params: { body: string | object }) {
  const body = await readBody(event);
  const data = typeof body === 'string' ? JSON.parse(body) : body;
  
  const { userId, pin, role } = data;
  
  if (!userId || pin === undefined || role !== 'child') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid login request',
    });
  }
  
  // SECURITY FIX 1: Server-side PIN verification (in production, use bcrypt)
  // For demo: simple comparison (in production: hash PINs with bcrypt)
  const user = users.get(userId);
  
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    });
  }
  
  if (user.role !== role) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Role mismatch',
    });
  }
  
  // Check PIN (in production: use bcrypt.compare(pin, user.hashedPin))
  if (user.pin !== pin) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid PIN',
    });
  }
  
  // Generate session token
  const sessionToken = generateSessionToken(user.id, user.role);
  
  // SECURITY FIX 2: Set httpOnly, secure cookie (in production, ensure HTTPS)
  setCookie(event, 'chore-champ-session-token', sessionToken, {
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
    httpOnly: true, // SECURITY: Prevents JavaScript access, mitigates XSS
    secure: true,   // SECURITY: Only send over HTTPS (in production)
    sameSite: 'lax', // CSRF protection
  });
  
  return new Response(JSON.stringify({
    success: true,
    message: 'Login successful',
    userId: user.id,
    role: user.role,
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Logout - clear session
export async function onRequestPostLogout(event: { cookie: { 'chore-champ-session-token'?: string } }) {
  const token = getCookie(event, 'chore-champ-session-token');
  
  if (token) {
    setCookie(event, 'chore-champ-session-token', '', { maxAge: 0, path: '/' });
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
