import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { useOrderStatusRealtime } from '../hooks/useOrderStatusRealtime';
import { ArriveCard, FooterMapsRow } from '../components/VisitMaps';

const STEPS = [
  { key: 'PENDIENTE', label: 'Pendiente', desc: 'Pedido registrado exitosamente' },
  { key: 'RECOLECTANDO', label: 'Recolectando', desc: 'Repartidor en camino a tu domicilio' },
  { key: 'EN_PROCESO', label: 'En proceso', desc: 'Tu ropa está siendo lavada y planchada' },
  { key: 'LISTO', label: 'Listo', desc: 'Tu pedido está listo para recoger o entregar' },
  { key: 'COMPLETADO', label: 'Completado', desc: 'Pedido entregado. ¡Gracias por tu preferencia!' },
] as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function orderShortId(id: string) {
  return `#LAV-${id.slice(0, 4).toUpperCase()}`;
}

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'PENDIENTE': return 'bg-amber-100 text-amber-700';
    case 'RECOLECTANDO': return 'bg-blue-100 text-blue-700';
    case 'EN_PROCESO': return 'bg-teal-100 text-teal-700';
    case 'LISTO': return 'bg-emerald-100 text-emerald-700';
    case 'COMPLETADO': return 'bg-emerald-100 text-emerald-700';
    case 'CANCELADO': return 'bg-red-100 text-red-700';
    default: return 'bg-stone-100 text-stone-500';
  }
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDIENTE: 'Pendiente',
    RECOLECTANDO: 'Recolectando',
    EN_PROCESO: 'En proceso',
    LISTO: 'Listo',
    COMPLETADO: 'Completado',
    CANCELADO: 'Cancelado',
  };
  return map[status] ?? status;
}

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value?: number | string) {
  if (value == null) return '$0.00';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `$${num.toFixed(2)}`;
}

