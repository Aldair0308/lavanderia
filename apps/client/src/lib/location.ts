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

export async function searchLocation(query: string): Promise<Suggestion[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    q: query,
    limit: '5',
    lang: 'es',
  })
  const res = await fetch(`${PHOTON_BASE}/api?${params}`)
  if (!res.ok) throw new Error('Error al buscar dirección')
  const data = await res.json()
  return (data.features ?? []).map((f: any) => ({
    display_name: f.properties?.name
      ? [f.properties.name, f.properties?.street, f.properties?.city, f.properties?.state]
          .filter(Boolean)
          .join(', ')
      : [f.properties?.street, f.properties?.city, f.properties?.state]
          .filter(Boolean)
          .join(', ') || f.properties?.osm_value || '',
    lat: String(f.geometry?.coordinates?.[1] ?? ''),
    lon: String(f.geometry?.coordinates?.[0] ?? ''),
    type: f.properties?.osm_value ?? 'unknown',
    importance: 0,
    properties: f.properties,
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
    display_name: parts.join(', ') || 'Ubicación seleccionada',
    lat: String(coords[1] ?? lat),
    lon: String(coords[0] ?? lng),
  }
}

export function formatAddress(s: Suggestion | ReverseResult): string {
  return s.display_name
}
