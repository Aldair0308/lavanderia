export interface Suggestion {
  display_name: string
  lat: string
  lon: string
  type: string
  importance: number
}

export interface ReverseResult {
  display_name: string
  lat: string
  lon: string
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

export async function searchLocation(query: string): Promise<Suggestion[]> {
  if (!query.trim()) return []
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    countrycodes: 'mx',
    addressdetails: '1',
  })
  const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
    headers: { 'Accept-Language': 'es' },
  })
  if (!res.ok) throw new Error('Error al buscar dirección')
  return res.json()
}

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ReverseResult> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
  })
  const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: { 'Accept-Language': 'es' },
  })
  if (!res.ok) throw new Error('Error al obtener dirección')
  return res.json()
}

export function formatAddress(s: Suggestion | ReverseResult): string {
  return s.display_name?.split(',')?.slice(0, 3)?.join(',') ?? s.display_name
}
