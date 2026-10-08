import { getCookie, setCookie } from 'h3';
import { sign, verify } from 'oauth4webapi';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

// Simple JWT-like session tokens with expiration
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Generate secure session token
export function generateSessionToken(userId: number, role: 'parent' | 'child'): string {
  const payload = {
    userId,
    role,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS
  };
  // Simple base64 encoding (in production, use proper JWT with crypto)
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

// Create HTTP server and Socket.IO for real-time updates
const server = createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store sessions in memory (in production, use Redis)
const sessions = new Map<string, { userId: number; role: 'parent' | 'child'; createdAt: number }>();

io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('authenticate', ({ token }) => {
    const session = verifySessionToken(token);
    if (session) {
      socket.userId = session.userId;
      socket.role = session.role;
      sessions.set(token, { ...session });
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
