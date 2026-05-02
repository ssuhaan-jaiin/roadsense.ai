/**
 * India Open Government Data (OGD) — JSON API hosted at api.data.gov.in
 *
 * Example (replace RESOURCE_UUID + KEY from dataset “API” page on data.gov.in):
 *   GET https://api.data.gov.in/resource/{RESOURCE_UUID}.json?api-key=KEY&format=json&limit=10&offset=0
 *
 * Query knobs you can use once you have key + UUID:
 *   - limit / offset — pagination
 *   - filters[field]=value — server-side filters (exact field names from the dataset schema)
 *
 * ⚠️ VITE_* variables are embedded in the client bundle. For production quotas and secrecy,
 *    proxy calls through your backend (similar to Gemini) instead of shipping the API key here.
 */

function trimEnv(key, fallback = '') {
  const v = typeof import.meta !== 'undefined' ? import.meta.env?.[key] : undefined
  if (v == null || String(v).trim() === '') return fallback
  return String(v).trim()
}

/** Default UUID mirrors the `/apis/<uuid>` style URLs on data.gov.in; swap for road-safety/NCRB resource. */
export const DEFAULT_DATAGOV_RESOURCE_ID_EXAMPLE = 'd86112bd-12ff-4761-b58f-ae672121536b'

function resourceBaseUrl(resourceId) {
  return `https://api.data.gov.in/resource/${encodeURIComponent(resourceId)}.json`
}

/**
 * @param {'/status'} endpoint — today only ping used by Explorer (“Live · NCRB” badge hint)
 */
export async function fetchDataGov(endpoint, apiKeyOpt) {
  const key =
    apiKeyOpt != null && String(apiKeyOpt).trim() !== '' ? String(apiKeyOpt).trim() : trimEnv('VITE_DATAGOV_KEY')

  if (endpoint !== '/status') {
    return { data: null }
  }

  if (!key) {
    return { data: { status: 'offline' } }
  }

  const resourceId = trimEnv('VITE_DATAGOV_RESOURCE_ID') || DEFAULT_DATAGOV_RESOURCE_ID_EXAMPLE

  try {
    const url = new URL(resourceBaseUrl(resourceId))
    url.searchParams.set('api-key', key)
    url.searchParams.set('format', 'json')
    url.searchParams.set('limit', '1')

    const res = await fetch(url.toString(), { credentials: 'omit' })
    const body = await res.json().catch(() => ({}))

    if (!res.ok || body?.error) {
      return { data: { status: 'offline' } }
    }

    if (body && typeof body === 'object' && Array.isArray(body.records)) {
      /* Typical success: `{ records, fields, total, ... }`. */
      return { data: { status: 'live' }, _meta: { resourceId } }
    }

    return { data: { status: 'offline' } }
  } catch {
    return { data: { status: 'offline' } }
  }
}

/**
 * Fetch paginated rows for a configured resource — use when wiring live charts / replacing CSV slices.
 *
 * @param {{ limit?: number, offset?: number, filters?: Record<string, string | number> }} opts
 */
export async function fetchDataGovResource(opts = {}) {
  const apiKey = trimEnv('VITE_DATAGOV_KEY')
  const resourceId = trimEnv('VITE_DATAGOV_RESOURCE_ID') || DEFAULT_DATAGOV_RESOURCE_ID_EXAMPLE
  const limit = opts.limit ?? 50
  const offset = opts.offset ?? 0
  const filters = opts.filters ?? {}

  if (!apiKey) {
    throw new Error('Missing VITE_DATAGOV_KEY')
  }

  const url = new URL(resourceBaseUrl(resourceId))
  url.searchParams.set('api-key', apiKey)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', String(limit))
  url.searchParams.set('offset', String(offset))

  for (const [k, v] of Object.entries(filters)) {
    url.searchParams.set(`filters[${k}]`, String(v))
  }

  const res = await fetch(url.toString(), { credentials: 'omit' })
  const body = await res.json().catch(() => ({}))

  if (!res.ok || body?.error) {
    const msg = typeof body?.error === 'string' ? body.error : `HTTP ${res.status}`
    throw new Error(msg)
  }

  return body
}
