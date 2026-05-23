import { useOrders } from '../hooks/useOrders';

export default function Dashboard() {
  const { data, isLoading, error } = useOrders();

  if (isLoading) return <p>Cargando métricas...</p>;
  if (error) return <p className="text-red-600">Error al cargar métricas</p>;

  const orders = data as any[];
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
  const uniqueCustomers = new Set(orders.map((o) => o.customer.id)).size;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-500">Pedidos totales</p>
          <p className="text-xl font-bold">{totalOrders}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-5 00">Ingresos</p>
          <p className="text-xl font-bold">${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-500">Clientes activos</p>
          <p className="text-xl font-bold">{uniqueCustomers}</p>
        </div>
      </div>
    </div>
  );
}
