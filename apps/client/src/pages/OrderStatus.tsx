import { useState, lazy } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder } from '../hooks/useOrder';
import { useOrderStatusRealtime } from '../hooks/useOrderStatusRealtime';

const SceneCanvas = lazy(() => import('../components/three/SceneCanvas'));
const FabricBackground = lazy(() => import('../components/three/FabricBackground'));
const TimelineOrb = lazy(() => import('../components/three/TimelineOrb'));

const STEPS = [
  { key: 'PENDIENTE', label: 'Pendiente' },
  { key: 'RECOLECTANDO', label: 'Recolectando' },
  { key: 'EN_PROCESO', label: 'En proceso' },
  { key: 'LISTO', label: 'Listo' },
  { key: 'COMPLETADO', label: 'Completado' },
] as const;

function statusBadgeClasses(status: string) {
  switch (status) {
    case 'PENDIENTE':
      return 'bg-amber-200 text-amber-600';
    case 'RECOLECTANDO':
      return 'bg-blue-200 text-blue-600';
    case 'EN_PROCESO':
      return 'bg-teal-200 text-teal-600';
    case 'LISTO':
      return 'bg-emerald-200 text-emerald-600';
    case 'COMPLETADO':
      return 'bg-emerald-200 text-emerald-600';
    case 'CANCELADO':
      return 'bg-red-200 text-red-600';
    default:
      return 'bg-warm-gray text-stone-500';
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

function formatCurrency(value?: number) {
  if (value == null) return '$0.00';
  return `$${value.toFixed(2)}`;
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
        <p className="font-body text-red-600">Error al cargar pedido</p>
      </div>
    );
  }

  const order = data as any;
  const currentIdx = STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELADO';

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* ── Header ── */}
      <header className="relative bg-gradient-to-b from-warm-gray to-cream pt-20 pb-8 px-4 overflow-hidden">
        <SceneCanvas className="" fallback={<div />}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[2, 3, 4]} intensity={0.5} />
          <FabricBackground waveSpeed={0.15} waveAmplitude={0.06} segments={20} colorTop="#0D9488" colorBottom="#F2EDE7" />
        </SceneCanvas>
        <div className="max-w-2xl mx-auto">
          <nav className="font-body text-sm text-stone-500 mb-3">
            <Link to="/" className="hover:text-teal-600 transition-colors">
              Inicio
            </Link>
            <span className="mx-2">›</span>
            <span className="text-stone-700">Pedido</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl text-stone-900 leading-tight">
            Rastrea tu pedido
          </h1>
          <p className="mt-2 font-mono text-sm text-teal-600 tracking-wide">
            {order.id}
          </p>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 px-4 pb-24">
        <div className="max-w-2xl mx-auto space-y-6 -mt-2">
          {/* ── Card 1: Status + Timeline ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            {/* Customer info */}
            {order.customer && (
              <div className="px-6 pt-6 pb-4 border-b border-border flex flex-wrap gap-x-8 gap-y-1">
                <div>
                  <p className="text-xs font-body text-stone-500 uppercase tracking-wider mb-0.5">
                    Cliente
                  </p>
                  <p className="font-body font-medium text-stone-900">
                    {order.customer.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-body text-stone-500 uppercase tracking-wider mb-0.5">
                    Teléfono
                  </p>
                  <p className="font-body font-medium text-stone-900">
                    {order.customer.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Current status badge */}
            <div className="px-6 pt-5 pb-2">
              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-body font-semibold ${statusBadgeClasses(order.status)}`}
              >
                {isCancelled ? null : (
                  <span className="relative flex h-2.5 w-2.5">
                    <TimelineOrb
                      active={true}
                      completed={false}
                      position={[0, 0, 0]}
                    />
                    <span className="absolute inset-0 rounded-full bg-teal-600 animate-pulse-dot opacity-50" />
                  </span>
                )}
                {statusLabel(order.status)}
              </span>
            </div>

            {/* Timeline */}
            <div className="px-6 pt-4 pb-6">
              {isCancelled ? (
                <div className="flex items-center gap-3 py-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center text-red-600 text-lg">
                    ✕
                  </div>
                  <div>
                    <p className="font-body font-semibold text-red-600">
                      Pedido cancelado
                    </p>
                    <p className="text-xs font-body text-stone-500">
                      {formatDate(order.updated_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <ol className="relative">
                  {STEPS.map((step, idx) => {
                    const isCompleted = idx < currentIdx;
                    const isCurrent = idx === currentIdx;
                    const isLast = idx === STEPS.length - 1;

                    return (
                      <li key={step.key} className="flex gap-4">
                        {/* Circle + line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-body font-semibold border-2 transition-all ${
                              isCompleted
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : isCurrent
                                  ? 'bg-white border-teal-600 text-teal-600'
                                  : 'bg-white border-stone-300 text-stone-400'
                            }`}
                          >
                            {isCompleted ? (
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={3}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : isCurrent ? (
                              <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-pulse-dot" />
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-600" />
                              </span>
                            ) : (
                              <span>{idx + 1}</span>
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={`w-0.5 flex-1 min-h-[2rem] ${
                                isCompleted || isCurrent
                                  ? 'bg-teal-600'
                                  : 'bg-stone-200'
                              }`}
                            />
                          )}
                        </div>

                        {/* Label + timestamp */}
                        <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                          <p
                            className={`font-body text-sm font-semibold pt-2 ${
                              isCompleted || isCurrent
                                ? 'text-stone-900'
                                : 'text-stone-400'
                            }`}
                          >
                            {step.label}
                          </p>
                          <p className="text-xs font-body text-stone-400 mt-0.5">
                            {isCompleted || isCurrent
                              ? idx === 0
                                ? formatDate(order.created_at)
                                : 'Actualizado'
                              : 'Pendiente'}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </div>

          {/* ── Card 2: Order details ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            <div className="px-6 py-5 border-b border-border">
              <h2 className="font-display text-xl text-stone-900">
                Detalles del pedido
              </h2>
            </div>
            <div className="divide-y divide-border">
              <DetailRow label="Servicio" value={order.service_type} />
              <DetailRow
                label="Cantidad"
                value={order.quantity_kg ? `${order.quantity_kg} kg` : '—'}
              />
              <DetailRow
                label="Dirección de recolección"
                value={order.pickup_address}
              />
              <DetailRow
                label="Fecha de recolección"
                value={formatDate(order.pickup_scheduled_at)}
              />
              <DetailRow
                label="Entrega estimada"
                value={formatDate(order.delivered_at)}
              />
            </div>
            <div className="px-6 py-5 bg-cream/50">
              <p className="text-xs font-body text-stone-500 uppercase tracking-wider mb-1">
                Total
              </p>
              <p className="font-mono text-2xl text-teal-600 font-semibold">
                {formatCurrency(order.total_price)}
              </p>
            </div>
          </div>

          {/* ── Status history (collapsible) ── */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="w-full px-6 py-4 flex items-center justify-between font-body text-sm font-semibold text-stone-700 hover:bg-cream/30 transition-colors"
              >
                <span>Historial de cambios</span>
                <svg
                  className={`w-5 h-5 text-stone-400 transition-transform ${historyOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {historyOpen && (
                <div className="px-6 pb-5">
                  <table className="w-full text-xs font-body">
                    <thead>
                      <tr className="text-left text-stone-400 uppercase tracking-wider">
                        <th className="pb-2 font-medium">De</th>
                        <th className="pb-2 font-medium">A</th>
                        <th className="pb-2 font-medium">Por</th>
                        <th className="pb-2 font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {order.status_history.map(
                        (h: any, i: number) => (
                          <tr key={i} className="text-stone-700">
                            <td className="py-2 pr-2">
                              {statusLabel(h.from_status)}
                            </td>
                            <td className="py-2 pr-2 font-medium text-stone-900">
                              {statusLabel(h.to_status)}
                            </td>
                            <td className="py-2 pr-2 text-stone-500">
                              {h.changed_by ?? '—'}
                            </td>
                            <td className="py-2 whitespace-nowrap text-stone-500">
                              {formatDate(h.changed_at)}
                            </td>
                          </tr>
                        ),
                      )}
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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-500 transition-colors flex items-center justify-center"
        aria-label="Soporte"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.429 3 13.685 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      </button>

      {/* ── Footer ── */}
      <footer className="bg-stone-900 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-display text-lg text-cream">Lavandería OS</p>
          <p className="font-body text-xs text-stone-500 mt-1">
            Servicio de lavandería con recolección y entrega a domicilio
          </p>
        </div>
      </footer>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-4">
      <p className="text-sm font-body text-stone-500">{label}</p>
      <p className="text-sm font-body font-medium text-stone-900 text-right">
        {value ?? '—'}
      </p>
    </div>
  );
}
