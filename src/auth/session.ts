import type { Session } from '../../types';

export const extractSessionFromToken = (token: string): Session => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Extract session data from token
    const session: Session = {
      token,
      user: null, // Will be fetched from IndexedDB
      familyId: payload.family_id || null,
      role: payload.role as 'parent' | 'child' | null,
      isAuthenticated: true,
      lastActivity: Date.now(),
      expiresAt: Date.now() + (1000 * 60 * 60 * 24), // 24 hours
    };

    return session;
  } catch (error) {
    console.error('Failed to extract session from token:', error);
    return {
      token,
      user: null,
      familyId: null,
      role: null,
      isAuthenticated: false,
      lastActivity: Date.now(),
      expiresAt: Date.now(),
    };
  }
};
