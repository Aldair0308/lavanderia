import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';

export default function Customers() {
  const { data, isLoading, error, inactive } = useCustomers();
  const [tab, setTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-stone-500">Cargando clientes...</div>;
  }
  if (error) {
    return <div className="card p-6 text-red-600">Error al cargar clientes</div>;
  }

  const all: any[] = (data as any[]) || [];

  const filtered = all.filter((c) => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone_whatsapp?.includes(search);
    if (tab === 'inactive') {
      const isInactive = inactive.some((i: any) => i.id === c.id);
      return matchSearch && isInactive;
    }
    if (tab === 'active') {
      const isInactive = inactive.some((i: any) => i.id === c.id);
      return matchSearch && !isInactive;
    }
    return matchSearch;
  });

  const getInitials = (name: string) => (name || '??').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const colors = ['bg-teal-600', 'bg-amber-600', 'bg-violet-600', 'bg-emerald-600', 'bg-rose-600', 'bg-sky-600', 'bg-stone-500', 'bg-teal-500'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-stone-900">Clientes</h1>
        <div className="relative w-80">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-6 border-b-2 border-stone-100">
        {[
          { key: 'all' as const, label: 'Todos', count: all.length },
          { key: 'active' as const, label: 'Activos', count: all.length - inactive.length },
          { key: 'inactive' as const, label: 'Inactivos', count: inactive.length, warn: inactive.length > 0 },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-[2px] transition-colors bg-transparent font-body ${
              tab === t.key
                ? 'text-teal-600 border-teal-600 font-semibold'
                : 'text-stone-500 border-transparent hover:text-stone-700'
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-2xs font-semibold ${t.warn ? 'bg-amber-100 text-amber-600' : 'bg-stone-100 text-stone-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Customer grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center text-stone-500">No se encontraron clientes</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c: any, idx: number) => {
            const isInactive = inactive.some((i: any) => i.id === c.id);
            const daysInactive = c.last_order_at
              ? Math.floor((Date.now() - new Date(c.last_order_at).getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div key={c.id} className={`card p-6 hover:shadow-md transition-shadow ${isInactive ? 'border-amber-200' : ''}`}>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white font-semibold text-base flex-shrink-0 ${colors[idx % colors.length]}`}>
                    {getInitials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-stone-900 leading-tight">{c.name}</div>
                    <div className="font-mono text-sm text-stone-500 mt-0.5">{c.phone_whatsapp || '—'}</div>
                  </div>
                  <span className={`badge ${isInactive ? 'badge-amber' : 'badge-emerald'}`}>
                    {isInactive ? 'Inactivo' : 'Activo'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  <div>
                    <div className="text-2xs font-semibold text-stone-500 uppercase tracking-wider mb-0.5">Pedidos</div>
                    <div className="text-base font-medium text-stone-900">{c.total_orders || c.orders_count || '—'}</div>
                  </div>
                  <div>
                    <div className="text-2xs font-semibold text-stone-500 uppercase tracking-wider mb-0.5">Último</div>
                    <div className={`text-base font-medium ${isInactive ? 'text-amber-600' : 'text-stone-900'}`}>
                      {c.last_order_at ? new Date(c.last_order_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Nunca'}
                    </div>
                  </div>
                  {daysInactive && daysInactive > 30 && (
                    <div className="col-span-2">
                      <div className="text-2xs font-semibold text-stone-500 uppercase tracking-wider mb-0.5">Inactivo</div>
                      <div className="text-base font-medium text-amber-600">{daysInactive} días</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4 border-t border-stone-100">
                  <button className="btn btn-ghost text-sm py-2 px-3.5">Ver pedidos</button>
                  {isInactive ? (
                    <button className="btn btn-warm btn-sm">Reactivar</button>
                  ) : (
                    <button className="btn-sm bg-teal-100 text-teal-600 font-semibold rounded-md px-3.5 py-2 hover:bg-teal-500 hover:text-white transition-colors">Enviar mensaje</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
