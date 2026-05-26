import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { FooterMapsRow } from '../components/VisitMaps';

function serviceImage(name: string) {
  const n = name.toLowerCase();
  if (n.includes('lavado') && n.includes('planchado')) return '/services/completo.jpeg';
  if (n.includes('lavado') || n.includes('wash')) return '/services/lavado.png';
  if (n.includes('secado') || n.includes('dry')) return '/services/secado.png';
  if (n.includes('planchado') || n.includes('iron')) return '/services/planchado.png';
  return '/services/completo.jpeg';
}

function getDescription(name: string) {
  const n = name.toLowerCase();
  if (n.includes('lavado') || n.includes('wash'))
    return 'Lavado profesional con detergentes suaves que cuidan tus prendas y eliminan manchas difíciles.';
  if (n.includes('secado') || n.includes('dry'))
    return 'Secado controlado a temperatura óptima para mantener la forma y textura de cada prenda.';
  if (n.includes('planchado') || n.includes('iron'))
    return 'Planchado de precisión con vapor para un acabado impecable, listo para usar.';
  return 'Tratamiento profesional con atención al detalle para que tu ropa quede perfecta.';
}

const faqs = [
  {
    q: '¿Cuánto tarda el servicio?',
    a: 'El tiempo estándar es de 24 a 48 horas, dependiendo del tipo de servicio y la cantidad de prendas. Ofrecemos servicio express con entrega el mismo día por un costo adicional.',
  },
  {
    q: '¿Qué tipos de tela manejan?',
    a: 'Trabajamos con todo tipo de telas: algodón, lino, seda, poliéster, mezclillas y más. Cada prenda recibe el tratamiento adecuado según su material y las instrucciones de cuidado.',
  },
  {
    q: '¿Cómo se cobra?',
    a: 'El cobro se realiza por kilo de ropa o por prenda individual, según el servicio seleccionado. Puedes pagar en efectivo al recibir tu pedido o con tarjeta al momento de solicitar.',
  },
  {
    q: '¿Qué pasa si mi ropa se daña?',
    a: 'Contamos con una garantía de responsabilidad civil. En caso de daño imputable a nosotros, cubrimos el costo de reposición de la prenda conforme a nuestros términos y condiciones.',
  },
];

export default function Services() {
  const { services, isLoading, error } = useServices();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-stone-500 font-body">Cargando servicios…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-sm border border-border p-8 text-center max-w-sm">
          <svg className="w-12 h-12 text-amber-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-stone-700 font-body">Error al cargar el catálogo</p>
          <p className="text-stone-500 text-sm mt-1">Intenta de nuevo más tarde</p>
        </div>
      </div>
    );
  }

  const entries = Object.entries(services as Record<string, number>);

  return (
    <div className="min-h-screen bg-cream font-body">
      {/* ── Header ── */}
      <section className="bg-gradient-to-b from-warm-gray to-cream pt-12 pb-10">
        <div className="max-w-5xl mx-auto px-5">
          <nav className="flex items-center gap-2 text-sm text-stone-500 mb-6">
            <Link to="/" className="hover:text-teal-600 transition-colors">Inicio</Link>
            <span className="text-border">›</span>
            <span className="text-stone-700">Servicios</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl text-stone-900 leading-tight">
            Nuestros servicios
          </h1>
          <p className="mt-4 text-stone-500 text-lg max-w-2xl leading-relaxed">
            Cada prenda recibe tratamiento profesional con productos de la más alta calidad.
            Recolectamos, lavamos y entregamos en la puerta de tu hogar.
          </p>
        </div>
      </section>

      {/* ── Cards grid ── */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        {entries.length === 0 ? (
          <div className="bg-white rounded-xl border border-border p-10 text-center">
            <p className="text-stone-500">No hay servicios registrados por el momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entries.map(([name, price]) => (
              <div
                key={name}
                className="group bg-white rounded-2xl border border-border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-teal-600"
              >
                <div className="aspect-video overflow-hidden bg-cream">
                  <img
                    src={serviceImage(name)}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>

                <div className="p-6">
                  <h3 className="font-display text-xl text-stone-900 mb-2">{name}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed mb-4">
                    {getDescription(name)}
                  </p>
                  <div className="flex items-end justify-between">
                    <p className="font-mono text-2xl text-teal-600">
                      ${Number(price).toFixed(2)}
                      <span className="text-sm text-stone-500 ml-1">MXN</span>
                    </p>
                    <Link
                      to="/solicitud"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors no-underline"
                    >
                      Solicitar
                      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-5">
          <h2 className="font-display text-3xl text-stone-900 text-center mb-10">
            Preguntas frecuentes
          </h2>
          <div className="divide-y divide-border">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex items-center justify-between cursor-pointer list-none text-stone-900 font-medium text-[0.9375rem] hover:text-teal-600 transition-colors">
                  {q}
                  <span className="relative w-5 h-5 flex-shrink-0 ml-4">
                    <svg className="w-5 h-5 text-stone-400 transition-all duration-300 group-open:rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 text-stone-500 text-sm leading-relaxed pr-9">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 text-stone-500 py-12">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white font-display text-base">
                  L
                </div>
                <span className="font-display text-xl text-white">Lavandería OS</span>
              </div>
              <p className="text-sm max-w-xs leading-relaxed">
                Servicio profesional de lavandería con recolección y entrega a domicilio en toda la ciudad.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-8 md:gap-12">
              <div>
                <h4 className="text-white text-sm font-semibold mb-3">Navegación</h4>
                <ul className="space-y-2 text-sm list-none m-0 p-0">
                  <li><Link to="/" className="hover:text-white transition-colors no-underline text-stone-500">Inicio</Link></li>
                  <li><Link to="/servicios" className="hover:text-white transition-colors no-underline text-stone-500">Servicios</Link></li>
                  <li><Link to="/solicitud" className="hover:text-white transition-colors no-underline text-stone-500">Solicitar recolección</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white text-sm font-semibold mb-3">Contacto</h4>
                <ul className="space-y-2 text-sm list-none m-0 p-0">
                  <li>contacto@lavanderia.mx</li>
                  <li>+52 (55) 1234-5678</li>
                </ul>
                <FooterMapsRow />
              </div>
            </div>
          </div>
          <div className="border-t border-stone-700 mt-10 pt-6 text-xs text-center">
            © {new Date().getFullYear()} Lavandería OS. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
