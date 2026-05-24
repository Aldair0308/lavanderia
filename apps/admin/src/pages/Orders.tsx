import { useState } from 'react';
import { useOrders } from '../hooks/useOrders';

const statusBadge = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('proces') || s.includes('progress')) return 'badge-teal';
  if (s.includes('pend')) return 'badge-amber';
  if (s.includes('listo') || s.includes('ready') || s.includes('entreg')) return 'badge-emerald';
  if (s.includes('cancel')) return 'badge-red';
  return 'badge-gray';
};

const statusLabel = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('proces') || s.includes('progress')) return 'En proceso';
  if (s.includes('pend')) return 'Pendiente';
  if (s.includes('listo') || s.includes('ready')) return 'Listo';
  if (s.includes('entreg') || s.includes('deliver')) return 'Entregado';
  if (s.includes('cancel')) return 'Cancelado';
  return status || '—';
};

export default function Orders() {
  const { data, isLoading, error, changeStatus } = useOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-stone-500">Cargando pedidos...</div>;
  }
  if (error) {
    return <div className="card p-6 text-red-600">Error al cargar pedidos</div>;
  }

  const orders: any[] = (data as any[]) || [];

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.customer?.name?.toLowerCase().includes(search.toLowerCase()) || String(o.id).includes(search);
    const matchStatus = !statusFilter || (o.status?.toLowerCase() || '').includes(statusFilter.toLowerCase());
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <h1 className="font-display text-2xl text-stone-900 mb-6">Pedidos</h1>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-[340px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Buscar por cliente o #pedido..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10"
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="select w-auto">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="proces">En proceso</option>
          <option value="listo">Listo</option>
          <option value="entreg">Entregado</option>
        </select>
        <span className="text-sm text-stone-500">{filtered.length} pedidos</span>
      </div>

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Pedido</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Servicio</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-right text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Total</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-stone-500">No se encontraron pedidos</td></tr>
              ) : (
                paged.map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-sm text-teal-600 font-semibold">#{order.id}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white text-[10px] font-semibold flex-shrink-0">
                          {(order.customer?.name || '??').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-base text-stone-900">{order.customer?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-base text-stone-700">{order.service_type || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${statusBadge(order.status)}`}>
                        <span className={`status-dot ${order.status?.toLowerCase().includes('pend') ? 'status-dot-amber' : 'status-dot-green'}`} />
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-stone-900">${Number(order.total_price || 0).toFixed(0)}</td>
                    <td className="px-4 py-3.5">
                      <button
                        className="p-1.5 rounded-sm text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                        onClick={() => {
                          const nextStatus = order.status === 'pendiente' ? 'en_proceso' : order.status === 'en_proceso' ? 'listo' : 'pendiente';
                          changeStatus.mutate({ id: order.id, status: nextStatus });
                        }}
                        title="Cambiar estado"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 text-sm text-stone-500">
            <span>Mostrando {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} de {filtered.length}</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-2.5 py-1 rounded-sm border text-sm transition-colors ${page === i + 1 ? 'bg-teal-600 text-white border-teal-600' : 'border-stone-300 bg-white hover:bg-stone-100'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
