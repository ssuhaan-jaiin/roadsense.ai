import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import MapView from '../components/MapView'
import ExplorerRightRail from '../components/ExplorerRightRail'
import MetricCards from '../components/MetricCards'
import SiteFooter from '../components/SiteFooter'
import ExplorerGuideOverlay, { EXPLORER_GUIDE_STORAGE_KEY } from '../components/ExplorerGuideOverlay'
import { loadData, filterRows } from '../data/loader'
import { GITHUB_REPO_URL } from '../config/site'

function LoadingScreen({ text = 'Parsing accident records…' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, flexDirection: 'column' }}>
      <div style={{ color: '#fafafa', fontSize: 28, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>
        <span style={{ color: '#ffffff' }}>roadsense</span>
        <span style={{ color: '#0FFFA1' }}>.ai</span>
      </div>
      <div style={{ width: 220, height: 6, background: '#262626', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '60%', background: '#0FFFA1', animation: 'load 1.8s ease-in-out infinite' }} />
      </div>
      <div style={{ color: '#525252', marginTop: 12 }}>{text}</div>
    </div>
  )
}

export default function ExplorerPage() {
  const [rows, setRows] = useState([])
  const [filteredRows, setFilteredRows] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [railTab, setRailTab] = useState('states')
  const [isLoading, setIsLoading] = useState(true)
  const [guideOpen, setGuideOpen] = useState(() => {
    try {
      return localStorage.getItem(EXPLORER_GUIDE_STORAGE_KEY) !== '1'
    } catch {
      return true
    }
  })

  const dismissGuide = (rememberDontShowAgain) => {
    if (rememberDontShowAgain) {
      try {
        localStorage.setItem(EXPLORER_GUIDE_STORAGE_KEY, '1')
      } catch {
        /* ignore */
      }
    }
    setGuideOpen(false)
  }

  useEffect(() => {
    let mounted = true
    loadData()
      .then((r) => {
        if (!mounted) return
        setRows(r)
        setFilteredRows(r)
        setIsLoading(false)
      })
      .catch(() => {
        if (!mounted) return
        setRows([])
        setFilteredRows([])
        setIsLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    setFilteredRows(filterRows(rows, activeFilter))
  }, [rows, activeFilter])

  return (
    <div className="explorer-page">
      <style>{`@keyframes load { 0%{width:0%} 50%{width:70%} 100%{width:100%} }`}</style>

      <div className="explorer-nav-strip">
        <div className="explorer-nav-strip-inner">
          <Link to="/" className="explorer-back-link">
            ← About & home
          </Link>
          <button type="button" className="explorer-tour-btn" onClick={() => setGuideOpen(true)}>
            Show tour
          </button>
        </div>
      </div>

      <section className="explorer" aria-label="Data explorer">
        <TopBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          githubUrl={GITHUB_REPO_URL}
          homeLink
        />

        <div className="explorer-body">
          <div className="explorer-map-wrap">
            <MapView
              rows={filteredRows}
              filter={activeFilter}
              onLocationClick={(row) => {
                setSelectedLocation(row)
                setRailTab('insights')
              }}
            />
          </div>

          <div className="explorer-sidebar">
            <ExplorerRightRail
              rows={filteredRows}
              locationData={selectedLocation}
              railTab={railTab}
              onRailTabChange={setRailTab}
            />
          </div>
        </div>

        <MetricCards rows={rows} filteredRows={filteredRows} />
      </section>

      <SiteFooter />

      {isLoading && <LoadingScreen />}

      {/* Tour renders last so it stacks above LoadingScreen when data is ready */}
      <ExplorerGuideOverlay open={guideOpen && !isLoading} onDismiss={dismissGuide} />
    </div>
  )
}
