import React, { useEffect, useId, useState } from 'react'
import { getAVInsights } from '../services/geminiApi'

const BULLET_ROWS = Object.freeze([
  { key: 'r', suffix: 'risk', label: 'Environmental Challenge' },
  { key: 's', suffix: 'scenario', label: 'Collision Pattern Implied' },
  { key: 'p', suffix: 'policy', label: 'Policy Suggestion' }
])

export default function AIInsightPanel({ locationData = null }) {
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState(null)
  const bodyId = useId()

  useEffect(() => {
    let mounted = true
    if (!locationData) {
      setText(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setText(null)
    const payload = {
      name: locationData.name ?? (locationData.city ? `${locationData.city}${locationData.state ? ', ' + locationData.state : ''}` : null),
      count: locationData.count ?? locationData.accidents ?? 1,
      topCause: locationData.topCause ?? locationData.cause ?? null,
      topWeather: locationData.topWeather ?? locationData.weather ?? null,
      avgRiskScore: locationData.avgRiskScore ?? locationData.risk_score ?? null,
      roadType: locationData.roadType ?? locationData.type ?? null,
      casualties: locationData.casualties ?? locationData.casualty ?? null,
      latitude: locationData.latitude ?? null,
      longitude: locationData.longitude ?? null
    }

    getAVInsights(payload).then(res => {
      if (!mounted) return
      setText(res)
      setLoading(false)
    }).catch(() => {
      if (!mounted) return
      setText(null)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [locationData])

  const placeLabel =
    locationData?.name ?? ([locationData?.city, locationData?.state].filter(Boolean).join(', ') || null) ?? ''

  const parseBullets = (str) => {
    if (!str) return []
    return str
      .split(/\n|•/)
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const bullets = parseBullets(text)
  const recordCount = Number(locationData?.count ?? locationData?.accidents ?? 1)
  const countLabel = Number.isFinite(recordCount) && recordCount > 0 ? recordCount : 1

  const riskRaw = locationData?.avgRiskScore ?? locationData?.risk_score
  const riskNum = Number(riskRaw)
  const riskDisplay = Number.isFinite(riskNum) ? riskNum.toFixed(2) : '—'

  const renderPlaceholder = () => (
    <div className="explorer-ai-placeholder">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#0C322D" />
        <circle cx="12" cy="9" r="2.5" fill="rgba(15,255,161,0.45)" />
      </svg>
      <div className="explorer-ai-placeholder-title">Choose a hotspot</div>
      <p className="explorer-ai-placeholder-copy">
        Click any crash dot on the map to load Gemini summaries here (when the insight server has quota).
      </p>
    </div>
  )

  const renderLoading = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="skeleton" style={{ height: 48 }} />
      <div className="skeleton" style={{ height: 40 }} />
      <div className="skeleton" style={{ height: 44 }} />
    </div>
  )

  const renderFilledBody = () => (
    <>
      <div className="ai-insight-meta-block">
        <div className="ai-insight-location-line">{placeLabel || 'Selected location'}</div>
        <div className="ai-insight-meta-row">
          <span
            className="ai-insight-meta-chip"
            title="How many CSV crash rows this map dot represents — here it is normally one sampled record per coordinate."
          >
            {countLabel} {countLabel === 1 ? 'record' : 'records'}
          </span>
          <span
            className="ai-insight-meta-chip"
            title="risk_score column from your dataset on a nominal 0–1 scale within this file."
          >
            Dataset risk · {riskDisplay}
          </span>
          {(locationData.topCause || locationData.cause) && (
            <span
              className="ai-insight-meta-chip"
              title="Listed collision factor for this row (matches pie / marker colour when ranked in top causes)."
            >
              {locationData.topCause ?? locationData.cause}
            </span>
          )}
        </div>
      </div>

      <div className="ai-insight-copy-block">
        {loading && renderLoading()}
        {!loading && bullets.length > 0 && (
          <>
            <div className="ai-insight-bullets-label">Interpretation bullets</div>
            <div className="ai-insight-bullet-stack">
              {BULLET_ROWS.map((row, i) =>
                bullets[i] ? (
                  <div key={row.key} className="ai-insight-block">
                    <span className="ai-insight-block-label">{row.label}</span>
                    <div className={`insight-bullet ${row.suffix}`}>{bullets[i]}</div>
                  </div>
                ) : null
              )}
            </div>
          </>
        )}
        {!loading && bullets.length === 0 && (
          <div style={{ fontSize: 12, color: '#737373' }}>
            Insight text unavailable — try again or check Gemini configuration.
          </div>
        )}
      </div>

      <div className="ai-insight-footer-note">
        Powered by Google Gemini · environment · collision pattern · policy
      </div>
    </>
  )

  return (
    <div className="explorer-ai-panel explorer-ai-panel--embedded is-expanded" aria-label="AI insights and Gemini summaries">
      <div id={bodyId} className="explorer-ai-panel-inner explorer-ai-panel-inner--embedded">
        {!locationData && renderPlaceholder()}
        {locationData && renderFilledBody()}
      </div>
    </div>
  )
}
