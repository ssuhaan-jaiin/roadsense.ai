import React, { useMemo, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import { buildCauseFillColorMap, markerFillColor, filterRows as loaderFilterRows } from '../data/loader'

function rowHasMapCoords(r) {
  return (
    r &&
    r.latitude != null &&
    r.longitude != null &&
    Number.isFinite(Number(r.latitude)) &&
    Number.isFinite(Number(r.longitude))
  )
}

function HeatLayer({ points }) {
  const map = useMap()
  const heatRef = useRef(null)

  // create heat layer once
  useEffect(() => {
    if (!map) return
    if (!heatRef.current) {
      heatRef.current = L.heatLayer([], {
        radius: 22,
        blur: 28,
        max: 1,
        maxZoom: 17,
        gradient: {
          0.0: 'rgba(12, 50, 45, 0.2)',
          0.22: '#0C322D',
          0.42: '#174d44',
          0.58: '#26967f',
          0.75: '#73ffd8',
          0.92: '#a8ffe6',
          1.0: '#0FFFA1'
        }
      })
      heatRef.current.addTo(map)
    }
    return () => {
      if (heatRef.current) {
        try { map.removeLayer(heatRef.current) } catch (e) {}
        heatRef.current = null
      }
    }
  }, [map])

  // update heat points without recreating the layer
  useEffect(() => {
    if (!heatRef.current) return
    const pts = (points || [])
      .map(p => [Number(p[0]), Number(p[1]), Number(p[2] || 0)])
      .filter(p => isFinite(p[0]) && isFinite(p[1]))
    heatRef.current.setLatLngs(pts)
  }, [points])

  return null
}

// Minimal stable map with markers: base tile layer unchanged
export default function MapView({ rows = [], filter = 'all', onLocationClick = () => {} }) {
  // compute filteredRows using loader helper (keeps behavior consistent)
  const filteredRows = useMemo(() => loaderFilterRows(rows, filter), [rows, filter])

  const causeFillMap = useMemo(() => buildCauseFillColorMap(filteredRows), [filteredRows])

  // limit to top 300 by risk_score (safe numeric compare)
  const markers = useMemo(() => {
    return (filteredRows || [])
      .filter(rowHasMapCoords)
      .slice()
      .sort((a, b) => (Number(b.risk_score) || 0) - (Number(a.risk_score) || 0))
      .slice(0, 300)
  }, [filteredRows])

  // heat points from filteredRows: [lat, lng, risk_score]
  const heatPoints = useMemo(() => {
    return (filteredRows || [])
      .filter(rowHasMapCoords)
      .map(r => [Number(r.latitude), Number(r.longitude), Number(r.risk_score) || 0])
  }, [filteredRows])

  return (
    <div className="map-view-root">
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        className="map-view-leaflet"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
          maxZoom={19}
          detectRetina={false}
        />

  <HeatLayer points={heatPoints} />

  {markers.map(row => (
          <CircleMarker
            key={row.accident_id || `${row.latitude}-${row.longitude}-${row.id || Math.random()}`}
            center={[Number(row.latitude), Number(row.longitude)]}
            radius={5}
            pathOptions={{
              fillColor: markerFillColor(row.cause, causeFillMap),
              fillOpacity: 0.9,
              weight: 0,
              stroke: false
            }}
            eventHandlers={{ click: () => onLocationClick && onLocationClick(row) }}
          />
        ))}

      </MapContainer>
    </div>
  )
}

