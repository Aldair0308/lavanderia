import { Link } from 'react-router-dom';
import { VisitSection, FooterMapsRow } from '../components/VisitMaps';

const services = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.848 1.849a2.25 2.25 0 0 1-1.59.659H7.638a2.25 2.25 0 0 1-1.591-.659L4.2 15.3m15.6 0a2.25 2.25 0 0 1 .659 1.591v2.034A2.25 2.25 0 0 1 18.225 21H5.775A2.25 2.25 0 0 1 3.525 18.925V16.89c0-.597.237-1.17.659-1.591" />
      </svg>
    ),
    bg: 'bg-blue-100 text-blue-600',
    title: 'Lavado',
    description: 'Lavado profesional con detergentes suaves y fragancia fresca. Tu ropa queda impecable.',
    price: '$24/kg',
    min: 'mínimo 5 kg',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
      </svg>
    ),
    bg: 'bg-amber-200 text-amber-600',
    title: 'Secado',
    description: 'Secado al aire o en máquina, según el tipo de prenda. Cuidamos cada fibra.',
    price: '$18/kg',
    min: 'mínimo 3 kg',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.242-2.182-1.327 7.868a2.25 2.25 0 0 1-2.227 1.932H6.562a2.25 2.25 0 0 1-2.227-1.932L3.008 8.318m17.484 0A2.25 2.25 0 0 0 18.75 6h-2.25m-9.002 0H5.25a2.25 2.25 0 0 0-2.248 2.318" />
      </svg>
    ),
    bg: 'bg-purple-100 text-purple-600',
    title: 'Planchado',
    description: 'Planchado profesional con vapor. Cada prenda queda lista para usar y colgar.',
    price: '$32/kg',
    min: 'mínimo 3 kg',
  },
];

const steps = [
  {
    number: '1',
    title: 'Solicita tu recolección',
    description: 'Elige la fecha, horario y dirección. Nosotros pasamos por tu ropa sin que salgas de casa.',
  },
  {
    number: '2',
    title: 'Nosotros nos encargamos',
    description: 'Lavamos, secamos y planchamos con el mayor cuidado. Recibirás actualizaciones en tiempo real.',
  },
  {
    number: '3',
    title: 'Recibe en tu puerta',
    description: 'Tu ropa limpia y doblada llega a tu domicilio en el horario que elegiste. ¡Así de fácil!',
  },
];

