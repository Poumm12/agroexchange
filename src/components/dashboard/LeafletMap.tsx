'use client'
import { useEffect, useRef } from 'react'
import type { MapCategory, MapPoint } from '@/types'

// Leaflet is loaded from CDN at runtime (no SSR, no bundler resolution needed).
// This keeps the component drop-in and ready to receive real backend coordinates
// later without any redesign — just pass different `points`.

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS  = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

const CAT_HEX: Record<MapCategory, string> = {
  silo: '#F59E0B',
  mill: '#F97316',
  warehouse: '#3B82F6',
  cooperative: '#22C55E',
  distribution: '#A855F7',
  transport_company: '#14B8A6',
}

// Load the Leaflet script once and resolve when window.L is available.
let leafletPromise: Promise<any> | null = null
function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject('no window')
  if ((window as any).L) return Promise.resolve((window as any).L)
  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }
    // JS
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`) as HTMLScriptElement | null
    if (existing && (window as any).L) { resolve((window as any).L); return }
    const script = existing ?? document.createElement('script')
    script.src = LEAFLET_JS
    script.async = true
    script.onload = () => resolve((window as any).L)
    script.onerror = () => reject(new Error('Failed to load Leaflet'))
    if (!existing) document.body.appendChild(script)
  })
  return leafletPromise
}

// Colored teardrop pin as a Leaflet divIcon (no external image assets needed).
function pinHtml(hex: string, selected: boolean) {
  const scale = selected ? 1.25 : 1
  return `
    <div style="transform:translate(-50%,-100%) scale(${scale});transform-origin:bottom center;transition:transform .15s;">
      <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 33 C13 33 24 18 24 11 A11 11 0 1 0 2 11 C2 18 13 33 13 33 Z"
          fill="${hex}" stroke="#fff" stroke-width="2"/>
        <circle cx="13" cy="11" r="4.2" fill="#fff"/>
      </svg>
    </div>`
}

interface Props {
  points: MapPoint[]
  selected: MapPoint | null
  onSelect: (p: MapPoint) => void
  categoryLabel: (c: MapCategory) => string
}

export function LeafletMap({ points, selected, onSelect, categoryLabel }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const markersRef   = useRef<Record<string, any>>({})
  const LRef         = useRef<any>(null)
  const onSelectRef  = useRef(onSelect)
  onSelectRef.current = onSelect

  // Init map once
  useEffect(() => {
    let cancelled = false
    loadLeaflet().then(L => {
      if (cancelled || !containerRef.current || mapRef.current) return
      LRef.current = L
      const map = L.map(containerRef.current, {
        center: [38.2, 23.8], // Greece — centered a touch lower/east to frame the mainland + islands
        zoom: 6.4,
        scrollWheelZoom: true,
        zoomControl: true,
        minZoom: 5,
      })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)
      mapRef.current = map
      renderMarkers()
    }).catch(() => {/* CDN unavailable (e.g. offline) — container stays empty */})

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      markersRef.current = {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // (Re)render markers whenever points change
  function renderMarkers() {
    const L = LRef.current
    const map = mapRef.current
    if (!L || !map) return
    // clear old
    Object.values(markersRef.current).forEach((m: any) => map.removeLayer(m))
    markersRef.current = {}

    points.forEach(p => {
      if (p.lat == null || p.lng == null) return
      const hex = CAT_HEX[p.category] ?? '#2E7D32'
      const icon = L.divIcon({
        className: 'agro-pin',
        html: pinHtml(hex, selected?.id === p.id),
        iconSize: [26, 34],
        iconAnchor: [13, 34],
        popupAnchor: [0, -32],
      })
      const marker = L.marker([p.lat, p.lng], { icon }).addTo(map)
      marker.bindPopup(
        `<div style="font-family:Inter,system-ui,sans-serif;min-width:170px;padding:2px 2px 4px">
           <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">
             <span style="width:9px;height:9px;border-radius:50%;background:${hex};flex-shrink:0;box-shadow:0 0 0 3px ${hex}22"></span>
             <span style="font-weight:700;color:#9ca3af;font-size:10px;text-transform:uppercase;letter-spacing:.04em">${escapeHtml(categoryLabel(p.category))}</span>
           </div>
           <div style="font-weight:800;color:#111827;font-size:14px;line-height:1.25;margin-bottom:3px">${escapeHtml(p.name)}</div>
           <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:#6b7280">
             <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${hex}" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
             ${escapeHtml(p.city ?? '')}
           </div>
         </div>`,
        { closeButton: true, className: 'agro-popup' }
      )
      marker.on('click', () => onSelectRef.current(p))
      markersRef.current[p.id] = marker
    })
  }

  useEffect(() => { renderMarkers() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points])

  // When selection changes: re-style pins, center map, open popup
  useEffect(() => {
    const L = LRef.current
    const map = mapRef.current
    if (!L || !map) return
    // restyle all
    points.forEach(p => {
      const m = markersRef.current[p.id]
      if (!m) return
      const hex = CAT_HEX[p.category] ?? '#2E7D32'
      m.setIcon(L.divIcon({
        className: 'agro-pin',
        html: pinHtml(hex, selected?.id === p.id),
        iconSize: [26, 34], iconAnchor: [13, 34], popupAnchor: [0, -32],
      }))
    })
    if (selected && selected.lat != null && selected.lng != null) {
      map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), 9), { duration: 0.6 })
      const m = markersRef.current[selected.id]
      if (m) m.openPopup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  return <div ref={containerRef} className="absolute inset-0 w-full h-full" style={{ background: '#AAD3DF' }} />
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
