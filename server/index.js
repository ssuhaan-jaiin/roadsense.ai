/**
 * Simple Express proxy for Gemini insights (placeholder)
 * - Loads env with dotenv
 * - Runs on PORT (default 3001)
 * - POST /api/gemini-insights accepts { locationData }
 * - Returns { text: 'test response' } for now
 */

const path = require('path')

require('dotenv').config({ path: path.join(__dirname, '.env') })
const express = require('express')
const cors = require('cors')
// We'll call the Generative Language REST endpoint directly using fetch
// Node 18+ includes global fetch; no additional SDKs required

const app = express()
const PORT = process.env.PORT || 3001

// Selected model will be determined at server start
let SELECTED_MODEL = null

function geminiApiKey() {
  return process.env.GEMINI_KEY || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
}

async function chooseModelAtStartup() {
  try {
    const apiKey = geminiApiKey()
    if (!apiKey) {
      console.warn('GEMINI_KEY not set; cannot auto-select Gemini model at startup')
      return
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    const r = await fetch(url)
    if (!r.ok) {
      const txt = await r.text().catch(() => '')
      console.error('Failed to list models at startup:', r.status, txt)
      return
    }
    const j = await r.json()
    const models = Array.isArray(j.models) ? j.models : []
    // filter models that support generateContent
    const genModels = models.filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
    if (!genModels.length) {
      console.warn('No models supporting generateContent found for this API key')
      return
    }

    // preference order
    const preferredOrder = [
      'models/gemini-2.5-flash',
      'models/gemini-flash-latest'
    ]

    // try exact preferences
    for (const pref of preferredOrder) {
      const found = genModels.find(m => m.name === pref)
      if (found) { SELECTED_MODEL = found.name; break }
    }

    // if not found, prefer any with 'flash' or 'pro'
    if (!SELECTED_MODEL) {
      const found = genModels.find(m => /flash/i.test(m.name) || /pro/i.test(m.name))
      if (found) SELECTED_MODEL = found.name
    }

    // fallback to first available
    if (!SELECTED_MODEL && genModels.length) SELECTED_MODEL = genModels[0].name

    if (SELECTED_MODEL) console.log('Using Gemini model:', SELECTED_MODEL)
  } catch (e) {
    console.error('Error during model selection at startup', e && e.message ? e.message : e)
  }
}

/** Google REST path uses `{model}:generateContent` without the `models/` prefix from ListModels. */
function resourceModelSegment() {
  if (!SELECTED_MODEL) return 'gemini-2.5-flash'
  return String(SELECTED_MODEL).replace(/^models\//, '')
}

function parseGoogleGeminiErrorText(errText) {
  try {
    const j = JSON.parse(errText)
    const msg = j && j.error && typeof j.error.message === 'string' ? j.error.message : null
    return msg || errText
  } catch {
    return errText
  }
}

/** Concatenate every `parts[].text` string (some responses split across parts). */
function extractGeminiCandidateText(json) {
  try {
    if (!json || !Array.isArray(json.candidates) || !json.candidates.length) return null
    const c = json.candidates[0]
    const parts = c && c.content && Array.isArray(c.content.parts) ? c.content.parts : null
    if (!parts || !parts.length) return null
    const blobs = []
    for (const p of parts) {
      if (p && typeof p.text === 'string' && p.text.trim()) blobs.push(p.text)
    }
    return blobs.length ? blobs.join('\n').trim() : null
  } catch {
    return null
  }
}

/** Model fallbacks when one SKU hits quota (often per-model on free tier). */
function orderedModelCandidates() {
  const primary = resourceModelSegment()
  const tier = [
    primary,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-flash-latest'
  ]
  const seen = new Set()
  const out = []
  for (const m of tier) {
    const seg = String(m).replace(/^models\//, '')
    if (seg && !seen.has(seg)) {
      seen.add(seg)
      out.push(seg)
    }
  }
  return out
}

app.use(cors())
app.use(express.json())

app.post('/api/gemini-insights', async (req, res) => {
  try {
    const { locationData } = req.body || {}
  // Build a single prompt string combining system instructions and location context
  const promptLines = []

promptLines.push('Context: The user sees statistics from a MULTI-FACTOR ROAD ACCIDENT dataset across major Indian cities (2022–2025). These reflect real-world traffic crashes influenced by humans, infrastructure, weather, and contextual factors.')
promptLines.push('You specialise in Indian road safety analytics. Interpret patterns in terms of probabilistic risk factors (traffic, weather, infrastructure, time), not assumptions about autonomous vehicles.')
promptLines.push('Respond with exactly 3 bullet points, max 18 words each. No preamble.')
promptLines.push('Bullet 1: key interaction between traffic conditions, weather, visibility, or time affecting risk.')
promptLines.push('Bullet 2: dominant accident pattern implied (severity, peak hours, density, road type, or collisions).')
promptLines.push('Bullet 3: one concrete infrastructure, enforcement, or policy lever to reduce risk.')
promptLines.push('Format: exactly three lines starting with •')
promptLines.push('')

promptLines.push(`City: ${locationData?.name || ''}`)
promptLines.push(`Accidents: ${locationData?.count || ''} | Top severity: ${locationData?.topSeverity || ''}`)
promptLines.push(`Top factor: ${locationData?.topCause || ''} | Risk score: ${locationData?.avgRiskScore || ''}`)
promptLines.push(`Weather: ${locationData?.topWeather || ''} | Visibility: ${locationData?.visibility || ''}`)
promptLines.push(`Road type: ${locationData?.roadType || ''} | Traffic density: ${locationData?.trafficDensity || ''}`)
promptLines.push(`Temporal pattern: ${locationData?.peakHour || ''} | Weekend: ${locationData?.weekend || ''}`)
promptLines.push(`Contextual factors: ${locationData?.festival || ''}`)
  const prompt = promptLines.join('\n')

    const apiKey = geminiApiKey()
    if (!apiKey) {
      const msg = 'No Gemini API key on server. Set GEMINI_KEY (or GEMINI_API_KEY / GOOGLE_API_KEY) in server/.env and restart.'
      console.error(msg)
      return res.status(400).json({ error: 'missing_gemini_key', message: msg })
    }
    try {
      const body = {
        contents: [{ parts: [{ text: prompt }] }]
      }

      let lastErr = ''
      let lastStatus = 0

      for (const modelSegment of orderedModelCandidates()) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelSegment)}:generateContent?key=${encodeURIComponent(apiKey)}`
        const r = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        })

        const errText = r.ok ? '' : await r.text().catch(() => '')

        if (!r.ok) {
          lastStatus = r.status
          lastErr = parseGoogleGeminiErrorText(errText || `HTTP ${r.status}`)
          console.error('Gemini generateContent failed', modelSegment, r.status, lastErr.slice(0, 280))
          const tryNextModel =
            r.status === 429 ||
            r.status === 404 ||
            r.status === 503 ||
            /RESOURCE_EXHAUSTED|quota|rate|not found for API version|is not supported/i.test(lastErr)
          if (tryNextModel) continue
          return res.status(502).json({ error: 'gemini_api_error', status: r.status, message: lastErr })
        }

        const json = await r.json().catch(() => null)
        const text = extractGeminiCandidateText(json)
        if (text) {
          if (modelSegment !== resourceModelSegment()) {
            console.log('Insights used fallback model:', modelSegment)
          }
          return res.json({ text })
        }

        console.error('No usable text from model', modelSegment, JSON.stringify(json).slice(0, 600))
        lastErr = 'No text in Gemini response (model may have blocked output).'
        lastStatus = 502
      }

      return res.status(502).json({
        error: 'gemini_exhausted',
        status: lastStatus || 429,
        message: lastErr || 'All Gemini model attempts failed.'
      })
    } catch (e) {
      console.error('Error calling Generative Language REST API:', e && e.message ? e.message : e)
      return res.status(502).json({ error: 'gemini_call_failed', message: String(e && e.message ? e.message : e) })
    }
  } catch (err) {
    console.error('Error in /api/gemini-insights', err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// Endpoint: list available models for the configured API key
app.get('/api/gemini-list-models', async (req, res) => {
  try {
    const apiKey = geminiApiKey()
    if (!apiKey) return res.status(400).json({ error: 'missing_gemini_key', message: 'GEMINI_KEY not set on server.' })

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
    const r = await fetch(url)
    const text = await r.text()
    // If non-OK, forward status and body
    if (!r.ok) {
      console.error('ListModels error:', r.status, text)
      try {
        // try parse JSON
        const j = JSON.parse(text)
        return res.status(502).json({ error: 'models_list_error', status: r.status, body: j })
      } catch (e) {
        return res.status(502).json({ error: 'models_list_error', status: r.status, body: text })
      }
    }

    // success — return parsed JSON
    try {
      const j = JSON.parse(text)
      return res.json(j)
    } catch (e) {
      // unlikely; return raw
      return res.send(text)
    }
  } catch (err) {
    console.error('Error in /api/gemini-list-models', err)
    return res.status(500).json({ error: 'internal_error' })
  }
})

// NOTE: Deterministic fallback generator removed per requirements — server now calls Generative Language REST API

async function start() {
  await chooseModelAtStartup()
  app.listen(PORT, () => {
    console.log(`roadsense-ai server listening on http://localhost:${PORT}`)
  })
}

start().catch(err => {
  console.error('Server failed to start:', err && err.message ? err.message : err)
  process.exit(1)
})