function StepIcon({ status }: { status: 'completed' | 'current' | 'pending' }) {
  if (status === 'completed') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (status === 'current') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

export default function OrderStatus() {
  const { id } = useParams();
  const { data, isLoading, error } = useOrder(id ?? '');
  useOrderStatusRealtime(id ?? '');
  const [historyOpen, setHistoryOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="font-body text-stone-500">Cargando pedido...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="font-body text-lg font-semibold text-stone-900 mb-1">No encontramos tu pedido</p>
          <p className="font-body text-sm text-stone-500 mb-6">Verifica el número de pedido o intenta más tarde.</p>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-3 font-body font-semibold text-white text-sm hover:bg-teal-500 transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const order: any = data;
  const currentIdx = STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELADO';
  const customer = order.customer;

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* ── Header ── */}
      <header className="bg-gradient-to-b from-warm-gray to-cream pt-20 pb-10 px-4">
        <div className="max-w-2xl mx-auto">
          <nav className="font-body text-sm text-stone-500 mb-4">
            <Link to="/" className="hover:text-teal-600 transition-colors">Inicio</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-700">Mi pedido</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl text-stone-900 leading-tight">
            Rastrea tu pedido
          </h1>
          <span className="mt-3 inline-block font-mono text-sm font-semibold text-teal-700 bg-teal-100 px-3 py-1 rounded-md tracking-wide">
            {orderShortId(order.id)}
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-5 -mt-2">
          {/* ── Card 1: Status + Timeline ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            {/* Card title */}
            <div className="px-6 pt-6 pb-0 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <h2 className="font-display text-lg text-stone-900">Estado del pedido</h2>
            </div>

            {/* Customer info */}
            {customer && (
              <div className="mx-6 mt-4 mb-4 pb-4 border-b border-border/60 flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-100 to-teal-50 flex items-center justify-center flex-shrink-0 font-display text-base text-teal-700">
                  {initials(customer.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-stone-900 text-sm">{customer.name}</p>
                  <p className="font-body text-xs text-stone-500 mt-0.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {customer.phone_whatsapp}
                  </p>
                </div>
              </div>
            )}

            <div className="px-6 pb-6">
              {/* Current status badge */}
              <div className={`inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 mb-7 ${statusBadgeClasses(order.status)}`}>
                <span className="relative flex h-3 w-3">
                  {!isCancelled && (
                    <span className="absolute inline-flex h-full w-full rounded-full opacity-30 bg-current animate-ping" />
                  )}
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-current" />
                </span>
                <span className="font-body font-bold text-sm tracking-wider uppercase">{statusLabel(order.status)}</span>
              </div>

              {/* Timeline */}
              {isCancelled ? (
                <div className="flex items-center gap-4 py-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center text-red-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-body font-semibold text-red-600">Pedido cancelado</p>
                    <p className="text-xs font-body text-stone-500 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isLast = idx === STEPS.length - 1;
                    const stepStatus = isCompleted ? 'completed' : isCurrent ? 'current' : 'pending';

                    return (
                      <div key={step.key} className="flex gap-4">
                        {/* Icon column */}
                        <div className="flex flex-col items-center">
                          <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold relative z-10 transition-all ${
                            stepStatus === 'completed'
                              ? 'bg-teal-600 text-white shadow-[0_0_0_4px_rgba(13,148,136,0.15)]'
                              : stepStatus === 'current'
                                ? 'bg-teal-600 text-white shadow-[0_0_0_4px_rgba(13,148,136,0.15),0_0_0_8px_rgba(13,148,136,0.07)]'
                                : 'bg-stone-200 text-stone-400 shadow-[0_0_0_4px_rgba(0,0,0,0.03)]'
                          }`}>
                            <StepIcon status={stepStatus} />
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 min-h-[1.5rem] ${
                              stepStatus === 'completed' ? 'bg-teal-600' : stepStatus === 'current' ? 'bg-gradient-to-b from-teal-600 to-stone-200' : 'bg-stone-200'
                            }`} />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`pb-7 ${isLast ? 'pb-0' : ''}`}>
                          <p className={`font-body text-sm font-semibold pt-1.5 ${
                            stepStatus === 'pending' ? 'text-stone-400' : 'text-stone-900'
                          }`}>
                            {step.label}
                          </p>
                          <p className="font-mono text-xs text-stone-400 mt-0.5">
                            {isCompleted || isCurrent
                              ? idx === 0
                                ? formatDate(order.created_at)
                                : formatDate(order.created_at)
                              : '—'}
                          </p>
                          {(isCompleted || isCurrent) && (
                            <p className="font-body text-xs text-stone-500 mt-1">{step.desc}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Arrive card when LISTO */}
              {(order.status === 'LISTO' || order.status === 'COMPLETADO') && (
                <div className="mt-4">
                  <ArriveCard />
                </div>
              )}
            </div>
          </div>

          {/* ── Card 2: Order details ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 pt-6 pb-0 flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </span>
              <h2 className="font-display text-lg text-stone-900">Detalles del pedido</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-body font-semibold text-stone-500 uppercase tracking-wider mb-1">Servicio</p>
                  <p className="font-body text-sm font-medium text-stone-900">{order.service_type}</p>
                </div>
                <div>
                  <p className="text-xs font-body font-semibold text-stone-500 uppercase tracking-wider mb-1">Cantidad</p>
                  <p className="font-mono text-sm font-medium text-stone-900">{order.quantity_kg ? `${order.quantity_kg} kg` : '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-body font-semibold text-stone-500 uppercase tracking-wider mb-1">Dirección de recolección</p>
                  <p className="font-body text-sm font-medium text-stone-900 flex items-start gap-1.5">
                    <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {order.pickup_address}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-body font-semibold text-stone-500 uppercase tracking-wider mb-1">Recolección programada</p>
                  <p className="font-body text-sm font-medium text-stone-900">{formatDate(order.pickup_scheduled_at)}</p>
                </div>
                <div>
                  <p className="text-xs font-body font-semibold text-stone-500 uppercase tracking-wider mb-1">Entrega estimada</p>
                  <p className="font-body text-sm font-medium text-stone-900">{formatDate(order.delivered_at)}</p>
                </div>
              </div>

              {/* Total */}
              <div className="mt-5 rounded-xl bg-gradient-to-r from-teal-50 to-teal-100/60 border border-teal-200/60 px-5 py-4 flex items-center justify-between">
                <span className="font-body font-semibold text-sm text-teal-700">Total</span>
                <span className="font-mono font-bold text-xl text-teal-600">{formatCurrency(order.total_price)}</span>
              </div>
            </div>
          </div>

          {/* ── Status history ── */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="w-full px-6 py-4 flex items-center justify-between gap-3 hover:bg-cream/30 transition-colors"
                aria-expanded={historyOpen}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </span>
                  <span className="font-body text-sm font-semibold text-stone-700">Historial de cambios</span>
                </div>
                <svg
                  className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${historyOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {historyOpen && (
                <div className="px-6 pb-5 overflow-hidden">
                  <table className="w-full text-xs font-body">
                    <thead>
                      <tr className="text-left text-stone-400 uppercase tracking-wider">
                        <th className="pb-2 pr-3 font-semibold">Cambio</th>
                        <th className="pb-2 pr-3 font-semibold">Por</th>
                        <th className="pb-2 font-semibold">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {order.status_history.map((h: any, i: number) => (
                        <tr key={i} className="text-stone-700">
                          <td className="py-2.5 pr-3">
                            <span className="text-stone-400">{statusLabel(h.from_status) || '—'}</span>
                            <span className="text-teal-600 font-semibold mx-1.5">&rarr;</span>
                            <span className="font-medium text-stone-900">{statusLabel(h.to_status)}</span>
                          </td>
                          <td className="py-2.5 pr-3">
                            <span className="font-mono text-xs text-stone-500">{h.changed_by ?? '—'}</span>
                          </td>
                          <td className="py-2.5 whitespace-nowrap font-mono text-xs text-stone-400">
                            {formatDate(h.changed_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Floating support button ── */}
      <button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-500 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 transition-all duration-200 flex items-center justify-center group"
        aria-label="Contactar soporte"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="absolute right-[66px] top-1/2 -translate-y-1/2 bg-stone-900 text-white text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Contactar soporte
        </span>
      </button>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-teal-600 flex items-center justify-center text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </span>
            <p className="font-display text-lg text-white">Lavandería OS</p>
          </div>
          <p className="font-body text-xs text-stone-500 mt-1">
            Servicio de lavandería con recolección y entrega a domicilio
          </p>
          <div className="flex items-center justify-center gap-6 mt-5 flex-wrap">
            <a href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">Términos</a>
            <a href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">Privacidad</a>
            <a href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">FAQ</a>
            <a href="#" className="text-xs text-stone-500 hover:text-stone-300 transition-colors">Soporte</a>
          </div>
          <div className="mt-4 flex justify-center">
            <FooterMapsRow />
          </div>
          <p className="font-body text-xs text-stone-600 mt-4">&copy; 2026 Lavandería OS. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
