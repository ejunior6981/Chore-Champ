import { setCookie, getCookie, readBody, createError } from 'nitro/h3';
import { generateSessionToken, verifySessionToken } from './auth';

// Rate limiting storage - persists across restarts
interface RateLimitRecord {
  userId: number;
  role: 'parent' | 'child';
  failedAttempts: number;
  lockedUntil: number | null;
}

const rateLimitRecords: Map<string, RateLimitRecord> = new Map();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(userId: number, role: 'parent' | 'child'): boolean {
  const key = `${userId}:${role}`;
  const now = Date.now();
  let record = rateLimitRecords.get(key);
  
  if (!record) {
    rateLimitRecords.set(key, { userId, role, failedAttempts: 0, lockedUntil: null });
    return true;
  }
  
  // Check if locked
  if (record.lockedUntil && record.lockedUntil > now) {
    return false;
  }
  
  // Reset counter if window expired
  if (record.failedAttempts > 0 && now - record.lockedUntil! > RATE_LIMIT_WINDOW_MS) {
    record.failedAttempts = 0;
    record.lockedUntil = null;
  }
  
  // Check if rate limit exceeded
  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    // Lock account
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    rateLimitRecords.set(key, record);
    return false;
  }
  
  record.failedAttempts++;
  rateLimitRecords.set(key, record);
  return true;
}

// Reset rate limit for a user (called on successful login)
function resetRateLimit(userId: number, role: 'parent' | 'child'): void {
  const key = `${userId}:${role}`;
  rateLimitRecords.delete(key);
}

// In-memory user store for demo (in production, use database with hashed PINs)
// In production: use bcrypt to hash PINs, store in database
interface User {
  id: number;
  name: string;
  age: number;
  role: 'parent' | 'child';
  hashedPin: string;
}

const users: Map<number, User> = new Map();

// Initialize demo users with hashed PINs (in production, load from database)
import bcrypt from 'bcryptjs';

async function initUsers(): Promise<void> {
  const hashedParentPin = await bcrypt.hash('parent123', 12);
  const hashedChildPin1 = await bcrypt.hash('1234', 12);
  const hashedChildPin2 = await bcrypt.hash('5678', 12);
  
  users.set(1, { id: 1, name: 'Parent', age: 30, role: 'parent', hashedPin: hashedParentPin });
  users.set(2, { id: 2, name: 'Alex', age: 10, role: 'child', hashedPin: hashedChildPin1 });
  users.set(3, { id: 3, name: 'Emma', age: 8, role: 'child', hashedPin: hashedChildPin2 });
}

// Login with PIN verification
export async function onRequestPostLogin(event: any, params: { body: string | object }) {
  const body = await readBody(event);
  const data = typeof body === 'string' ? JSON.parse(body) : body;
  
  const { userId, pin, role } = data;
  
  if (!userId || pin === undefined || role !== 'child') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid login request',
    });
  }
  
  // Check rate limit first
  if (!checkRateLimit(userId, role)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Account locked due to too many failed attempts. Try again later.',
    });
  }
  
  const user = users.get(userId);
  
  if (!user) {
    // Increment failed attempts
    const key = `${userId}:${role}`;
    const record = rateLimitRecords.get(key);
    if (record) {
      record.failedAttempts++;
      rateLimitRecords.set(key, record);
    }
    
    throw createError({
      statusCode: 401,
      statusMessage: 'User not found',
    });
  }
  
  if (user.role !== role) {
    // Increment failed attempts
    const key = `${userId}:${role}`;
    const record = rateLimitRecords.get(key);
    if (record) {
      record.failedAttempts++;
      rateLimitRecords.set(key, record);
    }
    
    throw createError({
      statusCode: 401,
      statusMessage: 'Role mismatch',
    });
  }
  
  // Check PIN (use bcrypt.compare for constant-time comparison)
  const pinMatch = await bcrypt.compare(pin, user.hashedPin);
  
  if (!pinMatch) {
    // Increment failed attempts
    const key = `${userId}:${role}`;
    const record = rateLimitRecords.get(key);
    if (record) {
      record.failedAttempts++;
      rateLimitRecords.set(key, record);
    }
    
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid PIN',
    });
  }
  
  // Reset rate limit on successful login
  resetRateLimit(user.id, user.role);
  
  // Generate session token
  const sessionToken = generateSessionToken(user.id, user.role);
  
  // Set httpOnly, secure cookie
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
export async function onRequestPostLogout(event: any) {
  const token = getCookie(event, 'chore-champ-session-token');
  
  if (token) {
    setCookie(event, 'chore-champ-session-token', '', { maxAge: 0, path: '/' });
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Initialize users on startup
initUsers().catch((error) => {
  console.error('Failed to initialize users:', error);
});
