import { useOrders } from '../hooks/useOrders';

const KPI_CARD_CLASS = "card p-6 hover:shadow-md transition-shadow";
const KPI_ICON_CLASS = "flex h-10 w-10 items-center justify-center rounded-md";

export default function Dashboard() {
  const { data, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        Cargando métricas...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-red-600">
        Error al cargar métricas
      </div>
    );
  }

  const orders = (data as any[]) || [];
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const uniqueCustomers = new Set(orders.map((o) => o.customer?.id || o.id)).size;
  const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'pendiente').length;

  // Mock recent orders from the data (first 4)
  const recentOrders = orders.slice(0, 4);

  const statusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('proces') || s.includes('progress')) return 'badge-teal';
    if (s.includes('pend')) return 'badge-amber';
    if (s.includes('listo') || s.includes('ready') || s.includes('entreg')) return 'badge-emerald';
    return 'badge-gray';
  };

  const statusLabel = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('proces') || s.includes('progress')) return 'En proceso';
    if (s.includes('pend')) return 'Pendiente';
    if (s.includes('listo') || s.includes('ready')) return 'Listo';
    if (s.includes('entreg') || s.includes('deliver')) return 'Entregado';
    return status || '—';
  };

  return (
    <div>
      {/* Page title */}
      <h1 className="font-display text-2xl text-stone-900 mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className={KPI_CARD_CLASS}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Pedidos totales</span>
            <div className={`${KPI_ICON_CLASS} bg-teal-100 text-teal-600`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
          </div>
          <div className="font-mono text-3xl font-bold text-stone-900 leading-none mb-1">{totalOrders}</div>
          <div className="text-sm text-emerald-600 font-medium">↑ {Math.max(totalOrders, 1)} cargados</div>
        </div>

        <div className={KPI_CARD_CLASS}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Ingresos</span>
            <div className={`${KPI_ICON_CLASS} bg-emerald-100 text-emerald-600`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
          <div className="font-mono text-3xl font-bold text-stone-900 leading-none mb-1">${totalRevenue.toFixed(0)}</div>
          <div className="text-sm text-emerald-600 font-medium">Total acumulado</div>
        </div>

        <div className={KPI_CARD_CLASS}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Pendientes</span>
            <div className={`${KPI_ICON_CLASS} bg-amber-100 text-amber-600`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div className="font-mono text-3xl font-bold text-stone-900 leading-none mb-1">{pendingOrders}</div>
          <div className="text-sm text-amber-600 font-medium">Requieren atención</div>
        </div>

        <div className={KPI_CARD_CLASS}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-stone-500 uppercase tracking-wider">Clientes</span>
            <div className={`${KPI_ICON_CLASS} bg-violet-100 text-violet-600`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
          </div>
          <div className="font-mono text-3xl font-bold text-stone-900 leading-none mb-1">{uniqueCustomers}</div>
          <div className="text-sm text-violet-600 font-medium">Activos</div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="font-display text-xl text-stone-900">Pedidos recientes</h2>
          <a href="/orders" className="text-sm font-semibold text-teal-600 hover:text-teal-500 transition-colors">
            Ver todos →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">ID</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Servicio</th>
                <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Estado</th>
                <th className="text-right text-xs font-semibold text-stone-500 uppercase tracking-wider px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">No hay pedidos aún</td>
                </tr>
              ) : (
                recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-sm text-teal-600 font-semibold">#{order.id}</td>
                    <td className="px-4 py-3.5 text-base text-stone-900">{order.customer?.name || '—'}</td>
                    <td className="px-4 py-3.5 text-base text-stone-700">{order.service_type || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${statusBadge(order.status)}`}>
                        <span className={`status-dot ${order.status?.toLowerCase().includes('pend') ? 'status-dot-amber' : 'status-dot-green'}`} />
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-stone-900">${Number(order.total_price || 0).toFixed(0)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
