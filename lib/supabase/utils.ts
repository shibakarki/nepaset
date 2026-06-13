/**
 * Resolves the correct base URL depending on the runtime environment (browser vs. server).
 * Automatically falls back to local development defaults if live variables are missing.
 */
export function getURL() {
  // 1. If we are running in the browser, window.location.origin is always the most accurate URL
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return origin.endsWith('/') ? origin : `${origin}/`;
  }

  // 2. If we are running on the server (SSR, API Routes, Server Actions)
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Manually set under Vercel Environment Variables
    process.env.VERCEL_URL ??           // Built-in Vercel variable (accessible on server-side)
    'localhost:3000'
  
  // Ensure the protocol is included
  url = url.startsWith('http') ? url : `https://${url}`
  // Ensure a trailing slash is appended
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}