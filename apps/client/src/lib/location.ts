export interface Suggestion {
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
  properties?: {
    osm_type?: string
    osm_id?: number
    extent?: [number, number, number, number]
    street?: string
    city?: string
    state?: string
    country?: string
  }
}

export interface ReverseResult {
  display_name: string
  lat: string
  lon: string
}

const PHOTON_BASE = 'https://photon.komoot.io'

// San Mateo Atenco, Estado de México
export const SAN_MATEO_CENTER: [number, number] = [19.2675, -99.5333]
export const SAN_MATEO_BOUNDS: [[number, number], [number, number]] = [
  [19.22, -99.57],
  [19.31, -99.49],
]

export async function searchLocation(query: string): Promise<Suggestion[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    q: query,
    limit: '5',
    lang: 'es',
  })
  const res = await fetch(
    `${PHOTON_BASE}/api?${params}&bbox=${SAN_MATEO_BOUNDS[0][1]},${SAN_MATEO_BOUNDS[0][0]},${SAN_MATEO_BOUNDS[1][1]},${SAN_MATEO_BOUNDS[1][0]}`,
  )
  if (!res.ok) throw new Error('Error al buscar dirección')
  const data = await res.json()
  return (data.features ?? []).map((f: {
    properties?: Record<string, unknown>
    geometry?: { coordinates?: number[] }
  }) => ({
    display_name: f.properties?.name
      ? [f.properties.name, f.properties?.street, f.properties?.city, f.properties?.state]
          .filter(Boolean)
          .join(', ')
      : [f.properties?.street, f.properties?.city, f.properties?.state]
          .filter(Boolean)
          .join(', ') || String(f.properties?.osm_value ?? ''),
    lat: String((f.geometry?.coordinates?.[1] as number) ?? ''),
    lon: String((f.geometry?.coordinates?.[0] as number) ?? ''),
    type: String(f.properties?.osm_value ?? 'unknown'),
    importance: 0,
    properties: f.properties as Suggestion['properties'],
  }))
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseResult> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    lang: 'es',
  })
  const res = await fetch(`${PHOTON_BASE}/reverse?${params}`)
  if (!res.ok) throw new Error('Error al obtener dirección')
  const data = await res.json()
  const feature = data.features?.[0]
  const props = feature?.properties ?? {}
  const coords = feature?.geometry?.coordinates ?? []
  const parts = [props.name, props.street, props.city, props.state, props.country].filter(Boolean)
  return {
    display_name: parts.join(', ') || 'Ubicación en San Mateo Atenco',
    lat: String(coords[1] ?? lat),
    lon: String(coords[0] ?? lng),
  }
}

export function formatAddress(s: Suggestion | ReverseResult): string {
  return s.display_name
}
