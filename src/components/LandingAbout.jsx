import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

function useReveal(threshold = 0.12) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || show) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, show])

  return [ref, show]
}

const TABS = [
  {
    id: 'purpose',
    label: 'Why it exists',
    content: (
      <>
        <p>
          Road crash data is often available but difficult to interpret at scale. This project exists to turn large,
          static datasets into something <strong>interactive and understandable</strong>, so patterns in road safety across
          India can be explored visually rather than buried in spreadsheets.
        </p>
        <p>
          The goal is <strong>not to draw final conclusions</strong>, but to make exploration easier, faster, and more
          intuitive.
        </p>
      </>
    )
  },
  {
    id: 'experience',
    label: 'The Dashboard',
    content: (
      <>
        <p>The dashboard brings together multiple views of the same dataset:</p>
        <ul className="about-inline-list about-inline-list-dash">
          <li>An interactive map showing crash locations across India</li>
          <li>Heatmaps highlighting accident density in major cities</li>
          <li>Filters for highway vs urban areas, weather conditions, and time of day</li>
          <li>State-wise breakdowns of crash distribution</li>
          <li>A time-based chart showing how accident risk changes across the day</li>
          <li>
            Clickable hotspots that reveal localized summaries of patterns and trends
          </li>
        </ul>
        <p>
          Together, these views help identify where crashes cluster and how risk shifts under different conditions.
        </p>
        <Link to="/explorer" className="about-inline-link">
          Jump to dashboard →
        </Link>
      </>
    )
  },
  {
    id: 'data',
    label: 'The Dataset',
    content: (
      <>
        <p>
          The underlying dataset contains approximately{' '}
          <strong className="about-accent-inline">20,000 anonymised road crash records from India</strong>, sourced from
          Kaggle. Each entry represents a single incident and includes geographic coordinates along with contextual
          attributes such as location type, weather, and time-related fields.
        </p>
        <p>
          The data is structured to support <strong>aggregation, filtering, and spatial visualization</strong> rather than
          individual case analysis.
        </p>
      </>
    )
  },
  {
    id: 'ai',
    label: 'How AI is used',
    content: (
      <>
        <p>
          AI is used to generate contextual explanations for observed patterns in the data. When a user clicks on a
          hotspot or region, the system sends relevant aggregated signals to the{' '}
          <strong className="about-accent-inline">Gemini API</strong>.
        </p>
        <p>
          The model then produces short, <strong>hypothesis-style insights</strong> that suggest possible contributing
          factors behind local trends. These outputs are meant to support exploration and intuition,{' '}
          <strong>not to provide verified causation or authoritative conclusions</strong>.
        </p>
      </>
    )
  }
]

export default function LandingAbout() {
  const [active, setActive] = useState(TABS[0].id)
  const activeTab = useMemo(() => TABS.find((t) => t.id === active) ?? TABS[0], [active])

  const [heroRef, heroIn] = useReveal(0.08)
  const [tapeRef, tapeIn] = useReveal(0.15)

  return (
    <section id="about" className="about-v2" aria-labelledby="about-heading">
      <div className={`about-intro ${heroIn ? 'about-reveal is-visible' : 'about-reveal'}`} ref={heroRef}>
        <span className="about-kicker">The Platform</span>
        <h2 id="about-heading" className="about-visually-hidden">
          The Platform
        </h2>
        <div className="about-intro-copy">
          <p className="about-intro-graph">
            This platform turns large-scale road crash data into{' '}
            <strong className="about-accent-inline">interactive maps, charts, and patterns</strong> to help explore where and
            when accidents occur across India. It is designed for <strong>exploratory analysis</strong> and{' '}
            <strong>not for definitive conclusions</strong>.
          </p>
          <p className="about-intro-graph about-intro-graph--muted">
            Built as RoadSense (roadsense.ai), it works on a dataset of approximately{' '}
            <strong className="about-accent-inline">20,000 anonymised crash records</strong> and transforms raw CSV
            data into an interactive exploration layer. Users can filter incidents by conditions such as highway vs urban areas,
            weather, and time of day, while visualising results through a Leaflet-based map, heatmaps, and supporting charts.
          </p>
          <p className="about-intro-graph about-intro-graph--muted">
            The dashboard combines spatial and statistical views, including state-wise summaries, cause distributions, and hourly
            risk trends, all driven from a unified processed dataset. On top of this, optional{' '}
            <strong className="about-accent-inline">Gemini-powered insights</strong> generate short contextual explanations for
            selected hotspots, helping surface possible contributing factors behind local patterns in the data.
          </p>
        </div>
      </div>

      <div className={`about-marquee-wrap ${tapeIn ? 'about-reveal is-visible' : 'about-reveal'}`} ref={tapeRef}>
        <div className="about-marquee" aria-hidden>
          <div className="about-marquee-track">
            {[
              'Open data',
              'Interactive maps',
              'Heatmaps & filters',
              'Gemini insights',
              '~20k records',
              'Exploration-first'
            ].map((t, i) => (
              <span key={`a-${i}`} className="about-marquee-item">
                {t}
              </span>
            ))}
            {[
              'Open data',
              'Interactive maps',
              'Heatmaps & filters',
              'Gemini insights',
              '~20k records',
              'Exploration-first'
            ].map((t, i) => (
              <span key={`b-${i}`} className="about-marquee-item">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="about-tabs-shell">
        <div className="about-tabs" role="tablist" aria-label="About topics">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active === t.id}
              className={`about-tab ${active === t.id ? 'is-active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              <span className="about-tab-glow" />
              {t.label}
            </button>
          ))}
        </div>

        <div key={activeTab.id} className="about-tab-panel tab-panel-enter" role="tabpanel">
          {activeTab.content}
        </div>
      </div>

      <ol className="about-steps">
        {[
          {
            n: '01',
            title: 'Load and prepare data',
            copy: (
              <>
                The CSV is loaded directly in the browser and cleaned into a consistent format. Key details like time of day and
                location attributes are derived so the data can be easily filtered and analysed.
              </>
            )
          },
          {
            n: '02',
            title: 'Visualise patterns on the map and charts',
            copy: (
              <>
                The processed data is rendered as an interactive map with heatmaps and markers, while charts update in real time
                based on active filters and selected data.
              </>
            )
          },
          {
            n: '03',
            title: 'Generate optional AI insights',
            copy: (
              <>
                When a user clicks on a location, the relevant data is sent to the AI layer.{' '}
                <strong className="about-accent-inline">Gemini</strong> returns short, structured insights that help explain
                possible factors behind the selected crash pattern.
              </>
            )
          }
        ].map((s, i) => (
          <li key={s.n} className="about-step" style={{ animationDelay: `${0.06 * i}s` }}>
            <span className="about-step-marker">{s.n}</span>
            <div className="about-step-body">
              <h3 className="about-step-title">{s.title}</h3>
              <p className="about-step-copy">{s.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
