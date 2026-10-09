/**
 * Session Management
 * Handles Cloudflare Access token validation and user data extraction
 */

export interface SessionToken {
  token: string;
  familyId: string;
  role: 'parent' | 'child';
  children?: string[];
  permissions: string[];
  expiresAt: number;
}

export interface Session {
  token: string;
  user: User | null;
  familyId: string | null;
  role: 'parent' | 'child' | null;
  isAuthenticated: boolean;
  lastActivity: number;
  expiresAt: number | null;
}

export interface User {
  id: string;
  familyId: string;
  email: string;
  name: string;
  role: 'parent' | 'child';
  avatarId: string;
  points: number;
}

/**
 * Session Manager
 */
export class SessionManager {
  private STORAGE_KEY = 'chore-champ-session';
  private EXPIRY_MARGIN_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Validate and store session from JWT token
   */
  async validateSession(token: string): Promise<Session | null> {
    try {
      // Decode JWT token (without signature verification in browser)
      const payload = this.decodeToken(token);
      
      if (!payload) {
        return null;
      }

      // Extract session data from token
      const session: Session = {
        token,
        user: null, // Will be fetched from IndexedDB
        familyId: payload.family_id || null,
        role: payload.role as 'parent' | 'child' | null,
        isAuthenticated: true,
        lastActivity: Date.now(),
      };

      // Store in IndexedDB
      await this.storeSession(session);

      return session;
    } catch (error) {
      console.error('Failed to validate session:', error);
      return null;
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      
      if (!stored) {
        return null;
      }

      const sessionData = JSON.parse(stored);
      const session = {
        ...sessionData,
        lastActivity: Date.now(),
      } as Session;

      // Check if token is still valid
      if (session.token && session.expiresAt) {
        const isExpired = Date.now() > session.expiresAt - this.EXPIRY_MARGIN_MS;
        if (isExpired) {
          await this.clearSession();
          return null;
        }
      }

      // Check if family selection is needed
      if (!session.familyId && session.role) {
        return session;
      }

      return session;
    } catch (error) {
      console.error('Failed to get current session:', error);
      return null;
    }
  }

  /**
   * Store session
   */
  private async storeSession(session: Session): Promise<void> {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          token: session.token,
          familyId: session.familyId,
          role: session.role,
          isAuthenticated: session.isAuthenticated,
          lastActivity: session.lastActivity,
        })
      );
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  /**
   * Clear session
   */
  async clearSession(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Decode JWT token payload
   */
  private decodeToken(token: string): {
    email?: string;
    family_id?: string;
    role?: string;
    children?: string[];
    permissions?: string[];
    exp?: number;
  } | null {
    try {
      // Remove any URL encoding
      const cleanToken = token.replace(/%/g, '').replace(/-/g, '').replace(/_/g, '');
      
      // Split header, payload, and signature
      const parts = cleanToken.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode payload (base64url)
      const payload = atob(parts[1]);
      
      // Parse as JSON
      try {
        return JSON.parse(payload);
      } catch {
        return null;
      }
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  }

  /**
   * Update last activity
   */
  async updateActivity(): Promise<void> {
    const session = await this.getCurrentSession();
    if (session) {
      session.lastActivity = Date.now();
      await this.storeSession(session);
    }
  }

  /**
   * Check if session is expired
   */
  isExpired(session: Session): boolean {
    if (!session.token) {
      return true;
    }
    const expiresAt = Date.now() + (session.expiresAt || 0);
    return Date.now() > expiresAt - this.EXPIRY_MARGIN_MS;
  }
}

/**
 * Singleton instance
 */
let sessionManager: SessionManager | null = null;

export function getSessionManager(): SessionManager {
  if (!sessionManager) {
    sessionManager = new SessionManager();
  }
  return sessionManager;
}
