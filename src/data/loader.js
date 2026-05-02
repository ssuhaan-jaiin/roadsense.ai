/*
  CSV loader and analytics helpers for RoadSense AI

  Assumptions about `src/data/accidents.csv` headers (common names expected):
    - accident_id
    - city
    - state
    - latitude
    - longitude
    - risk_score    (numeric 0..1)
    - cause         (string)
    - accident_severity
    - weather
    - casualties    (numeric)
    - datetime      (ISO or parseable string)
    - type          ("highway" | "urban" | other)

  The loader will fetch '/src/data/accidents.csv' (served by Vite during dev).
*/

import Papa from 'papaparse'

// Resolve CSV path so Vite includes it in the build and dev server formats the URL correctly
const CSV_PATH = new URL('../data/accidents.csv', import.meta.url).href

function safeNum(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

/**
 * India & island territories plausible box; rejects ocean / stray coordinates.
 * If CSV columns were swapped ("latitude" holding ~65–99 easting, "longitude" ~6–39 northing), swap before validation.
 */
function normalizeIndiaLatLngPair(rawLat, rawLng) {
  let lat = Number(rawLat)
  let lng = Number(rawLng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { lat: null, lng: null }

  const lngLikeIndia = lat >= 65 && lat <= 100
  const latLikeIndia = lng >= 6 && lng <= 39 && lng < 65
  if (lngLikeIndia && latLikeIndia) {
    ;[lat, lng] = [lng, lat]
  }

  const inBox = lat >= 6.6 && lat <= 37.5 && lng >= 67.9 && lng <= 97.5
  return inBox ? { lat, lng } : { lat: null, lng: null }
}

/** Matches causes pie slices (Explorer Causes tab): order = global frequency among `rows`. */
export const CAUSE_SLICE_COLORS = Object.freeze([
  '#0FFFA1',
  '#F59E0B',
  '#A78BFA',
  '#38BDF8',
  '#FB7185',
  '#C084FC',
  '#FACC15',
  '#94A3B8'
])

/** Colour for crashes whose cause is not in the pie’s top segment set (readable on dark tiles). */
export const CAUSE_OTHER_FILL = '#64748B'

/**
 * Same ordering as {@link getCauseData}: rank 1 cause → palette[0], etc.
 */
export function buildCauseFillColorMap(rows) {
  const top = getCauseData(rows)
  const m = new Map()
  top.forEach((entry, index) => {
    m.set(entry.name, CAUSE_SLICE_COLORS[index % CAUSE_SLICE_COLORS.length])
  })
  return m
}

export function markerFillColor(causeKey, causeFillMap, otherColor = CAUSE_OTHER_FILL) {
  const k = causeKey == null || causeKey === '' ? 'Unknown' : String(causeKey)
  return causeFillMap.has(k) ? causeFillMap.get(k) : otherColor
}

/** Risk tiers: deep palette #0C322D → muted teals → mint → accent #0FFFA1 (heat layer, etc.). */
export function getRiskColor(score) {
  const s = typeof score === 'number' && Number.isFinite(score) ? score : 0
  if (s >= 0.82) return '#0FFFA1'
  if (s >= 0.65) return '#73FFD8'
  if (s >= 0.48) return '#43E8BE'
  if (s >= 0.34) return '#2a9d82'
  if (s >= 0.2) return '#174d44'
  return '#0C322D'
}

export async function loadData() {
  return new Promise((resolve, reject) => {
    fetch(CSV_PATH)
      .then(r => {
        if (!r.ok) {
          console.error('Failed to fetch CSV from', CSV_PATH, 'status:', r.status)
          throw new Error('Failed to fetch CSV')
        }
        return r.text()
      })
      .then(text => {
        Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          complete: (res) => {
            // Normalize rows
            const rows = res.data.map(r => {
              // derive datetime and hour: prefer explicit fields if present
              let datetime = r.datetime ?? null
              if (!datetime && r.date) {
                // try combine date + time (if time exists)
                datetime = r.time ? `${r.date}T${r.time}` : r.date
              }
              let hour = null
              if (typeof r.hour === 'number' && Number.isFinite(r.hour)) hour = r.hour
              else if (datetime) {
                const d = new Date(datetime)
                if (!isNaN(d)) hour = d.getHours()
              }

              // normalize road type: CSV uses `road_type` header
              const roadTypeRaw = r.road_type ?? r.type ?? ''

              const coords = normalizeIndiaLatLngPair(r.latitude, r.longitude)

              return {
                accident_id: r.accident_id ?? r.id ?? null,
                city: r.city ?? null,
                state: r.state ?? null,
                latitude: coords.lat,
                longitude: coords.lng,
                risk_score: typeof r.risk_score === 'number' ? r.risk_score : safeNum(r.risk_score),
                cause: r.cause ?? 'Unknown',
                accident_severity: r.accident_severity ?? null,
                weather: r.weather ?? null,
                casualties: safeNum(r.casualties ?? r.num_casualties ?? 0),
                datetime: datetime,
                hour: hour,
                type: (String(roadTypeRaw || '').toLowerCase())
              }
            })

            resolve(rows)
          },
          error: (err) => reject(err)
        })
      })
      .catch(reject)
  })
}

