import { generateSessionToken, verifySessionToken } from '../server/routes/api/auth';

// Auth utility for client-side session management
// Note: In production, use httpOnly cookies via server-side only

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

// Validate session token from localStorage
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
  localStorage.removeItem('chore-champ-session-token');
  localStorage.removeItem('chore-champ-session-auth');
  localStorage.removeItem('chore-champ-parent-viewing-as-child');
  
  authState.isAuthenticated = false;
  authState.userId = null;
  authState.role = null;
  authState.token = null;
}

// Login with PIN
export async function login(userId: number, pin: string, role: 'child'): Promise<boolean> {
  // In production:
  // 1. Send PIN to server
  // 2. Server verifies PIN against hashed value in database
  // 3. Server returns session token via httpOnly cookie
  
  // For now, simulate server verification
  // In production, PIN should NEVER be sent to client or stored in localStorage
  
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
    
    // Extract token from cookie header (in production, browser handles this automatically)
    const token = response.headers.get('set-cookie')?.split('session-token=')[1]?.split(';')[0];
    
    if (token) {
      authState.token = token;
      authState.userId = userId;
      authState.role = role;
      authState.isAuthenticated = true;
      
      // Store for client-side fallback (in production, use httpOnly cookies)
      localStorage.setItem('chore-champ-session-token', token);
    }
    
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
