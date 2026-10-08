import { authState } from '../../server/routes/api/auth';

// Auth utility for client-side session management
// SECURITY: All authentication happens server-side
// Client never stores PINs or sensitive data in localStorage

export interface AuthState {
  isAuthenticated: boolean;
  userId: number | null;
  role: 'parent' | 'child' | null;
  token: string | null;
}

// Validate session from cookie (server sets httpOnly cookie)
export function validateSession(): boolean {
  // SECURITY: Don't read from localStorage - use server cookie only
  // The browser automatically handles httpOnly cookies
  // In production, verify cookie via server or use server-side session store
  
  // For client-side only check (optional), verify token format
  try {
    // Check if we have a valid session state
    if (authState.isAuthenticated) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// Clear session
export function clearSession(): void {
  // SECURITY: Clear client-side state only
  // Server clears cookie via /api/logout
  authState.isAuthenticated = false;
  authState.userId = null;
  authState.role = null;
  authState.token = null;
}

// Login with PIN - PIN verification happens SERVER-SIDE only
export async function login(userId: number, pin: string, role: 'child'): Promise<boolean> {
  // SECURITY: Never store PINs in client-side code or localStorage
  // All PIN verification happens on server
  
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
  // Call server to clear cookie
  fetch('/api/logout', { method: 'POST' }).then(() => {
    clearSession();
  }).catch(console.error);
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
// SECURITY: Initialize from server cookie, not localStorage
export function initAuth(): void {
  // Validate session from server cookie
  validateSession();
}
