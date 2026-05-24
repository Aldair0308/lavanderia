
const ADDRESS = 'Av. Reforma 123, Col. Juárez';
const ADDRESS_FULL = 'Cuauhtémoc, CDMX — A dos cuadras del Ángel de la Independencia';
const GMAPS_URL = 'https://maps.google.com/maps?q=Av.+Reforma+123,+Col.+Juárez,+CDMX';
const WAZE_URL = 'https://waze.com/ul?ll=19.4284,-99.1488&navigate=yes';

function MapsIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function WazeIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm8 10c0 4.41-3.59 8-8 8s-8-3.59-8-8 3.59-8 8-8 8 3.59 8 8z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

/** Full section — for the Home page between How it works and CTA */
export function VisitSection() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-14">
          <span className="font-mono text-teal-600 text-xs uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <TagIcon />// ubicación
          </span>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 mb-2">
            Visítanos en persona
          </h2>
          <p className="text-stone-500 text-lg max-w-lg mx-auto">
            Si prefieres pasar directamente, estamos en el corazón de la colonia.
          </p>
        </div>

        <div className="bg-cream rounded-2xl border border-border/60 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-11 h-11 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
              <PinIcon />
            </div>
            <div>
              <h3 className="font-body font-semibold text-stone-900 text-base mb-0.5">
                {ADDRESS}
              </h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                {ADDRESS_FULL} Abierto de 7:00 a 21:00.
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <a
              href={GMAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: '#4285F4', color: 'white' }}
            >
              <MapsIcon />
              Google Maps
            </a>
            <a
              href={WAZE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm no-underline transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: '#33CCFF', color: '#0B0B0B' }}
            >
              <WazeIcon />
              Waze
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Compact row for the footer */
export function FooterMapsRow() {
  return (
    <div className="flex gap-2 mt-2">
      <a
        href={GMAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold no-underline hover:opacity-85 transition-opacity"
        style={{ background: '#4285F4', color: 'white' }}
      >
        <MapsIcon size={16} />
        Maps
      </a>
      <a
        href={WAZE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold no-underline hover:opacity-85 transition-opacity"
        style={{ background: '#33CCFF', color: '#0B0B0B' }}
      >
        <WazeIcon size={16} />
        Waze
      </a>
    </div>
  );
}

/** Card for OrderStatus when order is LISTO */
export function ArriveCard() {
  return (
    <div className="bg-cream rounded-xl border border-border p-5 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-[180px]">
        <p className="text-sm font-semibold text-stone-900">
          Tu pedido está listo 🎉
        </p>
        <p className="text-xs text-stone-500 mt-0.5">
          Pasa a recogerlo a nuestra sucursal. Te esperamos.
        </p>
      </div>
      <div className="flex gap-2">
        <a
          href={GMAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold no-underline transition-transform hover:-translate-y-0.5"
          style={{ background: '#4285F4', color: 'white' }}
        >
          <MapsIcon size={18} />
          Maps
        </a>
        <a
          href={WAZE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold no-underline transition-transform hover:-translate-y-0.5"
          style={{ background: '#33CCFF', color: '#0B0B0B' }}
        >
          <WazeIcon size={18} />
          Waze
        </a>
      </div>
    </div>
  );
}
