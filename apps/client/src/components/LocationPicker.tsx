import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import { useLocationSearch } from '../hooks/useLocationSearch'
import {
  reverseGeocode,
  formatAddress,
  SAN_MATEO_CENTER,
  SAN_MATEO_BOUNDS,
  type Suggestion,
} from '../lib/location'
import 'leaflet/dist/leaflet.css'

const DEFAULT_ZOOM = 16

function pinIcon() {
  return L.divIcon({
    className: '',
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    html: `<svg width="36" height="46" viewBox="0 0 36 46" fill="none">
      <defs>
        <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#14B8A6"/>
          <stop offset="100%" stop-color="#0D9488"/>
        </linearGradient>
        <filter id="ps">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity=".3"/>
        </filter>
      </defs>
      <path d="M18 2C8.06 2 2 8.06 2 18c0 12 16 26 16 26s16-14 16-26C34 8.06 27.94 2 18 2z" fill="url(#pg)" filter="url(#ps)"/>
      <circle cx="18" cy="18" r="6.5" fill="white"/>
    </svg>`,
  })
}

function SvgSearch() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  )
}

function SvgPin() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  )
}

function SvgChevronLeft() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}

function SvgCheck() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  )
}

function SvgCrosshair() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4m0 12v4m-10-8h4m12 0h4" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function MapBoundsController() {
  const map = useMap()
  useEffect(() => {
    map.setMaxBounds(SAN_MATEO_BOUNDS)
  }, [map])
  return null
}

function MapDragListener({
  onMapDrag,
}: {
  onMapDrag: (lat: number, lng: number) => void
}) {
  const map = useMap()
  useMapEvents({
    dragend() {
      const c = map.getCenter()
      onMapDrag(c.lat, c.lng)
    },
  })
  return null
}

function DraggableMarker({
  position,
  onMove,
}: {
  position: [number, number]
  onMove: (lat: number, lng: number) => void
}) {
  const markerRef = useRef<L.Marker>(null)
  const icon = useMemo(() => pinIcon(), [])

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const m = markerRef.current
        if (m) {
          const p = m.getLatLng()
          onMove(p.lat, p.lng)
        }
      },
    }),
    [onMove],
  )

  return (
    <Marker
      ref={markerRef}
      position={position}
      draggable={true}
      icon={icon}
      eventHandlers={eventHandlers}
    />
  )
}

interface LocationPickerProps {
  open: boolean
  onClose: () => void
  onConfirm: (address: string, lat: number, lng: number) => void
  initialAddress?: string
  initialLat?: number
  initialLng?: number
}

