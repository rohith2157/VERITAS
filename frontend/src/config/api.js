/**
 * Veritas Microservice API Routing Configuration
 * 
 * Dynamically resolves endpoints for both local development (Vite reverse proxy)
 * and cloud production deployments (Render blueprints / custom domains).
 */

const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export const AI_ENGINE_URL = normalizeUrl(import.meta.env.VITE_AI_ENGINE_URL);
export const BACKEND_URL = normalizeUrl(import.meta.env.VITE_BACKEND_URL);

/**
 * Returns full API URL for a given endpoint path.
 * 
 * In local dev (empty env vars): returns the relative path (e.g. /api/classrooms) so Vite dev proxy handles it.
 * In cloud production (Render): prefixes with the respective service URL.
 */
export function getApiUrl(path) {
  if (!path) return '';

  let cleanPath = String(path).trim();

  // Handle accidental hardcoded localhost URLs in cloud production
  if (cleanPath.startsWith('http://localhost:8080') || cleanPath.startsWith('http://127.0.0.1:8080')) {
    const subPath = cleanPath.replace(/^http:\/\/(localhost|127\.0\.0\.1):8080/, '');
    return BACKEND_URL ? `${BACKEND_URL}${subPath}` : subPath;
  }

  if (cleanPath.startsWith('http://localhost:8000') || cleanPath.startsWith('http://127.0.0.1:8000')) {
    const subPath = cleanPath.replace(/^http:\/\/(localhost|127\.0\.0\.1):8000/, '');
    return AI_ENGINE_URL ? `${AI_ENGINE_URL}${subPath}` : subPath;
  }

  // Already an absolute external URL
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  if (!cleanPath.startsWith('/')) {
    cleanPath = `/${cleanPath}`;
  }

  // AI Engine endpoints (Python FastAPI)
  if (cleanPath.startsWith('/api/v1') || cleanPath === '/health') {
    return AI_ENGINE_URL ? `${AI_ENGINE_URL}${cleanPath}` : cleanPath;
  }

  // Backend endpoints (Spring Boot 3)
  if (cleanPath.startsWith('/api')) {
    return BACKEND_URL ? `${BACKEND_URL}${cleanPath}` : cleanPath;
  }

  return cleanPath;
}

/**
 * Unified fetch wrapper that automatically routes to the appropriate microservice.
 */
export async function apiFetch(path, options = {}) {
  const url = getApiUrl(path);
  return fetch(url, options);
}

/**
 * Automatically installs a transparent fetch interceptor on window.fetch
 * so that all existing and future component API calls seamlessly resolve
 * against Render microservice domains when deployed, while preserving 100%
 * compatibility with local development proxying.
 */
export function setupApiInterceptor() {
  if (typeof window === 'undefined' || window.__VERITAS_API_INTERCEPTOR_INSTALLED__) {
    return;
  }
  const originalFetch = window.fetch.bind(window);
  window.fetch = function(resource, init) {
    try {
      if (typeof resource === 'string') {
        const resolved = getApiUrl(resource);
        return originalFetch(resolved, init);
      } else if (resource && typeof resource.url === 'string') {
        const resolved = getApiUrl(resource.url);
        if (resolved !== resource.url) {
          const newRequest = new Request(resolved, resource);
          return originalFetch(newRequest, init);
        }
      }
    } catch {
      // Fallback cleanly to original fetch on any unexpected parameter format
    }
    return originalFetch(resource, init);
  };
  window.__VERITAS_API_INTERCEPTOR_INSTALLED__ = true;
}

export default {
  AI_ENGINE_URL,
  BACKEND_URL,
  getApiUrl,
  apiFetch,
  setupApiInterceptor
};
