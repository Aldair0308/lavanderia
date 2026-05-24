import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';

const PERIODS = ['7d', '30d', '3m', '12m'];

export default function Reports() {
  const { data, isLoading, error } = useOrders();
  const [period, setPeriod] = useState('30d');

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-stone-500">Cargando reportes...</div>;
  }
  if (error) {
    return <div className="card p-6 text-red-600">Error al cargar reportes</div>;
  }

  const orders: any[] = (data as any[]) || [];
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const totalOrders = orders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const uniqueCustomers = new Set(orders.map((o) => o.customer?.id || o.id)).size;

  // Service breakdown (mocked for visualization)
  const services = [
    { name: 'Lavado + Planchado', pct: 42, color: 'bg-teal-600', count: Math.round(totalOrders * 0.42) },
    { name: 'Solo lavado', pct: 28, color: 'bg-amber-600', count: Math.round(totalOrders * 0.28) },
    { name: 'Planchado premium', pct: 18, color: 'bg-violet-600', count: Math.round(totalOrders * 0.18) },
    { name: 'Servicio completo', pct: 12, color: 'bg-stone-500', count: Math.round(totalOrders * 0.12) },
  ];

  // Top customers (from orders)
  const customerMap = new Map<string, { name: string; count: number; total: number }>();
  orders.forEach((o) => {
    const id = o.customer?.id || 'unknown';
    const existing = customerMap.get(id) || { name: o.customer?.name || 'Desconocido', count: 0, total: 0 };
    existing.count += 1;
    existing.total += Number(o.total_price || 0);
    customerMap.set(id, existing);
  });
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const rankColors = ['bg-amber-100 text-amber-600', 'bg-stone-100 text-stone-500', 'bg-stone-200 text-amber-600', 'bg-stone-100 text-stone-500', 'bg-stone-100 text-stone-500'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-stone-900">Reportes</h1>
        <button className="btn-ghost">Exportar CSV</button>
      </div>

      {/* Period selector */}
      <div className="inline-flex gap-0.5 mb-6 bg-white rounded-md p-1 border border-stone-300">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors ${
              period === p ? 'bg-teal-600 text-white' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Ingresos totales', value: `$${totalRevenue.toFixed(0)}`, change: '↑ vs periodo anterior', up: true },
          { label: 'Pedidos', value: String(totalOrders), change: 'Período seleccionado', up: true },
          { label: 'Ticket promedio', value: `$${avgTicket.toFixed(0)}`, change: 'Por pedido', up: true },
          { label: 'Clientes únicos', value: String(uniqueCustomers), change: 'En el período', up: false },
        ].map((kpi) => (
          <div key={kpi.label} className="card p-5">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">{kpi.label}</div>
            <div className="font-mono text-2xl font-bold text-stone-900 leading-none">{kpi.value}</div>
            <div className={`text-xs mt-1 ${kpi.up ? 'text-emerald-600' : 'text-amber-600'}`}>{kpi.change}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-5 mb-5">
        {/* Revenue chart (placeholder bars) */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-xl text-stone-900">Ingresos por semana</h2>
          </div>
          <div className="card-body">
            <div className="flex items-end gap-6 h-[200px] pt-4">
              {[
                { h: 35, val: 2100, label: 'S1' },
                { h: 55, val: 3420, label: 'S2' },
                { h: 80, val: 5100, label: 'S3' },
                { h: 60, val: 3880, label: 'S4' },
                { h: 65, val: Math.round(totalRevenue * 0.25) || 3950, label: 'Actual' },
              ].map((bar, i) => (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="font-mono text-[11px] text-stone-600 font-semibold">${bar.val.toLocaleString()}</div>
                  <div
                    className={`w-full max-w-[48px] rounded-t-sm transition-all ${i === 3 ? 'bg-amber-600' : 'bg-teal-600'}`}
                    style={{ height: `${bar.h}%` }}
                  />
                  <div className="text-2xs text-stone-500 font-medium">{bar.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Service breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-xl text-stone-900">Servicios</h2>
          </div>
          <div className="card-body">
            {services.map((s) => (
              <div key={s.name} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-sm ${s.color} flex-shrink-0`} />
                    <span className="text-sm text-stone-700">{s.name}</span>
                  </div>
                  <span className="font-mono text-sm font-semibold text-stone-600">{s.pct}%</span>
                </div>
                <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top customers */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-xl text-stone-900">Top clientes</h2>
          </div>
          <div className="card-body">
            {topCustomers.length === 0 ? (
              <div className="text-center text-stone-500 py-4">Sin datos</div>
            ) : (
              topCustomers.map((c, i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-stone-100 last:border-b-0">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${rankColors[i] || rankColors[4]}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-medium text-stone-900">{c.name}</div>
                    <div className="text-xs text-stone-500">{c.count} pedidos</div>
                  </div>
                  <span className="font-mono text-base font-semibold text-stone-900">${c.total.toFixed(0)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Retention */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-display text-xl text-stone-900">Retención</h2>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="font-display text-4xl text-teal-600 leading-none">76%</div>
                <div className="text-xs text-stone-500 mt-1">Tasa de retención</div>
              </div>
              <div className="flex-1 space-y-3">
                {[
                  { label: 'Clientes recurrentes', pct: 76, color: 'bg-emerald-600' },
                  { label: 'En riesgo (>30d)', pct: 18, color: 'bg-amber-600' },
                  { label: 'Perdidos (>90d)', pct: 6, color: 'bg-red-600' },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-stone-600">{r.label}</span>
                      <span className="font-mono text-xs font-semibold text-stone-600">{r.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${r.color}`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


