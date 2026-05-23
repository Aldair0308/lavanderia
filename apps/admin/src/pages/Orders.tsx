import { useQuery } from '@tanstack/react-query';

const fetchOrders = async () => {
  const apiUrl = (import.meta as any).env.VITE_API_URL;
  const res = await fetch(`${apiUrl}/orders`);
  if (!res.ok) throw new Error('Error fetching orders');
  return res.json();
};

export default function Orders() {
  const { data, error, isLoading } = useQuery({ queryKey: ['orders'], queryFn: fetchOrders });

  if (isLoading) return <p>Cargando pedidos...</p>;
  if (error) return <p className="text-red-600">{(error as Error).message}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
      <ul className="space-y-2">
        {(data as any[]).map((order) => (
          <li key={order.id} className="p-4 bg-white rounded shadow">
            <p><strong>ID:</strong> {order.id}</p>
            <p><strong>Cliente:</strong> {order.customer.name}</p>
            <p><strong>Estado:</strong> {order.status}</p>
            <p><strong>Tipo:</strong> {order.service_type}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
