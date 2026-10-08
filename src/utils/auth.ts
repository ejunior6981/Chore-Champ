import { generateSessionToken, verifySessionToken } from '../server/routes/api/auth';

// Auth utility for client-side session management
// SECURITY: PINs are NEVER stored in localStorage or sent to client
// In production, use httpOnly cookies via server-side only

export interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  role: 'parent' | 'child' | null;
  token: string | null;
}

export const authState: AuthState = {
  isAuthenticated: false,
  userId: null,
  role: null,
  token: null
};

// Validate session token from localStorage (fallback only)
export function validateSession(): boolean {
  try {
    const savedToken = localStorage.getItem('chore-champ-session-token');
    if (!savedToken) {
      return false;
    }
    
    const session = verifySessionToken(savedToken);
    if (!session) {
      return false;
    }
    
    authState.token = savedToken;
    authState.userId = session.userId;
    authState.role = session.role;
    authState.isAuthenticated = true;
    
    return true;
  } catch {
    return false;
  }
}

// Clear session
export function clearSession(): void {
  // Remove session token
  localStorage.removeItem('chore-champ-session-token');
  // SECURITY: Never store PIN in localStorage - this has been removed
  // Remove old insecure state
  localStorage.removeItem('chore-champ-session-auth');
  localStorage.removeItem('chore-champ-parent-viewing-as-child');
  
  authState.isAuthenticated = false;
  authState.userId = null;
  authState.role = null;
  authState.token = null;
}

// Login with PIN - PIN verification happens SERVER-SIDE only
export async function login(userId: number, pin: string, role: 'child'): Promise<boolean> {
  // SECURITY: PIN verification happens on server via POST to /api/login
  // The server:
  // 1. Looks up user in database
  // 2. Verifies PIN against hashed stored PIN (never compares plain text)
  // 3. If valid, sets httpOnly cookie with session token
  // 4. Client never receives PIN or stores it
  
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, pin, role })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Login failed:', data.error);
      return false;
    }
    
    // Browser automatically handles httpOnly cookies
    // No need to manually store token in localStorage
    authState.userId = userId;
    authState.role = role;
    authState.isAuthenticated = true;
    
    return true;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}

// Logout
export function logout(): void {
  clearSession();
}

// Check if user has permission to perform action
export function hasPermission(requiredRole: 'parent' | 'child'): boolean {
  if (!authState.isAuthenticated) {
    return false;
  }
  
  if (requiredRole === 'parent' && authState.role === 'parent') {
    return true;
  }
  
  if (requiredRole === 'child' && (authState.role === 'parent' || authState.role === 'child')) {
    return true;
  }
  
  return false;
}

// Get current user info
export function getCurrentUser() {
  if (!authState.isAuthenticated) {
    return null;
  }
  
  return {
    id: authState.userId!,
    role: authState.role!
  };
}

// Initialize auth on app load
export function initAuth(): void {
  validateSession();
}
