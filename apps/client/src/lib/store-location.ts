export const STORE = {
  address: 'Av. Reforma 123, Col. Juárez',
  addressFull: 'Cuauhtémoc, CDMX — A dos cuadras del Ángel de la Independencia',
  hours: 'Abierto de 7:00 a 21:00',
  lat: 19.4284,
  lng: -99.1488,
} as const;

export function googleMapsUrl(): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(STORE.address)},+CDMX`;
}

export function wazeUrl(): string {
  return `https://waze.com/ul?ll=${STORE.lat},${STORE.lng}&navigate=yes`;
}