export default function Home() {
  return (
    <div className="font-body text-stone-900 bg-cream overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-teal-600/[0.07] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-amber-500/[0.07] rounded-full blur-3xl" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 w-full py-12 md:py-0">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Right side: card — order-first on mobile */}
            <div className="order-first md:order-last flex justify-center md:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="bg-white rounded-xl shadow-lg border border-border p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-display text-lg">M</div>
                    <div>
                      <p className="font-semibold text-stone-900 leading-tight">María González</p>
                      <p className="text-xs text-stone-500 font-mono">#LAV-2847</p>
                    </div>
                  </div>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between"><span className="text-stone-500">Servicio</span><span className="font-medium">Lavado + Planchado</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Cantidad</span><span className="font-medium">8 kg</span></div>
                    <div className="flex justify-between"><span className="text-stone-500">Total</span><span className="font-semibold text-stone-900">$192.00</span></div>
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                      En proceso
                    </span>
                  </div>
                </div>

                <div className="hidden md:block absolute -top-4 -right-6 bg-teal-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-md animate-float">
                  Recolectado ✓
                </div>
                <div className="hidden md:block absolute -bottom-3 -left-6 bg-white text-stone-900 text-xs font-medium px-3.5 py-2 rounded-lg shadow-md border border-border animate-float [animation-delay:1.5s]">
                  Entrega estimada: Hoy, 6:00 PM
                </div>
              </div>
            </div>

            {/* Left side: text */}
            <div className="text-center md:text-left space-y-6">
              <span className="inline-flex items-center gap-2 bg-teal-200/60 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
                Servicio disponible hoy
              </span>

              <h1 className="font-display leading-[1.1]" style={{ fontSize: 'clamp(2.75rem, 6vw, 4rem)' }}>
                Tu ropa limpia,{' '}
                <em className="text-teal-600 not-italic" style={{ fontStyle: 'italic' }}>sin moverte</em>
              </h1>

              <p className="text-stone-500 text-lg max-w-md mx-auto md:mx-0 leading-relaxed">
                Recogemos tu ropa, la lavamos con cuidado profesional y la entregamos en tu puerta. Rastrea tu pedido en tiempo real y dedica tu tiempo a lo que realmente importa.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link
                  to="/solicitud"
                  className="bg-teal-600 text-white px-6 py-3.5 rounded-lg font-semibold text-[0.9375rem] hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-lg transition-all text-center no-underline"
                >
                  Solicitar recolección →
                </Link>
                <Link
                  to="/servicios"
                  className="border border-border text-stone-700 px-6 py-3.5 rounded-lg font-semibold text-[0.9375rem] hover:bg-warm-gray hover:-translate-y-0.5 transition-all text-center no-underline"
                >
                  Ver cómo funciona
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="border-y border-border/60 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-5 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {[
            { value: '2,400+', label: 'Clientes satisfechos' },
            { value: '24h', label: 'Entrega promedio' },
            { value: '4.9', label: 'Calificación promedio' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-teal-600 text-4xl">{stat.value}</p>
              <p className="text-stone-500 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Services preview ─── */}
      <section className="bg-white py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <p className="font-mono text-teal-600 text-xs uppercase tracking-widest mb-3">// nuestros servicios</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 mb-12">Todo lo que tu ropa necesita</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((s) => (
              <div
                key={s.title}
                className="bg-cream rounded-lg p-6 border border-border/40 hover:border-teal-600 hover:-translate-y-1 transition-all cursor-default group"
              >
                <div className={`w-12 h-12 rounded-lg ${s.bg} flex items-center justify-center mb-4`}>
                  {s.icon}
                </div>
                <h3 className="font-display text-xl text-stone-900 mb-2">{s.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed mb-4">{s.description}</p>
                <p className="font-mono text-xs text-stone-500">
                  <span className="text-teal-600 font-semibold">{s.price}</span>
                  <span className="mx-1">/</span>
                  {s.min}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="bg-cream py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <p className="font-mono text-teal-600 text-xs uppercase tracking-widest mb-3">// cómo funciona</p>
          <h2 className="font-display text-3xl md:text-4xl text-stone-900 mb-4">Tres pasos y listo</h2>
          <p className="text-stone-500 text-lg max-w-lg mb-14">Sin complicaciones. Sin esperas. Tú pides, nosotros entregamos.</p>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-6 left-[16.666%] right-[16.666%] h-0.5 bg-gradient-to-r from-teal-600 via-teal-500 to-amber-500 rounded-full" />

            {steps.map((step) => (
              <div key={step.number} className="relative flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-display text-xl flex items-center justify-center mb-4 relative z-10 ring-4 ring-cream">
                  {step.number}
                </div>
                <h3 className="font-display text-xl text-stone-900 mb-2">{step.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Visítanos ─── */}
      <VisitSection />

      {/* ─── CTA ─── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-5">
          <div className="relative bg-gradient-to-br from-teal-600 to-teal-500 rounded-2xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl text-white mb-4">¿Listo para la ropa más limpia de tu vida?</h2>
              <p className="text-teal-200 text-lg mb-8 max-w-lg mx-auto">Agenda tu recolección en menos de un minuto y deja que nosotros nos encarguemos del resto.</p>
              <Link
                to="/solicitud"
                className="inline-block bg-white text-teal-600 px-8 py-3.5 rounded-lg font-semibold text-[0.9375rem] hover:-translate-y-0.5 hover:shadow-xl transition-all no-underline"
              >
                Solicitar recolección →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-stone-900 text-white">
        <div className="max-w-6xl mx-auto px-5 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center font-display text-base">L</div>
              <span className="font-display text-xl text-white">Lavandería OS</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-stone-500">
              <Link to="/servicios" className="hover:text-white transition-colors no-underline text-stone-500">Servicios</Link>
              <Link to="/solicitud" className="hover:text-white transition-colors no-underline text-stone-500">Solicitar</Link>
              <Link to="/pedido/LAV-2847" className="hover:text-white transition-colors no-underline text-stone-500">Seguimiento</Link>
              <a href="#" className="hover:text-white transition-colors no-underline text-stone-500">Términos</a>
              <a href="#" className="hover:text-white transition-colors no-underline text-stone-500">Privacidad</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-stone-700">
            <div className="text-center text-xs text-stone-500">
              © {new Date().getFullYear()} Lavandería OS. Todos los derechos reservados.
            </div>
            <FooterMapsRow />
          </div>
        </div>
      </footer>
    </div>
  );
}
