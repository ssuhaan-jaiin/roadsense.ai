import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { PUBLIC_LOGO_SRC } from '../config/assetUrls'

const FILTERS = ['All', 'Highway', 'Urban', 'Weather', 'Night']

export default function TopBar({
  activeFilter = 'all',
  onFilterChange = () => {},
  githubUrl = '',
  homeLink = false
}) {
  const [logoOk, setLogoOk] = useState(true)
  const normalize = (label) => label.toLowerCase()

  const handleGithub = () => {
    if (!githubUrl) return
    window.open(githubUrl, '_blank', 'noopener')
  }

  return (
    <div className="topbar-wrap">
      <style>{`
        .topbar-logo, .topbar-logo-link {
          display: flex; align-items: center; gap:10px; font-size:16px; font-weight:800;
          text-decoration:none; color: inherit;
        }
        .topbar-logo-img { height: 28px; width: auto; max-width: 36px; object-fit: contain; display:block; flex-shrink:0 }
        .topbar-dot {
          width:10px; height:10px; border-radius:50%; background:#0FFFA1; display:inline-block;
          box-shadow:0 0 14px rgba(15,255,161,0.45)
        }
        .topbar-brand { display:inline-flex; gap:0; align-items:baseline; text-transform:lowercase; letter-spacing:-0.02em }
        .brand-sense { color: #FFFFFF }
        .brand-ai { color: #0FFFA1 }
        .live-dot { width:10px; height:10px; border-radius:50%; display:inline-block }
        .pulse { animation: pulse 1.6s infinite; }
        .pulse-fast { animation: pulse 1s infinite; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(15,255,161,0.45); }
          70% { box-shadow: 0 0 0 8px rgba(15,255,161,0); }
          100% { box-shadow: 0 0 0 0 rgba(15,255,161,0); }
        }
        .github-btn { background: #141414; border: 1px solid #2f2f2f; border-radius:6px; padding:5px 12px; color:#a3a3a3; font-size:12px; display:inline-flex; gap:8px; align-items:center; cursor:pointer }
        .github-btn:hover { border-color: #0FFFA1; color: #e5e5e5 }
      `}</style>

      {/* Left: Logo */}
      <div className="topbar-left">
        {homeLink ? (
          <Link to="/" className="topbar-logo-link" title="Home & about">
            {logoOk && (
              <img
                src={PUBLIC_LOGO_SRC}
                alt=""
                width={36}
                height={36}
                className="topbar-logo-img"
                loading="lazy"
                decoding="async"
                onError={() => setLogoOk(false)}
              />
            )}
            {!logoOk && <span className="topbar-dot" aria-hidden="true" />}
            <span className="topbar-brand">
              <span className="brand-sense">roadsense</span>
              <span className="brand-ai">.ai</span>
            </span>
          </Link>
        ) : (
          <div className="topbar-logo" style={{ marginLeft: 0 }}>
            {logoOk && (
              <img
                src={PUBLIC_LOGO_SRC}
                alt=""
                width={36}
                height={36}
                className="topbar-logo-img"
                loading="lazy"
                decoding="async"
                onError={() => setLogoOk(false)}
              />
            )}
            {!logoOk && <span className="topbar-dot" aria-hidden="true" />}
            <span className="topbar-brand">
              <span className="brand-sense">roadsense</span>
              <span className="brand-ai">.ai</span>
            </span>
          </div>
        )}
      </div>

      {/* Center: Filters */}
      <div className="topbar-filters" role="toolbar" aria-label="Map filters">
        {FILTERS.map(label => {
          const type = normalize(label)
          const isActive = normalize(activeFilter) === type
          return (
            <button
              key={label}
              className={`filter-pill ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange(type)}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Right: Live badge + GitHub */}
      <div className="topbar-right">
        <div className="topbar-status" role="status">
          <span className="live-dot" style={{ background: '#888' }} aria-hidden="true" />
          <span className="topbar-status-text topbar-status-text--muted">
            <span className="topbar-status-full">Kaggle · 20k records</span>
            <span className="topbar-status-compact">20k CSV</span>
          </span>
        </div>

        <button
          className="github-btn"
          type="button"
          onClick={handleGithub}
          title="Open GitHub"
          aria-label="RoadSense.ai on GitHub"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path fillRule="evenodd" clipRule="evenodd" d="M8 .198a8 8 0 00-2.53 15.59c.4.074.546-.174.546-.386 0-.19-.007-.693-.01-1.36-2.22.482-2.69-1.07-2.69-1.07-.364-.924-.89-1.17-.89-1.17-.727-.497.055-.487.055-.487.803.057 1.225.825 1.225.825.714 1.223 1.873.87 2.33.665.072-.517.28-.87.508-1.07-1.77-.201-3.63-.885-3.63-3.942 0-.87.31-1.583.824-2.142-.083-.202-.357-1.015.078-2.115 0 0 .672-.215 2.2.82A7.66 7.66 0 018 4.58c.68.003 1.366.092 2.005.27 1.528-1.035 2.198-.82 2.198-.82.437 1.1.163 1.913.08 2.115.515.56.822 1.273.822 2.142 0 3.066-1.865 3.738-3.642 3.934.287.247.543.735.543 1.48 0 1.07-.01 1.934-.01 2.197 0 .215.144.464.55.385A8.001 8.001 0 008 .197z" fill="#aaa"/>
          </svg>
          <span className="github-btn-label">GitHub</span>
        </button>
      </div>
    </div>
  )
}
