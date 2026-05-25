export interface Suggestion {
  display_name: string
  short_name: string
  subtitle: string
  lat: string
  lon: string
  type: string
  properties?: {
    street?: string
    city?: string
    state?: string
    country?: string
    osm_value?: string
    housenumber?: string
  }
}

export interface ReverseResult {
  display_name: string
  lat: string
  lon: string
}

const PHOTON_BASE = 'https://photon.komoot.io'

export const SAN_MATEO_CENTER: [number, number] = [19.2675, -99.5333]
export const SAN_MATEO_BOUNDS: [[number, number], [number, number]] = [
  [19.22, -99.57],
  [19.31, -99.49],
]

function formatSuggestion(f: {
  properties?: Record<string, unknown>
  geometry?: { coordinates?: number[] }
}): Suggestion {
  const props = f.properties ?? {}
  const coords = f.geometry?.coordinates ?? []
  const lat = String((coords[1] as number) ?? '')
  const lon = String((coords[0] as number) ?? '')

  const name = String(props.name ?? '')
  const street = String(props.street ?? '')
  const housenumber = String(props.housenumber ?? '')
  const city = String(props.city ?? '')
  const state = String(props.state ?? '')
  const osmValue = String(props.osm_value ?? '')

  let shortName: string
  if (street && housenumber) {
    shortName = `${street} ${housenumber}`
  } else if (street) {
    shortName = street
  } else if (name) {
    shortName = name
  } else {
    shortName = osmValue
  }

  const subtitleParts = [city, state].filter(Boolean)
  const subtitle = subtitleParts.join(', ')

  const displayParts = [name, street, housenumber, city, state].filter(Boolean)
  const displayName = displayParts.join(', ')

  return {
    display_name: displayName,
    short_name: shortName,
    subtitle,
    lat,
    lon,
    type: osmValue,
    properties: props as Suggestion['properties'],
  }
}

export async function searchLocation(query: string): Promise<Suggestion[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    q: query,
    limit: '5',
  })
  const url = `${PHOTON_BASE}/api?${params}&bbox=${SAN_MATEO_BOUNDS[0][1]},${SAN_MATEO_BOUNDS[0][0]},${SAN_MATEO_BOUNDS[1][1]},${SAN_MATEO_BOUNDS[1][0]}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Error al buscar dirección')
  const data = await res.json()
  return (data.features ?? []).map(formatSuggestion)
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseResult> {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lng) })
  const res = await fetch(`${PHOTON_BASE}/reverse?${params}`)
  if (!res.ok) throw new Error('Error al obtener dirección')
  const data = await res.json()
  const feature = data.features?.[0]
  const props = feature?.properties ?? {}
  const coords = feature?.geometry?.coordinates ?? []
  const parts = [props.name, props.street, props.housenumber, props.city, props.state, props.country].filter(Boolean)
  return {
    display_name: parts.join(', ') || 'San Mateo Atenco, Estado de México',
    lat: String(coords[1] ?? lat),
    lon: String(coords[0] ?? lng),
  }
}

export function formatAddress(s: Suggestion | ReverseResult): string {
  return s.display_name
}
