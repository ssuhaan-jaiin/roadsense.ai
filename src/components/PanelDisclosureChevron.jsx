import React from 'react'

/** Shared chevron for collapsible explorer panels — points down when expanded. */
export default function PanelDisclosureChevron({ expanded, className = '' }) {
  return (
    <svg
      className={`panel-disclosure-chevron ${expanded ? '' : 'is-collapsed'} ${className}`.trim()}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}
