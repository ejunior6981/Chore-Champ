import { createServer } from 'node:http';
import { createHmac } from 'node:crypto';

// Auth utility for server-side session management
// Generates and verifies session tokens with HMAC signing

export interface Session {
  userId: number;
  role: 'parent' | 'child';
  token: string;
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'chore-champ-super-secret-key-change-in-production';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Generate signed JWT token using HMAC-SHA256
export function generateSessionToken(userId: number, role: 'parent' | 'child'): string {
  const payload = {
    userId,
    role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor((Date.now() + SESSION_DURATION_MS) / 1000)
  };
  
  const secret = SESSION_SECRET;
  const signature = createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('base64url');
  
  return `${Buffer.from(JSON.stringify(payload)).toString('base64url')}.${signature}`;
}

// Verify session token with HMAC signature
export function verifySessionToken(token: string): Session | null {
  if (!token || !token.includes('.')) {
    return null;
  }
  
  const [payloadB64, signatureB64] = token.split('.');
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  const expectedSignature = createHmac('sha256', SESSION_SECRET)
    .update(JSON.stringify(payload))
    .digest('base64url');
  
  if (signatureB64 !== expectedSignature) {
    return null;
  }
  
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return null;
  }
  
  return { userId: payload.userId, role: payload.role, token };
}

// Export for client-side auth utility (empty object - all auth is server-side)
export const authState = {};