export function getStateStats(rows) {
  const map = new Map()
  for (const r of rows) {
    const key = r.state || 'Unknown'
    if (!map.has(key)) map.set(key, { state: key, count: 0, totalCasualties: 0, sumRisk: 0, causes: new Map(), weathers: new Map() })
    const cur = map.get(key)
    cur.count += 1
    cur.totalCasualties += (r.casualties || 0)
    cur.sumRisk += (r.risk_score || 0)
    // causes
    const c = r.cause || 'Unknown'
    cur.causes.set(c, (cur.causes.get(c) || 0) + 1)
    const w = r.weather || 'Unknown'
    cur.weathers.set(w, (cur.weathers.get(w) || 0) + 1)
  }

  const out = Array.from(map.values()).map(s => {
    // top cause
    let topCause = null
    let topCauseCount = 0
    for (const [k,v] of s.causes) if (v > topCauseCount) { topCause = k; topCauseCount = v }
    let topWeather = null
    let topWeatherCount = 0
    for (const [k,v] of s.weathers) if (v > topWeatherCount) { topWeather = k; topWeatherCount = v }
    return {
      state: s.state,
      count: s.count,
      totalCasualties: s.totalCasualties,
      avgRiskScore: s.count ? +(s.sumRisk / s.count).toFixed(3) : 0,
      topCause: topCause || null,
      topWeather: topWeather || null
    }
  })

  out.sort((a,b) => b.count - a.count)
  return out
}

export function getHotspots(rows, n = 300) {
  const withCoords = rows.filter(
    r => Number.isFinite(r.latitude) && Number.isFinite(r.longitude)
  )
  return withCoords
    .slice()
    .sort((a,b) => (b.risk_score || 0) - (a.risk_score || 0))
    .slice(0, n)
    .map(r => ({
      accident_id: r.accident_id,
      city: r.city,
      state: r.state,
      latitude: r.latitude,
      longitude: r.longitude,
      risk_score: r.risk_score,
      cause: r.cause,
      accident_severity: r.accident_severity,
      weather: r.weather,
      casualties: r.casualties
    }))
}

export function filterRows(rows, type) {
  if (!type || type === 'all') return rows
  const t = type.toLowerCase()
  if (t === 'highway') return rows.filter(r => (r.type || '').includes('highway'))
  if (t === 'urban') return rows.filter(r => (r.type || '').includes('urban'))
  if (t === 'weather') return rows.filter(r => !!r.weather && r.weather.toLowerCase() !== 'clear')
  if (t === 'night') return rows.filter(r => typeof r.hour === 'number' && (r.hour < 6 || r.hour >= 20))
  return rows
}

export function getCauseData(rows) {
  const counts = new Map()
  for (const r of rows) counts.set(r.cause, (counts.get(r.cause) || 0) + 1)
  const arr = Array.from(counts.entries()).map(([name, value]) => ({ name, value }))
  arr.sort((a,b) => b.value - a.value)
  return arr.slice(0,5)
}

export function getHourlyData(rows) {
  const hours = Array.from({length:24}, (_,i) => ({ hour: i, accidents: 0, sumRisk: 0 }))
  for (const r of rows) {
    const h = typeof r.hour === 'number' ? r.hour : (r.datetime ? new Date(r.datetime).getHours() : null)
    if (h === null || Number.isNaN(h)) continue
    hours[h].accidents += 1
    hours[h].sumRisk += (r.risk_score || 0)
  }
  return hours.map(h => ({ hour: h.hour, accidents: h.accidents, avgRisk: h.accidents ? +(h.sumRisk / h.accidents).toFixed(3) : 0 }))
}

export function getNationalStats(rows) {
  const totalAccidents = rows.length
  const totalCasualties = rows.reduce((s,r) => s + (r.casualties || 0), 0)
  const avgRiskScore = totalAccidents ? +(rows.reduce((s,r) => s + (r.risk_score || 0), 0) / totalAccidents).toFixed(3) : 0
  const stateStats = getStateStats(rows)
  const worstState = stateStats.length ? stateStats[0].state : null
  return { totalAccidents, totalCasualties, avgRiskScore, worstState }
}

