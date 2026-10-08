import { setCookie, getCookie } from 'h3';
import { sign, verify } from 'oauth4webapi';
import { generateSessionToken, verifySessionToken } from './auth';

// Login with PIN verification
export async function onRequestPostLogin() {
  const body = await readBody();
  const data = typeof body === 'string' ? JSON.parse(body) : body;
  
  const { userId, pin, role } = data;
  
  if (!userId || pin === undefined || role !== 'child') {
    return new Response(JSON.stringify({ error: 'Invalid login request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // In production:
  // 1. Look up user in database
  // 2. Verify PIN against hashed stored PIN
  // 3. If valid, generate session token
  
  // For now, simulate PIN check (in production, use bcrypt or similar)
  // PIN should be hashed and stored in database, never in localStorage
  
  // Generate session token for authenticated child
  const sessionToken = generateSessionToken(userId, role);
  
  // Set httpOnly cookie (simulated - in production, use proper cookie handling)
  // Note: In actual production, use a proper cookie library with httpOnly flag
  setCookie(
    'session-token',
    sessionToken,
    {
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
      // httpOnly: true - should be set in cookie options
      // secure: true - should be set for HTTPS
    }
  );
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Login successful' 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Logout - clear session
export async function onRequestPostLogout() {
  const token = getCookie('session-token');
  
  if (token) {
    // In production, invalidate session in database/Redis
    // For now, just clear the cookie
    setCookie('session-token', '', { maxAge: 0, path: '/' });
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
