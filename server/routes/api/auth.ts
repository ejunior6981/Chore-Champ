import { createServer } from 'node:http';

// Auth utility for server-side session management
// Generates and verifies session tokens

export interface Session {
  userId: number;
  role: 'parent' | 'child';
  token: string;
}

// Simple token generation (in production, use crypto.randomUUID or similar)
export function generateSessionToken(userId: number, role: 'parent' | 'child'): string {
  return `chore_champ_${userId}_${role}_${Date.now()}`;
}

// Verify session token
export function verifySessionToken(token: string): Session | null {
  // Simple validation (in production, use proper token validation)
  if (!token || !token.startsWith('chore_champ_')) {
    return null;
  }
  
  // Extract user info from token (in production, use proper token parsing)
  const parts = token.split('_');
  if (parts.length < 4) {
    return null;
  }
  
  const userId = parseInt(parts[2], 10);
  const role = parts[3] as 'parent' | 'child';
  
  if (isNaN(userId)) {
    return null;
  }
  
  return { userId, role, token };
}

// Export for client-side auth utility
export const authState = {
  isAuthenticated: false,
  userId: null as number | null,
  role: null as 'parent' | 'child' | null,
  token: null as string | null
};
