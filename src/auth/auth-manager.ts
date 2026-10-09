/**
 * Authentication Manager
 * Handles login/logout/session management for Cloudflare Access
 */

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  familyId: string | null;
  role: 'parent' | 'child' | null;
  lastAuthenticated: number | null;
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

export interface AuthConfig {
  clientId: string;
  apiDomain: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionToken {
  token: string;
  familyId: string;
  role: 'parent' | 'child';
  children?: string[];
  permissions: string[];
  expiresAt: number;
}

/**
 * Auth Manager Singleton
 */
class AuthManager {
  private config: AuthConfig;
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    familyId: null,
    role: null,
    lastAuthenticated: null,
  };
  private STORAGE_KEY = 'chore-champ-auth';

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * Initialize auth state from storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = {
          ...this.state,
          ...parsed,
        };
      }
    } catch (error) {
      console.error('Failed to initialize auth state:', error);
    }
  }

  /**
   * Check if currently authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.state.user;
  }

  /**
   * Get current family ID
   */
  getFamilyId(): string | null {
    return this.state.familyId;
  }

  /**
   * Get current role
   */
  getRole(): 'parent' | 'child' | null {
    return this.state.role;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<SessionToken | null> {
    console.log('AuthManager: Login attempted for email:', credentials.email);
    
    // TODO: Implement with Cloudflare Access API
    // 1. Validate credentials
    // 2. Check with Cloudflare Access
    // 3. Get JWT token with custom claims
    // 4. Extract family_id and role from token
    // 5. Store in IndexedDB
    
    return null;
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    console.log('AuthManager: Logging out');
    
    // TODO: Clear IndexedDB
    // localStorage.removeItem(this.STORAGE_KEY);
    
    this.state = {
      isAuthenticated: false,
      user: null,
      token: null,
      familyId: null,
      role: null,
      lastAuthenticated: null,
    };
  }

  /**
   * Switch to different user in family
   */
  async switchUser(userId: string, role: 'parent' | 'child'): Promise<void> {
    console.log('AuthManager: Switching to user:', userId, role);
    
    // TODO: Get user from IndexedDB
    // TODO: Update auth state
    
    this.state = {
      ...this.state,
      user: null, // Would need to fetch user data
      role,
      isAuthenticated: true,
    };
  }

  /**
   * Request family selection
   */
  async requestFamilySelection(): Promise<string[]> {
    console.log('AuthManager: Requesting family selection');
    
    // TODO: Get list of families from JWT claims
    // TODO: Return family IDs
    
    return [];
  }

  /**
   * Verify PIN for parent access
   */
  async verifyPin(enteredPin: string): Promise<boolean> {
    console.log('AuthManager: Verifying PIN');
    
    // TODO: Get stored PIN hash
    // TODO: Verify entered PIN against hash
    
    return false;
  }

  /**
   * Store auth state
   */
  private async storeState(): Promise<void> {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.state)
      );
    } catch (error) {
      console.error('Failed to store auth state:', error);
    }
  }

  /**
   * Update auth state
   */
  private updateState(updates: Partial<AuthState>): void {
    this.state = {
      ...this.state,
      ...updates,
    };
    this.storeState();
  }
}

/**
 * Export singleton instance
 */
let authManager: AuthManager | null = null;

export function getAuthManager(config: AuthConfig): AuthManager {
  if (!authManager) {
    authManager = new AuthManager(config);
  }
  return authManager;
}

export async function initializeAuth(config: AuthConfig): Promise<AuthManager> {
  const manager = getAuthManager(config);
  await manager.initialize();
  return manager;
}
