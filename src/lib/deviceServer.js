/**
 * Server-side helper to extract or generate a persistent device ID from Next.js requests.
 */
export function getDeviceIdFromRequest(req, explicitBodyId = null) {
  // 1. Direct explicit ID in JSON body or passed parameter
  if (explicitBodyId && typeof explicitBodyId === 'string' && explicitBodyId.trim().length >= 6) {
    return explicitBodyId.trim();
  }

  // 2. Query parameter
  try {
    const url = new URL(req.url, 'http://localhost');
    const queryId = url.searchParams.get('deviceId');
    if (queryId && typeof queryId === 'string' && queryId.trim().length >= 6) {
      return queryId.trim();
    }
  } catch {}

  // 3. Custom header
  try {
    const headerId = req.headers?.get?.('x-device-id');
    if (headerId && headerId.trim().length >= 6) {
      return headerId.trim();
    }
  } catch {}

  // 4. Cookie v1_device_id
  try {
    if (req.cookies?.get) {
      const cookieVal = req.cookies.get('v1_device_id')?.value;
      if (cookieVal && cookieVal.trim().length >= 6) {
        return cookieVal.trim();
      }
    }
  } catch {}

  // 5. Raw cookie header if req.cookies not parsed
  try {
    const rawCookie = req.headers?.get?.('cookie') || '';
    const match = rawCookie.match(/(?:^|;\s*)v1_device_id=([^;]+)/);
    if (match && match[1] && decodeURIComponent(match[1]).trim().length >= 6) {
      return decodeURIComponent(match[1]).trim();
    }
  } catch {}

  // 6. Fallback: generate a unique ID
  const rand1 = Math.random().toString(36).substring(2, 10);
  const rand2 = Math.random().toString(36).substring(2, 10);
  return `dev_${Date.now().toString(36)}_${rand1}_${rand2}`;
}
