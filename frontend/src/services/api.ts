// Professional API client for the frontend
// - Follows industry best practices (Amazon, Daraz, etc.)
// - Includes proper headers, request IDs, and error handling

// Prefer same-origin in dev (works with CRA `"proxy": "http://localhost:4000"`),
// so cookies/auth behave like a real app without cross-site cookie restrictions.
// For production, set REACT_APP_API_BASE_URL to your deployed backend.
const API_BASE = process.env.REACT_APP_API_BASE_URL || '';
const API_VERSION = process.env.REACT_APP_API_VERSION || '1.0.0';
const CLIENT_VERSION = process.env.REACT_APP_CLIENT_VERSION || '1.0.0';

// Generate unique client ID (stored in sessionStorage)
function getClientId(): string {
  const key = 'carriya_client_id';
  let clientId = sessionStorage.getItem(key);
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, clientId);
  }
  return clientId;
}

// Generate or get session ID (for guest cart support - Amazon/Daraz style)
function getSessionId(): string {
  const key = 'carriya_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

// Generate request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestResult<T> = {
  data: T | null;
  response: Response;
};

function normalizeHeaders(headers: Headers): Record<string, string> {
  const map: Record<string, string> = {};
  headers.forEach((value, key) => {
    map[key.toLowerCase()] = value;
  });
  return map;
}

async function executeRequest<T>(path: string, options: RequestInit = {}): Promise<RequestResult<T>> {
  const url = `${API_BASE}${path}`;
  const requestId = generateRequestId();
  const clientId = getClientId();
  
  // Professional headers (like Amazon, Daraz, etc.)
  const headers = new Headers(options.headers || {});
  
  // Standard headers
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Professional request identification
  headers.set('X-Request-ID', requestId);
  headers.set('X-Client-ID', clientId);
  headers.set('X-Session-ID', getSessionId()); // For guest cart support
  headers.set('X-API-Version', API_VERSION);
  headers.set('X-Client-Version', CLIENT_VERSION);
  headers.set('X-Platform', 'web');
  headers.set('X-Requested-With', 'XMLHttpRequest');
  
  // User agent (professional practice)
  headers.set('User-Agent', `Carriya-Web/${CLIENT_VERSION} (Web Client)`);
  
  // Accept headers
  headers.set('Accept', 'application/json');
  headers.set('Accept-Language', navigator.language || 'en-US');
  
  // Timestamp for request tracking
  headers.set('X-Request-Timestamp', new Date().toISOString());
  
  
  const res = await fetch(url, { ...options, headers, credentials: 'include' });
  
  // Log response headers for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    const responseId = res.headers.get('X-Request-ID');
    const responseTime = res.headers.get('X-Response-Time');
    if (responseId || responseTime) {
      console.log(`[API] ${options.method || 'GET'} ${path}`, {
        requestId,
        responseId,
        responseTime,
        status: res.status,
      });
    }
  }
  
  if (res.status === 304) {
    return {
      data: null,
      response: res,
    };
  }

  if (!res.ok) {
    const maybeJson = await safeJson(res);

    // If backend says the account is suspended/pending, force client logout.
    // This is how large marketplaces ensure a blocked user can't keep using an old session.
    const authCode = maybeJson?.meta?.code;
    if ((res.status === 401 || res.status === 403) && (authCode === 'ACCOUNT_SUSPENDED' || authCode === 'ACCOUNT_PENDING_APPROVAL')) {
      try {
        localStorage.removeItem('user');
      } catch {}
      try {
        window.dispatchEvent(new CustomEvent('carriya:auth:forced-logout', { detail: { code: authCode } }));
      } catch {}
    }

    const errorMessage = (maybeJson && (maybeJson.error || maybeJson.message)) || `HTTP ${res.status}`;
    const error = new Error(errorMessage) as any;
    error.response = {
      status: res.status,
      data: maybeJson,
      headers: {
        requestId: res.headers.get('X-Request-ID'),
        responseTime: res.headers.get('X-Response-Time'),
        apiVersion: res.headers.get('X-API-Version'),
      },
    };
    throw error;
  }
  
  // Handle professional response format { success: true, data: ... }
  const jsonData = await safeJson(res);
  if (jsonData && typeof jsonData === 'object' && 'success' in jsonData && 'data' in jsonData) {
    return {
      data: jsonData.data as T,
      response: res,
    };
  }
  
  // Fallback for non-standard responses
  return {
    data: jsonData as T,
    response: res,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const result = await executeRequest<T>(path, options);
  return result.data as T;
}

async function requestWithMeta<T>(path: string, options: RequestInit = {}) {
  const result = await executeRequest<T>(path, options);
  return {
    data: result.data as T | null,
    status: result.response.status,
    headers: normalizeHeaders(result.response.headers),
  };
}

async function safeJson(res: Response) {
  const ct = res.headers.get('Content-Type') || '';
  if (ct.includes('application/json')) return res.json();
  if (res.status === 204) return null;
  try { return await res.json(); } catch { return null; }
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...(init || {}), method: 'GET' }),
  post: <T>(path: string, body?: any, init?: RequestInit) => request<T>(path, { ...(init || {}), method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: <T>(path: string, body?: any, init?: RequestInit) => request<T>(path, { ...(init || {}), method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: <T>(path: string, body?: any, init?: RequestInit) => request<T>(path, { ...(init || {}), method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...(init || {}), method: 'DELETE' }),
  getWithMeta: <T>(path: string, init?: RequestInit) => requestWithMeta<T>(path, { ...(init || {}), method: 'GET' }),
  baseUrl: API_BASE,
};

export default api;


