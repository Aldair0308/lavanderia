import { STORE, googleMapsUrl, wazeUrl } from '../lib/store-location';

function LogoMaps({ size = 20 }: { size?: number }) {
  return (
    <img
      src="/logos/Maps.jpg"
      alt="Google Maps"
      width={size}
      height={size}
      className="rounded-sm object-contain"
      style={{ width: size, height: size }}
    />
  );
}

function LogoWaze({ size = 20 }: { size?: number }) {
  return (
    <img
      src="/logos/Waze.png"
      alt="Waze"
      width={size}
      height={size}
      className="rounded-sm object-contain"
      style={{ width: size, height: size }}
    />
  );
}

function SvgPin({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}

// ──────────── MapLink — polymorphic external link ────────────

type Provider = 'maps' | 'waze';

interface MapLinkProps {
  provider: Provider;
  variant?: 'primary' | 'compact' | 'inline';
  className?: string;
}

const PROVIDER_META = {
  maps: {
    label: 'Abrir en Google Maps',
    short: 'Google Maps',
    href: googleMapsUrl,
    icon: LogoMaps,
    bg: 'bg-[#4285F4]',
    hover: 'hover:bg-[#3367D6]',
    text: 'text-white',
  },
  waze: {
    label: 'Abrir en Waze',
    short: 'Waze',
    href: wazeUrl,
    icon: LogoWaze,
    bg: 'bg-[#33CCFF]',
    hover: 'hover:bg-[#29B8E6]',
    text: 'text-[#0B0B0B]',
  },
} as const;

const VARIANT = {
  primary: 'px-5 py-3 rounded-lg text-sm gap-2',
  compact: 'px-3.5 py-2 rounded-lg text-xs gap-1.5',
  inline: 'px-3 py-1.5 rounded-lg text-xs gap-1.5',
} as const;

export function MapLink({ provider, variant = 'primary', className = '' }: MapLinkProps) {
  const m = PROVIDER_META[provider];
  const Icon = m.icon;

  return (
    <a
      href={m.href()}
      target="_blank"
      rel="noopener noreferrer"
      className={`${m.bg} ${m.text} ${m.hover} ${VARIANT[variant]}
        inline-flex items-center justify-center font-semibold no-underline
        transition-all hover:-translate-y-0.5 hover:shadow-md
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        focus-visible:ring-offset-white focus-visible:ring-teal-500
        ${className}`}
      aria-label={`Abrir ${m.label} con la dirección de la sucursal`}
    >
      <Icon size={variant === 'inline' ? 16 : variant === 'compact' ? 18 : 20} />
      {variant === 'primary' ? m.label : m.short}
    </a>
  );
}

// ──────────── A) VisitSection — Home page hero ────────────

export function VisitSection() {
  return (
    <section className="bg-white py-20 md:py-28" aria-labelledby="visit-heading">
      <div className="max-w-6xl mx-auto px-5">
        <header className="text-center mb-14">
          <span className="font-mono text-teal-600 text-xs uppercase tracking-widest inline-flex items-center gap-1.5 mb-3">
            <SvgPin size={14} />// ubicación
          </span>
          <h2 id="visit-heading" className="font-display text-3xl md:text-4xl text-stone-900 mb-2">
            Visítanos en persona
          </h2>
          <p className="text-stone-500 text-lg max-w-lg mx-auto leading-relaxed">
            Si prefieres pasar directamente, estamos en el corazón de la colonia.
          </p>
        </header>

        <div className="bg-cream rounded-2xl border border-border/60 p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-11 h-11 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0" aria-hidden="true">
              <SvgPin />
            </div>
            <div>
              <h3 className="font-body font-semibold text-stone-900 text-base mb-1">{STORE.address}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{STORE.addressFull}. {STORE.hours}.</p>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto" role="group" aria-label="Abrir en aplicación de mapas">
            <MapLink provider="maps" variant="primary" className="flex-1 md:flex-none" />
            <MapLink provider="waze" variant="primary" className="flex-1 md:flex-none" />
          </div>
        </div>
      </div>
    </section>
  );
}

// ──────────── B) FooterMapsRow — compact footer row ────────────

export function FooterMapsRow() {
  return (
    <div className="flex gap-2 mt-3" role="group" aria-label="Cómo llegar">
      <MapLink provider="maps" variant="inline" />
      <MapLink provider="waze" variant="inline" />
    </div>
  );
}

// ──────────── C) ArriveCard — order ready notice ────────────

export function ArriveCard() {
  return (
    <div className="bg-cream rounded-xl border border-border p-5 flex items-center gap-4 flex-wrap" role="complementary" aria-label="Instrucciones para recoger tu pedido">
      <div className="flex-1 min-w-[180px]">
        <p className="text-sm font-semibold text-stone-900">Tu pedido está listo 🎉</p>
        <p className="text-xs text-stone-500 mt-0.5">Pasa a recogerlo a nuestra sucursal: {STORE.address}. Te esperamos.</p>
      </div>
      <div className="flex gap-2">
        <MapLink provider="maps" variant="compact" />
        <MapLink provider="waze" variant="compact" />
      </div>
    </div>
  );
}
