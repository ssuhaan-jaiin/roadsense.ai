import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GITHUB_REPO_URL } from '../config/site'
import { PUBLIC_LOGO_SRC } from '../config/assetUrls'

/** Add `public/logo.png` (borderless PNG); image hides automatically if the file is missing. */

function GitHubMark({ className }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const openGh = () => window.open(GITHUB_REPO_URL, '_blank', 'noopener')
  const [logoOk, setLogoOk] = useState(true)

  return (
    <header className="hero">
      <div className="hero-inner">
        {logoOk && (
          <img
            src={PUBLIC_LOGO_SRC}
            alt=""
            className="hero-logo-img"
            width={164}
            height={164}
            loading="lazy"
            decoding="async"
            onError={() => setLogoOk(false)}
          />
        )}
        <p className="hero-eyebrow">Road safety · Data &amp; AI</p>
        <h1 className="hero-title hero-title-brand">
          <span className="hero-brand-white">roadsense</span>
          <span className="hero-brand-green">.ai</span>
        </h1>
        <p className="hero-lead">
          An <span className="hero-lead-strong">interactive data platform</span> that{' '}
          <span className="hero-lead-strong">visualises</span> <strong className="hero-lead-accent">20,000+</strong> road
          crash records across <span className="hero-lead-strong">India</span> to reveal{' '}
          <strong className="hero-lead-accent">high-risk locations</strong>,{' '}
          <span className="hero-lead-strong">time-based patterns</span>, and{' '}
          <span className="hero-lead-strong">key contributing factors</span> through <span className="hero-lead-strong">maps</span>,{' '}
          <span className="hero-lead-strong">heatmaps</span>, and <strong className="hero-lead-accent">AI-driven insights</strong>.
        </p>

        <div className="hero-stats hero-stats-grid">
          <div className="hero-stat-card">
            <span className="hero-stat-primary">20K+</span>
            <span className="hero-stat-sub">Crash Records Visualised</span>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-primary">Nationwide Coverage</span>
            <span className="hero-stat-sub">Latitude / Longitude</span>
          </div>
          <div className="hero-stat-card">
            <span className="hero-stat-primary">Get AI-Powered Insights</span>
            <span className="hero-stat-sub">Gemini API</span>
          </div>
        </div>

        <div className="hero-actions">
          <button type="button" className="hero-btn hero-btn-primary" onClick={() => navigate('/explorer')}>
            View Dashboard
          </button>
          <button type="button" className="hero-btn hero-btn-ghost hero-btn-github" onClick={openGh}>
            <GitHubMark className="hero-github-icon" />
            GitHub
          </button>
        </div>
      </div>
      <div className="hero-glow" aria-hidden />
      <div className="hero-grid-accent" aria-hidden />
    </header>
  )
}
