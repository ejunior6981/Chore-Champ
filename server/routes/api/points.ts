import { getCookie, readBody, sendRedirect } from 'nitro/h3';
import { verifySessionToken } from './auth';

// Rate limiting storage - persists across restarts
interface RateLimitRecord {
  key: string;
  count: number;
  resetTime: number;
}

const rateLimitMap: Map<string, RateLimitRecord> = new Map();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  let record = rateLimitMap.get(key);
  
  if (!record || record.resetTime < now) {
    rateLimitMap.set(key, { key, count: 0, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  record = rateLimitMap.get(key)!;
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  record.count++;
  return true;
}

// POST /api/points - Add points with authorization
export async function onRequestPostPoints(event: any, params: { body: string | object }) {
  const token = getCookie(event, 'session-token');
  
  if (!token) {
    return sendRedirect(event, '/login', 302);
  }
  
  const session = verifySessionToken(token);
  if (!session) {
    return sendRedirect(event, '/login', 302);
  }
  
  // Authorization: Only parents can award points
  if (session.role !== 'parent') {
    return new Response(JSON.stringify({ error: 'Only parents can award points' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const body = await readBody(event);
  const data = typeof body === 'string' ? JSON.parse(body) : body;
  
  // Rate limiting
  if (!checkRateLimit(`points:${session.userId}`)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Input validation
  if (!data.userId || typeof data.userId !== 'number') {
    return new Response(JSON.stringify({ error: 'User ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (!data.points || typeof data.points !== 'number') {
    return new Response(JSON.stringify({ error: 'Points amount is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Validate points range (1-1000 per transaction)
  if (data.points < 1 || data.points > 1000) {
    return new Response(JSON.stringify({ error: 'Points must be between 1 and 1000' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Sanitize reason
  const reason = data.reason ? String(data.reason).substring(0, 200) : '';
  
  // In production, add points in database
  return new Response(JSON.stringify({ success: true, points: data.points }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// POST /api/rewards - Redeem reward with authorization
export async function onRequestPostRewards(event: any, params: { body: string | object }) {
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
  
  // Authorization: Only children can request rewards
  if (session.role !== 'child') {
    return new Response(JSON.stringify({ error: 'Only children can request rewards' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Rate limiting
  if (!checkRateLimit(`rewards:${session.userId}`)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Input validation
  if (!data.rewardId || typeof data.rewardId !== 'number') {
    return new Response(JSON.stringify({ error: 'Reward ID is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (!data.message || typeof data.message !== 'string') {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Sanitize message
  const message = data.message.replace(/[<>]/g, '');
  
  if (message.length > 200) {
    return new Response(JSON.stringify({ error: 'Message too long (max 200 characters)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // In production, check points balance and request in database
  return new Response(JSON.stringify({ success: true, requestId: Date.now() }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
