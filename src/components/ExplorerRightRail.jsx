import React, { useEffect, useId, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import { getStateStats, getCauseData, CAUSE_SLICE_COLORS } from '../data/loader'
import AIInsightPanel from './AIInsightPanel'

function DarkTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null
  const p = payload[0]
  return (
    <div className="explorer-chart-tooltip">
      <div style={{ fontWeight: 700 }}>{p.name || p.payload.state}</div>
      <div>{p.value}</div>
    </div>
  )
}

const TABS = Object.freeze([
  { id: 'states', label: 'Top states' },
  { id: 'causes', label: 'Causes' },
  { id: 'insights', label: 'Insights' }
])

export default function ExplorerRightRail({ rows = [], locationData = null }) {
  const [tab, setTab] = useState('states')
  const tablistId = useId()

  useEffect(() => {
    if (locationData == null) return
    setTab('insights')
  }, [locationData])

  const topStates = useMemo(
    () => getStateStats(rows).slice(0, 7).map((s) => ({ state: s.state, count: s.count })),
    [rows]
  )
  const causes = useMemo(() => getCauseData(rows), [rows])

  return (
    <div className="explorer-rail">
      <div className="explorer-rail-tabs" role="tablist" aria-label="Right column panels" id={tablistId}>
        {TABS.map((t) => {
          const selected = tab === t.id
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${tablistId}-${t.id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={`explorer-rail-tab ${selected ? 'is-active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div className="explorer-rail-panel" role="tabpanel" aria-labelledby={`${tablistId}-${tab}`}>
        {tab === 'states' && (
          <div className="card ranking-chart-card explorer-rail-card explorer-rail-tab-card">
            <div className="sidebar-section-title">Top states</div>
            <div className="ranking-chart-h ranking-chart-h--bars ranking-chart-h--bars-tall explorer-rail-bar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topStates} layout="vertical" margin={{ top: 8, right: 8, left: 4, bottom: 8 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="state" type="category" width={92} tick={{ fontSize: 11, fill: '#888' }} />
                  <ReTooltip content={<DarkTooltip />} />
                  <Bar dataKey="count" fill="#0FFFA1" fillOpacity={0.85} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === 'causes' && (
          <div className="card ranking-chart-card explorer-rail-card explorer-rail-tab-card">
            <div className="sidebar-section-title">Causes</div>
            <div className="explorer-rail-pie-chart">
              <div className="explorer-rail-pie-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <Pie
                      data={causes}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="48%"
                      outerRadius="88%"
                      paddingAngle={2}
                    >
                    {causes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CAUSE_SLICE_COLORS[index % CAUSE_SLICE_COLORS.length]} />
                    ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="ranking-legend-grid explorer-rail-causes-legend">
              {causes.map((c, i) => (
                <div key={c.name} className="ranking-legend-item">
                  <span
                    className="ranking-legend-dot"
                    style={{ background: CAUSE_SLICE_COLORS[i % CAUSE_SLICE_COLORS.length] }}
                  />
                  <span className="ranking-legend-label">
                    {c.name} ({c.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'insights' && (
          <div className="explorer-rail-insights-mount">
            <AIInsightPanel locationData={locationData} />
          </div>
        )}
      </div>
    </div>
  )
}
