import React, { useEffect, useState } from 'react'

/** Bump when tour layout or flow changes — returning users see the refreshed tour once. */
export const EXPLORER_GUIDE_STORAGE_KEY = 'roadsense_explorer_tour_v8'

const STEPS = [
  {
    kicker: 'Step 1 of 4 · Map',
    title: 'Explore crashes in space',
    lines: [
      'Pan and zoom the India basemap to see how crashes spread by region.',
      'The heat layer (teal → mint) is relative intensity for the **current filters** — brighter means more weight in that area.',
      'Dots are **up to 300** high-risk points. Colours match the **Causes** tab pie in the right column; rarer causes show as grey.',
      '**Click a dot** to load that hotspot in the **Insights** tab (Gemini summaries once a point is selected).'
    ]
  },
  {
    kicker: 'Step 2 of 4 · Top bar',
    title: 'Filters & navigation',
    lines: [
      'The pills — **All, Highway, Urban, Weather, Night** — drive one shared dataset for the **map**, **right column**, and the **Risk by hour** cell in the footer row.',
      '**GitHub** opens the repo. **Show tour** (top left) replays this guide whenever you like.'
    ]
  },
  {
    kicker: 'Step 3 of 4 · Charts & AI',
    title: 'Right column tabs',
    lines: [
      '**Top states**, **Causes**, and **Insights** are tabs along the top of the right column. Only **one** view is shown at a time so each chart (or the AI block) can use the full height.',
      'Open **Insights** after you pick a dot to read **three short Gemini bullets** (exploration only — not legal or medical advice).'
    ]
  },
  {
    kicker: 'Step 4 of 4 · Footer row',
    title: 'Dataset snapshot & hourly risk',
    lines: [
      'The **footer** is a single compact row. **Total accidents**, **Fatalities**, **Dataset records**, and **Worst state** are from the **whole CSV** — they do **not** use the filter pills.',
      '**Risk by hour** sits **immediately to the right of Dataset records**: that mini chart **does** follow your filters, like the map.'
    ]
  }
]

function RichLine({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        return part
      })}
    </>
  )
}

/** `onDismiss(true)` persists “don’t auto-open”; `(false)` only closes */
export default function ExplorerGuideOverlay({ open, onDismiss }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  const total = STEPS.length
  const current = STEPS[step]
  const isLast = step === total - 1

  const goNext = () => {
    if (isLast) onDismiss(true)
    else setStep((s) => Math.min(s + 1, total - 1))
  }

  return (
    <div
      className="explorer-guide-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explorer-guide-step-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss(false)
      }}
    >
      <div className="explorer-guide-modal explorer-guide-modal--comfortable" onClick={(e) => e.stopPropagation()}>
        <header className="explorer-guide-header explorer-guide-header--airy">
          <p className="explorer-guide-kicker">{current.kicker}</p>
          <h2 id="explorer-guide-step-title" className="explorer-guide-title">
            {current.title}
          </h2>
          <p className="explorer-guide-visually-hidden">
            Step {step + 1} of {total}
          </p>
          <div className="explorer-guide-progress" aria-hidden>
            {STEPS.map((_, i) => (
              <span key={i} className={`explorer-guide-progress-dot ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`} />
            ))}
          </div>
        </header>

        <div className="explorer-guide-scroll explorer-guide-scroll--airy">
          <div className="explorer-guide-body">
            <ul key={step} className="explorer-guide-list tab-panel-enter">
              {current.lines.map((line, j) => (
                <li key={j}>
                  <RichLine text={line} />
                </li>
              ))}
            </ul>
            <p className="explorer-guide-hint">
              Finish or skip anytime. Reopen with <strong>Show tour</strong> in the strip above.
            </p>
          </div>
        </div>

        {isLast && (
          <p className="explorer-guide-finish-note">
            Closing with <strong>Finish</strong> remembers your choice on this browser. You can always use <strong>Show tour</strong>
            again.
          </p>
        )}

        <footer className="explorer-guide-footer explorer-guide-footer--split explorer-guide-footer--airy">
          <button type="button" className="explorer-guide-btn ghost" onClick={() => onDismiss(false)}>
            Skip tour
          </button>
          <div className="explorer-guide-footer-actions">
            {step > 0 && (
              <button type="button" className="explorer-guide-btn secondary" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            )}
            <button type="button" className="explorer-guide-btn primary" onClick={goNext}>
              {isLast ? 'Finish' : 'Next'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
