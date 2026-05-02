const fs = require('fs')
const Papa = require('papaparse')
const path = './src/data/accidents.csv'
const s = fs.readFileSync(path, 'utf8')
const res = Papa.parse(s, { header: true, dynamicTyping: true, skipEmptyLines: true })
const rows = res.data
const safeNum = v => { const n = Number(v); return Number.isFinite(n) ? n : 0 }
console.log('TOTAL_ROWS=' + rows.length)
console.log('FIRST_3_ROWS=', JSON.stringify(rows.slice(0,3).map(r => ({ accident_id: r.accident_id, city: r.city, state: r.state, latitude: r.latitude, longitude: r.longitude, risk_score: r.risk_score, cause: r.cause, casualties: r.casualties })), null, 2))

// state stats
const map = new Map()
for (const r of rows) {
  const key = r.state || 'Unknown'
  if (!map.has(key)) map.set(key, { state: key, count: 0, totalCasualties: 0, sumRisk: 0, causes: new Map(), weathers: new Map() })
  const cur = map.get(key)
  cur.count++
  cur.totalCasualties += safeNum(r.casualties)
  cur.sumRisk += safeNum(r.risk_score)
  const c = r.cause || 'Unknown'
  cur.causes.set(c, (cur.causes.get(c) || 0) + 1)
  const w = r.weather || 'Unknown'
  cur.weathers.set(w, (cur.weathers.get(w) || 0) + 1)
}
const stateArr = Array.from(map.values()).map(s => {
  let topCause = null, topCount = 0
  for (const [k, v] of s.causes) if (v > topCount) { topCause = k; topCount = v }
  let topWeather = null, twc = 0
  for (const [k, v] of s.weathers) if (v > twc) { topWeather = k; twc = v }
  return { state: s.state, count: s.count, totalCasualties: s.totalCasualties, avgRisk: s.count ? +(s.sumRisk / s.count).toFixed(3) : 0, topCause: topCause, topWeather: topWeather }
})
stateArr.sort((a,b) => b.count - a.count)
console.log('TOP_5_STATES=', JSON.stringify(stateArr.slice(0,5), null, 2))

// hotspots
const hotspots = rows.slice().sort((a,b) => (b.risk_score || 0) - (a.risk_score || 0)).slice(0,5).map(r => ({ accident_id: r.accident_id, city: r.city, state: r.state, latitude: r.latitude, longitude: r.longitude, risk_score: r.risk_score, cause: r.cause, accident_severity: r.accident_severity, weather: r.weather, casualties: r.casualties }))
console.log('TOP_5_HOTSPOTS=', JSON.stringify(hotspots, null, 2))

// national stats
const totalAccidents = rows.length
const totalCasualties = rows.reduce((s,r) => s + safeNum(r.casualties), 0)
const avgRisk = totalAccidents ? +(rows.reduce((s,r) => s + safeNum(r.risk_score), 0) / totalAccidents).toFixed(3) : 0
const worstState = stateArr.length ? stateArr[0].state : null
console.log('NATIONAL_STATS=', JSON.stringify({ totalAccidents, totalCasualties, avgRisk, worstState }, null, 2))