export default function LocationPicker({
  open,
  onClose,
  onConfirm,
  initialAddress,
  initialLat,
  initialLng,
}: LocationPickerProps) {
  const [query, setQuery] = useState('')
  const [selectedPos, setSelectedPos] = useState<[number, number]>([
    initialLat ?? SAN_MATEO_CENTER[0],
    initialLng ?? SAN_MATEO_CENTER[1],
  ])
  const [address, setAddress] = useState(initialAddress ?? '')
  const [resolving, setResolving] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState('')
  const { suggestions, loading } = useLocationSearch(query)
  const suggestionsRef = useRef<HTMLUListElement>(null)
  const [focusedIdx, setFocusedIdx] = useState(-1)

  const reverseResolve = useCallback(async (lat: number, lng: number) => {
    setResolving(true)
    try {
      const result = await reverseGeocode(lat, lng)
      setAddress(formatAddress(result))
    } catch {
      setAddress('San Mateo Atenco, Estado de México')
    } finally {
      setResolving(false)
    }
  }, [])

  useEffect(() => {
    if (open) {
      const lat = initialLat ?? SAN_MATEO_CENTER[0]
      const lng = initialLng ?? SAN_MATEO_CENTER[1]
      setSelectedPos([lat, lng])
      if (!initialAddress) reverseResolve(lat, lng)
    }
  }, [open])

  const flyTo = useCallback((lat: number, lng: number) => {
    setSelectedPos([lat, lng])
  }, [])

  const handleSearchPick = (s: Suggestion) => {
    const lat = parseFloat(s.lat)
    const lng = parseFloat(s.lon)
    flyTo(lat, lng)
    setAddress(s.display_name || s.short_name)
    reverseResolve(lat, lng)
    setGeoError('')
  }

  const handleMarkerMove = useCallback(
    (lat: number, lng: number) => {
      setSelectedPos([lat, lng])
      setAddress('')
      reverseResolve(lat, lng)
    },
    [reverseResolve],
  )

  const handleMapDrag = useCallback(
    (lat: number, lng: number) => {
      setSelectedPos([lat, lng])
      setAddress('')
      reverseResolve(lat, lng)
    },
    [reverseResolve],
  )

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización')
      return
    }
    setLocating(true)
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        flyTo(lat, lng)
        setAddress('')
        reverseResolve(lat, lng)
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        setGeoError(
          err.code === err.PERMISSION_DENIED
            ? 'Permiso denegado. Actívalo desde la configuración de tu navegador.'
            : 'No se pudo obtener tu ubicación. Intenta de nuevo.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handleConfirm = () => {
    if (!address) return
    onConfirm(address, selectedPos[0], selectedPos[1])
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!suggestions.length) {
      if (e.key === 'Enter') e.preventDefault()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIdx((prev) => Math.min(prev + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIdx((prev) => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && focusedIdx >= 0) {
      e.preventDefault()
      handleSearchPick(suggestions[focusedIdx])
    }
  }

  useEffect(() => {
    if (focusedIdx >= 0 && suggestionsRef.current) {
      const el = suggestionsRef.current.children[focusedIdx] as HTMLElement
      el?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIdx])

  useEffect(() => {
    if (!query.trim()) setFocusedIdx(-1)
  }, [query])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* ── Header / Search ── */}
      <div className="relative z-30 flex items-center gap-3 px-4 pt-12 pb-2 bg-white border-b border-border shrink-0 shadow-sm">
        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-warm-gray transition-colors -ml-1"
        >
          <SvgChevronLeft />
        </button>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
            <SvgSearch />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Busca una colonia, calle o dirección…"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-cream text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
            autoFocus
          />
        </div>
      </div>

      {/* ── Suggestions overlay ── */}
      {query.trim() && (
        <div className="relative z-30">
          <ul
            ref={suggestionsRef}
            className="bg-white shadow-lg border-b border-border overflow-y-auto max-h-56"
          >
            {loading && (
              <li className="px-4 py-4 text-sm text-stone-500 text-center">Buscando…</li>
            )}
            {!loading && suggestions.length === 0 && (
              <li className="px-4 py-4 text-sm text-stone-500 text-center">Sin resultados en San Mateo Atenco</li>
            )}
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => handleSearchPick(s)}
                className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors border-b border-border/40 last:border-b-0 ${
                  i === focusedIdx ? 'bg-teal-50' : 'hover:bg-cream'
                }`}
              >
                <span className="w-8 h-8 rounded-md bg-warm-gray flex items-center justify-center shrink-0 text-stone-400 mt-0.5">
                  <SvgPin />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{s.short_name}</p>
                  {s.subtitle && (
                    <p className="text-xs text-stone-500 truncate mt-0.5">{s.subtitle}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Map ── */}
      <div className="flex-1 relative">
        <MapContainer
          center={selectedPos}
          zoom={DEFAULT_ZOOM}
          className="w-full h-full"
          zoomControl={true}
          attributionControl={false}
          maxBounds={SAN_MATEO_BOUNDS}
          maxBoundsViscosity={1}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <MapBoundsController />
          <MapDragListener onMapDrag={handleMapDrag} />
          <FlyToController position={selectedPos} />
          <DraggableMarker position={selectedPos} onMove={handleMarkerMove} />
        </MapContainer>

        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="absolute top-3 right-3 z-[500] w-10 h-10 bg-white rounded-full shadow-md border border-border flex items-center justify-center text-teal-600 hover:bg-cream transition disabled:opacity-50"
          title="Usar mi ubicación actual"
        >
          {locating ? (
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : (
            <SvgCrosshair />
          )}
        </button>
      </div>

      {/* ── Geo error ── */}
      {geoError && (
        <div className="shrink-0 px-4 pt-2">
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 border border-red-200">{geoError}</p>
        </div>
      )}

      {/* ── Bottom card ── */}
      <div className="shrink-0 bg-white border-t border-border px-4 pt-3 pb-6 space-y-3">
        <div className="flex items-start gap-3 bg-cream rounded-xl border border-border p-3.5">
          <span className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center shrink-0 text-white">
            <SvgPin />
          </span>
          <div className="flex-1 min-w-0">
            {resolving ? (
              <p className="text-sm text-stone-400">Obteniendo dirección…</p>
            ) : (
              <>
                <p className="text-sm font-semibold text-stone-900 leading-tight truncate">
                  {address || 'San Mateo Atenco, Estado de México'}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedPos[0].toFixed(5)}, {selectedPos[1].toFixed(5)}
                </p>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!address || resolving}
          className="w-full rounded-xl bg-teal-600 px-6 py-3.5 font-semibold text-white text-base hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <SvgCheck />
          Confirmar ubicación
        </button>
      </div>
    </div>
  )
}

function FlyToController({ position }: { position: [number, number] }) {
  const map = useMap()
  const prev = useRef(position)

  useEffect(() => {
    const [lat, lng] = position
    const [plat, plng] = prev.current
    const moved = Math.abs(lat - plat) > 0.0001 || Math.abs(lng - plng) > 0.0001
    if (moved) {
      map.flyTo(position, map.getZoom(), { animate: true, duration: 0.4 })
    }
    prev.current = position
  }, [map, position])

  return null
}
