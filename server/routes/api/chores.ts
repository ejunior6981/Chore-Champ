import { getCookie, readBody, sendRedirect, setCookie } from 'nitro/h3';
import { verifySessionToken } from './auth';
import { Chore, Child, User, ActivityEvent } from '../../types';

// Rate limiting storage
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  const record = rateLimitMap.get(key)!;
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  record.count++;
  return true;
}

// GET /api/chores - Get chores for authenticated user
export async function onRequestGetChores(event: { cookie: { 'session-token'?: string } }) {
  const token = getCookie(event, 'session-token');
  
  if (!token) {
    return sendRedirect(event, '/login', 302);
  }
  
  const session = verifySessionToken(token);
  if (!session) {
    return sendRedirect(event, '/login', 302);
  }
  
  // In production, fetch from database with proper filtering
  // For now, return mock data structure
  const chores: Chore[] = [];
  
  return new Response(JSON.stringify({ chores }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST /api/chores - Create chore with authorization check
export async function onRequestPostChores(event: { cookie: { 'session-token'?: string } }, params: { body: string | object }) {
  const token = getCookie(event, 'session-token');
  
  if (!token) {
    return sendRedirect(event, '/login', 302);
  }
  
  const session = verifySessionToken(token);
  if (!session) {
    return sendRedirect(event, '/login', 302);
  }
  
  const body = await readBody(event);
  const data = typeof body === 'string' ? JSON.parse(body) : body;
  
  // Authorization: Only parents can assign chores to children
  if (session.role === 'child' && data.assignedTo) {
    return new Response(JSON.stringify({ error: 'Children cannot assign chores to others' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Rate limiting
  if (!checkRateLimit(`chore:${session.userId}`)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Input validation
  if (!data.title || typeof data.title !== 'string') {
    return new Response(JSON.stringify({ error: 'Title is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (data.title.length > 100) {
    return new Response(JSON.stringify({ error: 'Title too long (max 100 characters)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Sanitize description
  const description = data.description ? String(data.description).substring(0, 500) : '';
  
  // In production, create chore in database
  const chore: Chore = {
    id: Date.now(),
    title: data.title,
    description,
    dueDate: data.dueDate || '',
    schedule: {
      type: 'DEADLINE',
      value: data.dueDate || '',
      scheduleType: 'DEADLINE',
      varianceDays: null
    },
    isExtraChore: false,
    completionConfig: null,
    assignedTo: data.assignedTo || null,
    createdBy: session.userId,
    createdAt: new Date().toISOString(),
    isCompleted: false
  };
  
  return new Response(JSON.stringify({ chore }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// DELETE /api/chores/:id - Delete chore with authorization
export async function onRequestDeleteChores(event: { cookie: { 'session-token'?: string } }, params: { params: { id: string } }) {
  const token = getCookie(event, 'session-token');
  
  if (!token) {
    return sendRedirect(event, '/login', 302);
  }
  
  const session = verifySessionToken(token);
  if (!session) {
    return sendRedirect(event, '/login', 302);
  }
  
  // Rate limiting
  if (!checkRateLimit(`chore-delete:${session.userId}`)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // In production, delete from database and verify ownership
  // For now, return success
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// GET /api/users - Get users (parent can see all, child sees only their info)
export async function onRequestGetUsers(event: { cookie: { 'session-token'?: string } }) {
  const token = getCookie(event, 'session-token');
  
  if (!token) {
    return sendRedirect(event, '/login', 302);
  }
  
  const session = verifySessionToken(token);
  if (!session) {
    return sendRedirect(event, '/login', 302);
  }
  
  // In production, fetch from database
  // Parent sees all users, child only sees themselves
  const users: User[] = [];
  
  return new Response(JSON.stringify({ users }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST /api/users - Create user (parent only)
export async function onRequestPostUsers(event: { cookie: { 'session-token'?: string } }, params: { body: string | object }) {
  const token = getCookie(event, 'session-token');
  
  if (!token) {
    return sendRedirect(event, '/login', 302);
  }
  
  const session = verifySessionToken(token);
  if (!session) {
    return sendRedirect(event, '/login', 302);
  }
  
  // Authorization: Only parents can create users
  if (session.role !== 'parent') {
    return new Response(JSON.stringify({ error: 'Only parents can create users' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const body = await readBody(event);
  const data = typeof body === 'string' ? JSON.parse(body) : body;
  
  // Authorization: Cannot assign PIN directly, must be generated server-side
  if (data.pin) {
    return new Response(JSON.stringify({ error: 'PIN must be generated server-side, not sent in client request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Rate limiting
  if (!checkRateLimit(`user-create:${session.userId}`)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Input validation
  if (!data.name || typeof data.name !== 'string') {
    return new Response(JSON.stringify({ error: 'Name is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (data.name.length > 50) {
    return new Response(JSON.stringify({ error: 'Name too long (max 50 characters)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Sanitize name
  const name = data.name.replace(/[<>]/g, '');
  
  if (!data.age || typeof data.age !== 'number') {
    return new Response(JSON.stringify({ error: 'Age is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (data.age < 0 || data.age > 100) {
    return new Response(JSON.stringify({ error: 'Invalid age' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // In production, create user with hashed PIN in database
  const user: User = {
    id: Date.now(),
    name: name,
    age: data.age,
    role: 'child'
  };
  
  return new Response(JSON.stringify({ user }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
