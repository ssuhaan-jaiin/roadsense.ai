import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, Tooltip as ReTooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { getNationalStats, getHourlyData } from '../data/loader'

function FooterRiskTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0]
  return (
    <div className="explorer-chart-tooltip">
      <div style={{ fontWeight: 700 }}>Hour {p.payload?.hour}</div>
      <div>Avg risk · {p.payload?.avgRisk ?? p.value}</div>
    </div>
  )
}

/** Compact hourly line Chart for footer — uses filtered rows (same as map). */
function RiskByHourFooterCell({ filteredRows }) {
  const hourly = useMemo(() => getHourlyData(filteredRows || []), [filteredRows])

  return (
    <div className="metric-card explorer-metric-tile explorer-metric-risk" aria-label="Risk by hour, filtered dataset">
      <div className="metric-label explorer-metric-risk-label">Risk by hour</div>
      <p className="explorer-metric-risk-caption">Uses current filters · avg risk vs hour</p>
      <div className="explorer-footer-risk-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourly} margin={{ top: 4, right: 6, left: -12, bottom: 2 }}>
            <XAxis dataKey="hour" ticks={[0, 6, 12, 18, 23]} tick={{ fontSize: 11, fill: '#6a7f78' }} />
            <ReTooltip content={<FooterRiskTooltip />} />
            <ReferenceLine x={22} stroke="#2a3834" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="avgRisk" stroke="#0FFFA1" strokeOpacity={0.9} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/** `rows` = full CSV (national tiles). `filteredRows` = map filter slice (risk by hour only). */
export default function MetricCards({ rows = [], filteredRows }) {
  const stats = useMemo(() => getNationalStats(rows), [rows])
  const riskSlice = filteredRows ?? rows

  return (
    <div className="explorer-metrics">
      <div className="metric-card explorer-metric-tile explorer-metric-tot">
        <div className="metric-label">Total accidents</div>
        <div className="metric-value">{(stats.totalAccidents || 0).toLocaleString('en-IN')}</div>
        <div className="metric-sub explorer-metric-hint">Full dataset</div>
      </div>

      <div className="metric-card explorer-metric-tile explorer-metric-fat">
        <div className="metric-label">Fatalities</div>
        <div className="metric-value danger">{(stats.totalCasualties || 0).toLocaleString('en-IN')}</div>
        <div className="metric-sub explorer-metric-hint">Full dataset</div>
      </div>

      <div className="metric-card explorer-metric-tile explorer-metric-dat">
        <div className="metric-label">Dataset records</div>
        <div className="metric-value success">{rows.length.toLocaleString()} rows</div>
        <div className="metric-sub explorer-metric-hint">Loaded in browser</div>
      </div>

      <RiskByHourFooterCell filteredRows={riskSlice} />

      <div className="metric-card explorer-metric-tile explorer-metric-wur">
        <div className="metric-label">Worst state</div>
        <div className="metric-value warning">{stats.worstState || '—'}</div>
        <div className="metric-sub">Highest count in CSV</div>
      </div>
    </div>
  )
}
