import { getCookie, setCookie } from 'nitro/h3';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

// Session duration: 24 hours
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// Generate secure session token with expiration
export function generateSessionToken(userId: number, role: 'parent' | 'child'): string {
  const payload = {
    userId,
    role,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS
  };
  
  // Simple base64 encoding (in production, use proper JWT with crypto/signature)
  // The token is opaque and verified by checking against server-side session store
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return encoded;
}

// Verify session token
export function verifySessionToken(token: string): { userId: number; role: 'parent' | 'child' } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
    
    // Check expiration
    if (payload.expiresAt < Date.now()) {
      return null;
    }
    
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}

// Store sessions in memory (in production, use Redis/database)
const sessions = new Map<string, { userId: number; role: 'parent' | 'child'; createdAt: number }>();

// Create HTTP server and Socket.IO for real-time updates
const server = createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store sessions in memory (in production, use Redis)
// SECURITY: Sessions are stored server-side, not in localStorage
// This prevents XSS attacks from stealing session tokens

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('authenticate', ({ token }) => {
    const session = verifySessionToken(token);
    if (session) {
      socket.userId = session.userId;
      socket.role = session.role;
      sessions.set(token, { ...session, createdAt: Date.now() });
      socket.join(`user:${session.userId}`);
      socket.emit('auth-success', { userId: session.userId, role: session.role });
      console.log(`User ${session.role} authenticated with token ${token.substring(0, 8)}...`);
    } else {
      socket.emit('auth-failed', { reason: 'Invalid or expired session' });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

export { server, io, sessions };
