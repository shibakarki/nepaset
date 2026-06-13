/**
 * Resolves the correct base URL depending on the runtime environment.
 * Automatically falls back to local development defaults if live variables are missing.
 */
export function getURL() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Defined as https://shibakarki-nepaset.vercel.app on Vercel
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Handled automatically by Vercel
    'http://localhost:3000/'
  
  // Ensure the protocol is included
  url = url.startsWith('http') ? url : `https://${url}`
  // Ensure a trailing slash is appended
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}