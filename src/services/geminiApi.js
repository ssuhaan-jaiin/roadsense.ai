function insightEndpoint() {
  const u = import.meta.env.VITE_GEMINI_INSIGHT_URL
  if (typeof u === 'string' && u.trim()) return u.trim()
  return '/api/gemini-insights'
}

function collapse(s) {
  return typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : ''
}

function setupHint() {
  return collapse(
    'Insight server: in a second repo terminal run npm run server. Keep npm run dev running. Put GEMINI_KEY (or GEMINI_API_KEY / GOOGLE_API_KEY) in server/.env and restart npm run server.'
  )
}

/** User-visible copy when upstream fails (must not imply “nothing is configured” when it is quota). */
function clarifyInsightFailure(status, upstreamMessage) {
  const u = collapse(upstreamMessage)
  const quota =
    status === 429 ||
    /quota|RESOURCE_EXHAUSTED|rate limit|exceeded your current quota|free_tier_requests/i.test(u)

  if (quota) {
    const snippet = u.slice(0, 240)
    return collapse(
      `Gemini quota or rate limit: ${snippet} Free tiers reset periodically — wait and click the hotspot again or enable billing in Google AI Studio. Your insight server reached Google OK; this is an API quota message, not a missing server.`
    )
  }

  if (status === 400 && /GEMINI|missing_gemini|API key/i.test(u)) {
    return collapse(`${u || 'API key missing on server.'} ${setupHint()}`)
  }

  if (/blocked|finishReason|safety/i.test(u)) {
    return collapse(
      `Gemini declined to return text for this prompt. Try another crash point. (${u.slice(0, 260)})`
    )
  }

  const net = typeof status === 'number' ? status : 0
  if (net >= 502 && !u) {
    return collapse(`Could not reach insight backend on port 3001. ${setupHint()}`)
  }

  return u
    ? collapse(`Insights failed (${net || '?'}): ${u.slice(0, 460)}`)
    : collapse(`Insights failed (${net || '?'}). ${setupHint()}`)
}

/**
 * Request AV insights for a location from the server-side Gemini proxy.
 * Sends: { locationData }
 * Dev: `/api/gemini-insights` proxies to localhost:3001 (Vite).
 */
export async function getAVInsights(locationData) {
  try {
    const res = await fetch(insightEndpoint(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locationData })
    })

    const json =
      res.headers.get('content-type')?.includes('application/json') ? await res.json().catch(() => null) : null

    if (!res.ok) {
      const upstream =
        json && typeof json.message === 'string'
          ? json.message
          : json && typeof json.error === 'string'
            ? json.error
            : ''
      const code = typeof json?.status === 'number' ? json.status : res.status
      const body = clarifyInsightFailure(code || res.status, upstream)
      console.error('Insight API error', res.status, '→', collapse(body).slice(0, 200))
      return body
    }

    if (json && typeof json.text === 'string') return json.text

    console.error('Insight API returned no json.text')
    return clarifyInsightFailure(res.status, 'Empty response body')
  } catch (err) {
    console.error('Failed to reach insight API', err)
    return `${setupHint()}\n\n Network error: ${err && err.message ? err.message : String(err)}`
  }
}
